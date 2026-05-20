import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Paperclip, ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';

interface SetupCopilotProps {
  activeTab: string;
  selectedChannel?: any;
  onApplyAction?: (action: any) => void;
}

export default function SetupCopilot({ activeTab, selectedChannel, onApplyAction }: SetupCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Context-aware greeting
  useEffect(() => {
    const greetings: Record<string, string> = {
      'Botones A1': '¡Hola! Te voy a ayudar a configurar los botones del menú principal (A1). ¿Qué opciones querés darle a tus clientes cuando escriben por primera vez?',
      'Entrenamiento': 'Soy tu asistente de Entrenamiento. Podés decirme qué reglas de negocio querés enseñar a la IA, o subir un PDF/Excel con tu stock, listas de precios, o preguntas frecuentes, y yo lo proceso.',
      'Identidad & Misión': 'Hola, hablemos de la Identidad de tu bot. ¿Cuál es la misión principal de tu negocio y qué tono de voz querés que use? (Ej: Amable, corporativo, chistoso).',
      'Flujos IA': '¡Bienvenido al Editor de Flujos! Decime paso a paso cómo querés guiar la conversación (Ej: "Paso 1: Saludar y dar opciones 1 a 3. Paso 2: Si elige 1, pedir email..."). Yo armo los nodos por vos.',
      'Logística & Entregas': 'Hola. ¿Cuáles son tus zonas de cobertura, días de entrega y costos de envío? Pasame la info y lo configuro.'
    };

    const greeting = greetings[activeTab] || `Hola, soy tu Copilot. Estoy acá para ayudarte a configurar la sección de ${activeTab}. ¿En qué te ayudo?`;

    setMessages([{ role: 'assistant', content: greeting }]);
    
    // Auto-open if navigating to a complex config tab
    if (Object.keys(greetings).includes(activeTab) && !isOpen) {
      setIsOpen(true);
    }
  }, [activeTab]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      // Future: Call backend LLM endpoint here. For now, mock a response
      const token = localStorage.getItem('PICE SaaS_token');
      const apiHost = window.location.hostname;
      
      const res = await axios.post(`http://${apiHost}:4000/api/copilot`, {
        message: userMsg,
        history: messages,
        context: activeTab,
        instance: selectedChannel?.instanceName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
        
        // If the LLM returned an action to apply
        if (res.data.action && onApplyAction) {
          onApplyAction(res.data.action);
        }
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (e: any) {
      console.error("Copilot Error:", e);
      // Fallback UI response until backend is implemented
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: `Entendido. Aún estoy aprendiendo a hacer esto en la sección de ${activeTab}, pronto podré conectarme a la IA central para configurar esto automáticamente.` }]);
        setIsLoading(false);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[380px] h-[550px] mb-4 bg-slate-900/95 backdrop-blur-xl border border-sky-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-sky-600 to-indigo-700 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <Sparkles size={20} className="text-yellow-300" />
                <h3 className="font-bold text-sm">PICE Setup Copilot</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-sky-600 text-white rounded-br-none' 
                      : 'bg-white/10 text-slate-200 rounded-bl-none border border-white/5'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none border border-white/5 flex items-center gap-2">
                    <Loader2 size={16} className="text-sky-400 animate-spin" />
                    <span className="text-xs text-slate-400">Pensando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-black/20">
              <div className="relative flex items-center">
                <button className="absolute left-2 text-slate-400 hover:text-sky-400 transition-colors p-2">
                  <Paperclip size={18} />
                </button>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribí un mensaje..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-colors"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 text-sky-400 hover:text-sky-300 disabled:text-slate-600 disabled:hover:text-slate-600 p-2 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-sky-500/25 transition-all group relative"
      >
        <Bot size={24} className="text-white group-hover:animate-pulse" />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
