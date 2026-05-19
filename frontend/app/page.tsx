'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    taxId: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const apiHost = window.location.hostname;
        const response = await axios.get(`http://${apiHost}:4000/api/onboarding/status`);
        if (response.data.registered) {
          const token = localStorage.getItem('PICE SaaS_token');
          if (token) {
            window.location.href = '/dashboard';
          } else {
            window.location.href = '/login';
          }
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
      }
    };
    checkOnboardingStatus();
  }, []);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const apiHost = window.location.hostname;
      const response = await axios.post(`http://${apiHost}:4000/api/onboarding/register`, formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar la empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-950/20 via-slate-950 to-black">
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky-500 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl glass p-8 rounded-3xl relative z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="p-4 bg-sky-500/10 rounded-2xl mb-4 neon-glow border border-sky-500/20">
            <ShieldCheck className="w-10 h-10 text-sky-400" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white mb-2">ANTIGRAVITY <span className="text-sky-400">SAAS</span></h1>
          <p className="text-slate-400 text-sm">Plataforma Inteligente de Comunicación para Empresas</p>
        </div>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              {step === 1 ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-200 border-l-4 border-sky-500 pl-3">Datos de la Empresa</h2>
                  <div className="space-y-4">
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Nombre de Fantasía"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500/50 focus:bg-white/10 transition-all font-medium"
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      />
                    </div>
                    <div className="relative group">
                      <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="CUIT / CUIL (Sin guiones)"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500/50 focus:bg-white/10 transition-all font-medium"
                        value={formData.taxId}
                        onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20 mt-6"
                  >
                    CONTINUAR <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-200 border-l-4 border-sky-500 pl-3">Administrador Principal</h2>
                  <div className="space-y-4">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Nombre Completo"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500/50 focus:bg-white/10 transition-all font-medium"
                        value={formData.adminName}
                        onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                      />
                    </div>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                      <input 
                        type="email" 
                        placeholder="Correo Electrónico Corporativo"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500/50 focus:bg-white/10 transition-all font-medium"
                        value={formData.adminEmail}
                        onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                      <input 
                        type="password" 
                        placeholder="Contraseña Maestra"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500/50 focus:bg-white/10 transition-all font-medium"
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button 
                      onClick={() => setStep(1)}
                      className="px-6 py-4 border border-white/10 hover:bg-white/5 text-slate-400 rounded-2xl font-bold transition-all"
                    >
                      VOLVER
                    </button>
                    <button 
                      onClick={handleRegister}
                      disabled={loading}
                      className="flex-1 py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
                    >
                      {loading ? 'REGISTRANDO...' : 'RECLAMAR ACCESO'} <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-6"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto neon-glow border border-green-500/30">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">¡Bienvenido a la Élite!</h2>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Tu empresa ha sido registrada correctamente. Ahora puedes acceder a tu panel de control y conectar tus primeros canales de IA.
              </p>
              <Link 
                href="/login"
                className="block w-full py-4 bg-white text-black rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-95 text-center no-underline"
              >
                IR AL DASHBOARD
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <footer className="absolute bottom-6 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
        Propulsado por Antigravity Deepmind Core 2026
      </footer>
    </main>
  );
}
