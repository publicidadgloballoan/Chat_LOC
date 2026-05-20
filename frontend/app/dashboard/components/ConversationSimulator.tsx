import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Smartphone, RotateCcw, CheckCircle2, Zap } from 'lucide-react';

interface SimMessage {
  role: 'bot' | 'user';
  text: string;
  buttons?: { label: string; value: string }[];
}

interface SimulatorConfig {
  type: 'a1' | 'a3' | 'flow' | 'identity';
  config: any;
}

interface Props {
  simulatorConfig: SimulatorConfig | null;
  onClose: () => void;
}

// ────────────────────────────────────────────────────────────
// Pure engine helpers (not hooks — called from event handlers)
// ────────────────────────────────────────────────────────────

function getA1InitialMessages(config: any): SimMessage[] {
  const opciones: any[] = config?.opciones_menu || [];
  const saludo = config?.saludo_inicial || ('¡Hola! ¿En qué te puedo ayudar?\n' + opciones.map((o: any) => `${o.numero}️⃣ ${o.nombre}`).join('\n'));
  return [{
    role: 'bot',
    text: saludo,
    buttons: opciones.map((o: any) => ({ label: `${o.numero}. ${o.nombre}`, value: String(o.numero) })),
  }];
}

function getA1Response(config: any, input: string): SimMessage {
  const opciones: any[] = config?.opciones_menu || [];
  const normalized = input.trim().toLowerCase();
  const found = opciones.find(
    (o: any) =>
      String(o.numero) === normalized ||
      o.nombre?.toLowerCase().includes(normalized) ||
      o.trigger?.toLowerCase() === normalized
  );
  if (found) {
    return { role: 'bot', text: found.respuesta || found.referencia || `Procesando opción: ${found.nombre}...` };
  }
  const menuText = opciones.map((o: any) => `${o.numero}️⃣ ${o.nombre}`).join('\n');
  return { role: 'bot', text: `No reconocí esa opción. Por favor elegí:\n\n${menuText}` };
}

function getA3InitialMessages(config: any): SimMessage[] {
  const instrucciones = config?.instrucciones_ia || 'Por favor completá los siguientes datos:';
  const templates: any[] = config?.templates || [];
  const firstQ = templates[0] ? `Primero indicame tu **${templates[0].nombre}**:` : '¡No hay campos configurados!';
  return [
    { role: 'bot', text: `¡Hola! ${instrucciones}` },
    { role: 'bot', text: firstQ },
  ];
}

function getA3Response(config: any, input: string, step: number): { msg: SimMessage; nextStep: number } {
  const templates: any[] = config?.templates || [];
  const nextStep = step + 1;
  if (nextStep >= templates.length) {
    return { msg: { role: 'bot', text: `✅ ¡Gracias! Datos registrados. Fin de la captura.` }, nextStep };
  }
  const t = templates[nextStep];
  const hint = t.tipo === 'Email' ? ' (ej: nombre@mail.com)' : t.tipo === 'Teléfono' ? ' (ej: +54911...)' : '';
  return { msg: { role: 'bot', text: `Perfecto. Ahora indicame tu **${t.nombre}**${hint}:` }, nextStep };
}

const TYPE_EMOJI: Record<string, string> = {
  webhook: '🚀', identity: '📋', buttons: '🔘', rag: '🧠',
  ticket: '🎫', vision: '👁️', approval: '⏸️', media: '📎',
  decision: '🔀', ai_branch: '⚡',
};

// Returns outgoing edges for a node
function getOutgoingEdges(config: any, nodeId: string) {
  return (config?.edges || []).filter((e: any) => e.source === nodeId);
}

// Builds the SimMessage for a given node, including branch buttons if applicable
function buildNodeMessage(config: any, node: any): SimMessage {
  const label = node.name || node.data?.label || node.type;
  const emoji = TYPE_EMOJI[node.type] || '📦';
  const outgoing = getOutgoingEdges(config, node.id);

  // For branching nodes (multiple edges), show each target as a button
  if (outgoing.length > 1) {
    const nodes: any[] = config?.nodes || [];
    const buttons = outgoing.map((e: any, idx: number) => {
      const targetNode = nodes.find((n: any) => n.id === e.target);
      const targetLabel = targetNode?.name || targetNode?.data?.label || `Opción ${idx + 1}`;
      return { label: `${idx + 1}. ${targetLabel}`, value: e.target }; // value = targetNodeId
    });
    return {
      role: 'bot',
      text: `${emoji} **${label}**\n${node.description || 'Seleccioná una opción:'}`,
      buttons,
    };
  }

  // Single or no edge: show description and wait for any input to advance
  const needsInput = ['identity', 'approval', 'ticket'].includes(node.type);
  const hint = needsInput ? '\n\n_Escribí tu respuesta para continuar..._' : (outgoing.length === 1 ? '\n\n_Escribí cualquier cosa para continuar..._' : '');
  return {
    role: 'bot',
    text: `${emoji} **${label}**\n${node.description || ''}${hint}`,
    buttons: undefined,
  };
}

function getFlowInitialMessages(config: any): { messages: SimMessage[]; startNodeId: string | null } {
  const nodes: any[] = config?.nodes || [];
  const startNode = nodes.find((n: any) => n.type === 'webhook') || nodes[0];
  if (!startNode) return { messages: [{ role: 'bot', text: 'Este flujo no tiene nodos configurados.' }], startNodeId: null };
  return {
    messages: [
      { role: 'bot', text: `🚀 **Flujo: ${config?.name || 'Sin nombre'}**\nSimulación iniciada. Respondé como si fueras el cliente.` },
      buildNodeMessage(config, startNode),
    ],
    startNodeId: startNode.id,
  };
}

// Called when user sends a message or clicks a branch button
function getFlowResponse(
  config: any,
  currentNodeId: string,
  userInput: string, // may be a target nodeId when clicking a branch button
): { msg: SimMessage; nextNodeId: string | null } {
  const nodes: any[] = config?.nodes || [];
  const outgoing = getOutgoingEdges(config, currentNodeId);

  if (outgoing.length === 0) {
    return { msg: { role: 'bot', text: '✅ **Fin del flujo.** El cliente habría completado este camino.' }, nextNodeId: null };
  }

  // If the userInput matches a targetNodeId (branch button clicked), go directly there
  const branchEdge = outgoing.find((e: any) => e.target === userInput);
  const edge = branchEdge || outgoing[0]; // fallback to first edge

  const nextNode = nodes.find((n: any) => n.id === edge.target);
  if (!nextNode) return { msg: { role: 'bot', text: '✅ Fin del flujo.' }, nextNodeId: null };

  return { msg: buildNodeMessage(config, nextNode), nextNodeId: nextNode.id };
}

// ────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────

export default function ConversationSimulator({ simulatorConfig, onClose }: Props) {
  const [messages, setMessages] = useState<SimMessage[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0); // For A3 field index or flow node tracking
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Initialize based on type
  useEffect(() => {
    if (!simulatorConfig) return;
    setStep(0);
    setIsFinished(false);

    if (simulatorConfig.type === 'a1') {
      setMessages(getA1InitialMessages(simulatorConfig.config));
    } else if (simulatorConfig.type === 'a3') {
      setMessages(getA3InitialMessages(simulatorConfig.config));
    } else if (simulatorConfig.type === 'flow') {
      const { messages: initMsgs, startNodeId } = getFlowInitialMessages(simulatorConfig.config);
      setMessages(initMsgs);
      setCurrentNodeId(startNodeId);
    } else {
      setMessages([{ role: 'bot', text: `Modo de simulación para "${simulatorConfig.type}" activo. Escribí algo para probar.` }]);
    }
  }, [simulatorConfig]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (userText?: string) => {
    const text = (userText ?? input).trim();
    if (!text || isFinished) return;

    const userMsg: SimMessage = { role: 'user', text };
    setInput('');
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      if (!simulatorConfig) return;

      if (simulatorConfig.type === 'a1') {
        setMessages(prev => [...prev, getA1Response(simulatorConfig.config, text)]);

      } else if (simulatorConfig.type === 'a3') {
        const { msg, nextStep } = getA3Response(simulatorConfig.config, text, step);
        setMessages(prev => [...prev, msg]);
        setStep(nextStep);
        if (nextStep >= (simulatorConfig.config?.templates?.length || 0)) setIsFinished(true);

      } else if (simulatorConfig.type === 'flow') {
        // text is a plain user message — advance linearly from current node
        const { msg, nextNodeId } = getFlowResponse(simulatorConfig.config, currentNodeId || '', text);
        setMessages(prev => [...prev, msg]);
        setCurrentNodeId(nextNodeId);
        if (!nextNodeId) setIsFinished(true);

      } else {
        setMessages(prev => [...prev, { role: 'bot', text: `Echo: "${text}"` }]);
      }
    }, 400);
  };

  // Handles clicking a branch button in a flow node (value = targetNodeId)
  const handleBranchClick = (btn: { label: string; value: string }) => {
    if (!simulatorConfig || simulatorConfig.type !== 'flow') return;
    // Show the selected option label as user message
    setMessages(prev => [...prev, { role: 'user', text: btn.label }]);
    setTimeout(() => {
      const { msg, nextNodeId } = getFlowResponse(simulatorConfig.config, currentNodeId || '', btn.value);
      setMessages(prev => [...prev, msg]);
      setCurrentNodeId(nextNodeId);
      if (!nextNodeId) setIsFinished(true);
    }, 400);
  };

  const handleReset = () => {
    setStep(0);
    setIsFinished(false);
    setCurrentNodeId(null);
    setInput('');
    if (!simulatorConfig) return;
    if (simulatorConfig.type === 'a1') {
      setMessages(getA1InitialMessages(simulatorConfig.config));
    } else if (simulatorConfig.type === 'a3') {
      setMessages(getA3InitialMessages(simulatorConfig.config));
    } else if (simulatorConfig.type === 'flow') {
      const { messages: initMsgs, startNodeId } = getFlowInitialMessages(simulatorConfig.config);
      setMessages(initMsgs);
      setCurrentNodeId(startNodeId);
    }
  };

  const typeLabels: Record<string, string> = {
    a1: 'Botonera A1',
    a3: 'Template A3',
    flow: 'Flujo IA',
    identity: 'Identidad del Bot',
  };

  if (!simulatorConfig) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed bottom-24 right-6 z-[60] w-[360px] h-[560px] flex flex-col overflow-hidden rounded-[2rem] shadow-2xl shadow-black/60"
        style={{ border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(2,6,23,0.97)', backdropFilter: 'blur(24px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <Smartphone size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-black text-white uppercase tracking-widest">Simulador</p>
              <p className="text-[8px] font-bold text-white/60 uppercase">{typeLabels[simulatorConfig.type] || simulatorConfig.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Reiniciar simulación"
              className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all"
            >
              <RotateCcw size={12} className="text-white/70" />
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 bg-white/10 hover:bg-red-500/60 rounded-lg flex items-center justify-center transition-all"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        </div>

        {/* Device frame bar */}
        <div className="h-2 bg-gradient-to-r from-indigo-800 to-purple-800 shrink-0" />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                  <Zap size={10} className="text-white" />
                </div>
              )}
              <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                {/* Bold text rendering */}
                <div
                  className={`px-4 py-3 rounded-2xl text-[11px] font-medium leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white/8 text-white/90 rounded-bl-none border border-white/8'
                  }`}
                  style={msg.role === 'bot' ? { background: 'rgba(255,255,255,0.07)' } : {}}
                  dangerouslySetInnerHTML={{
                    __html: msg.text
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/_(.*?)_/g, '<em class="text-indigo-300">$1</em>')
                  }}
                />
                {/* Quick-reply buttons */}
                {msg.buttons && msg.buttons.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1 w-full">
                    {msg.buttons.map((btn, bi) => (
                      <button
                        key={bi}
                        onClick={() => simulatorConfig?.type === 'flow' ? handleBranchClick(btn) : handleSend(btn.value)}
                        className="w-full text-left px-3 py-2 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded-xl text-[10px] font-bold hover:bg-indigo-500/35 hover:border-indigo-400/50 transition-all active:scale-[0.98]"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isFinished && (
            <div className="flex justify-center py-3">
              <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/30 rounded-2xl px-4 py-2">
                <CheckCircle2 size={14} className="text-green-400" />
                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Simulación Completada</span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-black/30 border-t border-white/5 shrink-0">
          <div className="flex gap-2 items-center">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={isFinished ? 'Reiniciá para probar de nuevo' : 'Escribí como si fueras el cliente...'}
              disabled={isFinished}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] text-white placeholder:text-white/30 outline-none focus:border-indigo-500/60 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isFinished}
              className="w-9 h-9 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 rounded-xl flex items-center justify-center transition-all active:scale-90"
            >
              <Send size={13} className="text-white" />
            </button>
          </div>
          <p className="text-center text-[8px] font-bold text-white/20 mt-2 uppercase tracking-widest">
            Simulación local · No envía mensajes reales
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
