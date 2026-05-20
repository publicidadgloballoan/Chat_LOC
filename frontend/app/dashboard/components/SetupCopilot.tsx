import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Loader2, Play, Trash2, RotateCcw } from 'lucide-react';
import axios from 'axios';
import ConversationSimulator from './ConversationSimulator';

interface SetupCopilotProps {
  activeTab: string;
  selectedChannel?: any;
  onApplyAction?: (action: any) => void;
  currentConfig?: any;
}

interface SimulatorConfig {
  type: 'a1' | 'a3' | 'flow' | 'identity';
  config: any;
}

export default function SetupCopilot({ activeTab, selectedChannel, onApplyAction, currentConfig }: SetupCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string, action?: any, applied?: boolean}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [simulatorConfig, setSimulatorConfig] = useState<SimulatorConfig | null>(null);
  const [pendingSimAction, setPendingSimAction] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load saved history or fallback to context-aware greeting
  useEffect(() => {
    const greetings: Record<string, string> = {
      'Botones A1': '¡Hola! Te voy a ayudar a configurar los botones del menú principal (A1). ¿Qué opciones querés darle a tus clientes cuando escriben por primera vez?',
      'Tickets A3': '¡Hola! Soy tu asistente de Templates A3. Decime qué datos querés capturar de tus clientes (nombre, email, teléfono, etc.) y con qué tono debe pedirlos la IA. Yo armo la estructura automáticamente.',
      'Entrenamiento': 'Soy tu asistente de Entrenamiento. Podés decirme qué reglas de negocio querés enseñar a la IA, o subir un PDF/Excel con tu stock, listas de precios, o preguntas frecuentes, y yo lo proceso.',
      'Identidad & Misión': 'Hola, hablemos de la Identidad de tu bot. ¿Cuál es la misión principal de tu negocio y qué tono de voz querés que use? (Ej: Amable, corporativo, chistoso).',
      'Flujos IA': '¡Bienvenido al Editor de Flujos! Decime paso a paso cómo querés guiar la conversación y te armo el flow con nodos automáticamente. Por ejemplo: "Quiero un flujo que salude, muestre 3 opciones, y si elige soporte abra un ticket".',
      'Logística & Entregas': 'Hola. ¿Cuáles son tus zonas de cobertura, días de entrega y costos de envío? Pasame la info y lo configuro.'
    };

    const storageKey = `pice_copilot_history_${activeTab.replace(/\s+/g, '_')}_${selectedChannel?.instanceName || 'default'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        const greeting = greetings[activeTab] || `Hola, soy tu Copilot. Estoy acá para ayudarte a configurar la sección de ${activeTab}. ¿En qué te ayudo?`;
        setMessages([{ role: 'assistant', content: greeting }]);
      }
    } else {
      const greeting = greetings[activeTab] || `Hola, soy tu Copilot. Estoy acá para ayudarte a configurar la sección de ${activeTab}. ¿En qué te ayudo?`;
      setMessages([{ role: 'assistant', content: greeting }]);
    }
    
    // Auto-open if navigating to a complex config tab
    if (Object.keys(greetings).includes(activeTab) && !isOpen) {
      setIsOpen(true);
    }
  }, [activeTab, selectedChannel]);

  // Save history on changes
  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = `pice_copilot_history_${activeTab.replace(/\s+/g, '_')}_${selectedChannel?.instanceName || 'default'}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, activeTab, selectedChannel]);

  const handleResetChat = () => {
    const greetings: Record<string, string> = {
      'Botones A1': '¡Hola! Te voy a ayudar a configurar los botones del menú principal (A1). ¿Qué opciones querés darle a tus clientes cuando escriben por primera vez?',
      'Tickets A3': '¡Hola! Soy tu asistente de Templates A3. Decime qué datos querés capturar de tus clientes (nombre, email, teléfono, etc.) y con qué tono debe pedirlos la IA. Yo armo la estructura automáticamente.',
      'Entrenamiento': 'Soy tu asistente de Entrenamiento. Podés decirme qué reglas de negocio querés enseñar a la IA, o subir un PDF/Excel con tu stock, listas de precios, o preguntas frecuentes, y yo lo proceso.',
      'Identidad & Misión': 'Hola, hablemos de la Identidad de tu bot. ¿Cuál es la misión principal de tu negocio y qué tono de voz querés que use? (Ej: Amable, corporativo, chistoso).',
      'Flujos IA': '¡Bienvenido al Editor de Flujos! Decime paso a paso cómo querés guiar la conversación y te armo el flow con nodos automáticamente. Por ejemplo: "Quiero un flujo que salude, muestre 3 opciones, y si elige soporte abra un ticket".',
      'Logística & Entregas': 'Hola. ¿Cuáles son tus zonas de cobertura, días de entrega y costos de envío? Pasame la info y lo configuro.'
    };
    const storageKey = `pice_copilot_history_${activeTab.replace(/\s+/g, '_')}_${selectedChannel?.instanceName || 'default'}`;
    localStorage.removeItem(storageKey);
    const greeting = greetings[activeTab] || `Hola, soy tu Copilot. Estoy acá para ayudarte a configurar la sección de ${activeTab}. ¿En qué te ayudo?`;
    setMessages([{ role: 'assistant', content: greeting }]);
  };

  const typeToSimType = (type: string): SimulatorConfig['type'] => {
    if (type === 'a1') return 'a1';
    if (type === 'a3') return 'a3';
    if (type === 'flow') return 'flow';
    return 'identity';
  };

  const handleApplyAndOffer = (action: any, msgIndex: number) => {
    // 1. Apply the action via parent callback
    if (onApplyAction) onApplyAction(action);

    // 2. Mark message as applied
    setMessages(prev => prev.map((msg, idx) => idx === msgIndex ? { ...msg, applied: true } : msg));

    // 3. If simulatable type, offer to simulate
    const simulatable = ['a1', 'a3', 'flow'];
    if (action.action === 'save_config' && simulatable.includes(action.type)) {
      setPendingSimAction(action);
      // Add offer message after a short delay
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `✅ ¡Cambios aplicados! ¿Querés probar cómo le quedaría al cliente? Puedo simular la conversación ahora mismo.`,
          action: { __sim: true, type: action.type, config: action.config },
          applied: false
        }]);
      }, 600);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const apiHost = window.location.hostname;
      
      const res = await axios.post(`http://${apiHost}:4000/api/copilot`, {
        message: userMsg,
        history: messages,
        context: activeTab,
        instance: selectedChannel?.instanceName,
        currentConfig: currentConfig
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.message) {
        const hasAction = res.data.action && res.data.action.action === 'save_config';
        
        // Aplicar acción automáticamente al canvas de forma gráfica e inmediata
        if (hasAction && onApplyAction) {
          onApplyAction(res.data.action);
        }

        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: res.data.message, 
          action: res.data.action,
          applied: hasAction ? true : false
        }]);

        // Si es de tipo simulable, ofrecer simulación de forma automática
        if (hasAction && ['a1', 'a3', 'flow'].includes(res.data.action.type)) {
          const actionObj = res.data.action;
          setPendingSimAction(actionObj);
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `✅ ¡Cambios aplicados automáticamente! ¿Querés probar cómo le quedaría al cliente? Puedo simular la conversación ahora mismo.`,
              action: { __sim: true, type: actionObj.type, config: actionObj.config },
              applied: false
            }]);
          }, 600);
        }
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (e: any) {
      console.error("Copilot Error:", e);
      setTimeout(() => {
        const errorMsg = e.response?.data?.error || "Hubo un retraso o timeout al procesar el flujo. Por favor, reintentá el mensaje.";
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `⚠️ **Error de Conexión IA:** ${errorMsg}\n\nOcurrió un retraso en el procesamiento local. Por favor, intentá enviar tu solicitud nuevamente.` 
        }]);
        setIsLoading(false);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Conversation Simulator (floating, above the Copilot button) */}
      {simulatorConfig && (
        <ConversationSimulator
          simulatorConfig={simulatorConfig}
          onClose={() => setSimulatorConfig(null)}
        />
      )}

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
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleResetChat} 
                    title="Reiniciar conversación"
                    className="text-white/70 hover:text-red-300 transition-colors p-1.5 rounded hover:bg-white/10"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors p-1.5">
                    <X size={20} />
                  </button>
                </div>
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

                      {/* Normal config action buttons */}
                      {m.action && !m.action.__sim && !m.applied && (
                        <div className="mt-3 flex gap-2">
                          <button 
                            onClick={() => handleApplyAndOffer(m.action, i)}
                            className="bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                          >
                            Aplicar Cambios
                          </button>
                          <button 
                            onClick={() => setMessages(prev => prev.map((msg, idx) => idx === i ? {...msg, applied: true} : msg))}
                            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                          >
                            Descartar
                          </button>
                        </div>
                      )}

                      {/* Simulator offer buttons */}
                      {m.action && m.action.__sim && !m.applied && (
                        <div className="mt-3 flex gap-2">
                          <button 
                            onClick={() => {
                              setSimulatorConfig({ type: m.action.type as SimulatorConfig['type'], config: m.action.config });
                              setMessages(prev => prev.map((msg, idx) => idx === i ? {...msg, applied: true} : msg));
                            }}
                            className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Play size={11} /> Simular Ahora
                          </button>
                          <button 
                            onClick={() => setMessages(prev => prev.map((msg, idx) => idx === i ? {...msg, applied: true} : msg))}
                            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                          >
                            Ahora No
                          </button>
                        </div>
                      )}

                      {/* Applied state */}
                      {m.applied && m.action && !m.action.__sim && (
                        <div className="mt-3 text-[10px] text-green-400 font-bold flex items-center gap-1">
                          <Sparkles size={10} /> Cambios Aplicados
                        </div>
                      )}
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
                <div className="relative flex items-end gap-2">
                  <textarea
                    rows={3}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                      // Enter solo → salto de línea normal (no hacer nada especial)
                    }}
                    placeholder={"Escribí un mensaje...\n(Shift+Enter para enviar)"}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-colors resize-none leading-relaxed custom-scrollbar"
                    style={{ minHeight: '72px', maxHeight: '140px' }}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="mb-0.5 w-10 h-10 flex items-center justify-center bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl text-white transition-all shrink-0"
                    title="Enviar (Shift+Enter)"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="text-[9px] text-slate-600 mt-1.5 ml-1">Enter = nueva línea · Shift+Enter = enviar</p>
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
    </>
  );
}
