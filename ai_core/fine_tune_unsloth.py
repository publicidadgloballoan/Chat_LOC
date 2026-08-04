"""
Script de Fine-Tuning para Llama-3 usando Unsloth (Optimizado para Ollama)
Requiere GPU NVIDIA y la libreria Unsloth instalada:
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
"""

import json
from datasets import Dataset
from unsloth import FastLanguageModel
from trl import SFTTrainer
from transformers import TrainingArguments

# 1. Cargar el modelo base
max_seq_length = 2048
dtype = None 
load_in_4bit = True

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/llama-3-8b-Instruct-bnb-4bit",
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)

model = FastLanguageModel.get_peft_model(
    model,
    r = 16, 
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj",],
    lora_alpha = 16,
    lora_dropout = 0,
    bias = "none",
    use_gradient_checkpointing = "unsloth",
    random_state = 3407,
)

# 2. Formatear Dataset
prompt_template = """<|begin_of_text|><|start_header_id|>system<|end_header_id|>

Eres un asistente de ventas experto. Tu tarea es vender mascotas.
<|eot_id|><|start_header_id|>user<|end_header_id|>

{}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

{}<|eot_id|>"""

# Leer el dataset generado
def format_dataset(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    texts = []
    current_user = ""
    for line in lines:
        turn = json.loads(line)
        if turn["role"] == "user":
            current_user = turn["content"]
        elif turn["role"] == "assistant":
            texts.append(prompt_template.format(current_user, turn["content"]))
            
    return Dataset.from_dict({"text": texts})

dataset = format_dataset("C:/SaaSIA/ai_core/dataset_ventas.jsonl")

# 3. Entrenar el modelo
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    dataset_num_proc = 2,
    packing = False,
    args = TrainingArguments(
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        warmup_steps = 5,
        max_steps = 60,
        learning_rate = 2e-4,
        fp16 = not True,
        bf16 = True,
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.01,
        lr_scheduler_type = "linear",
        seed = 3407,
        output_dir = "outputs",
    ),
)

print("Iniciando Fine-Tuning con Unsloth...")
trainer_stats = trainer.train()

# 4. Guardar modelo en formato GGUF para OLLAMA
print("Exportando a GGUF (Q4_K_M) para Ollama...")
model.save_pretrained_gguf("model_ollama_ventas", tokenizer, quantization_method = "q4_k_m")
print("Completado! El archivo GGUF est listo para importarse a Ollama.")
