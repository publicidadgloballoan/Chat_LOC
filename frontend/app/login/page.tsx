'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, ShieldAlert, KeyRound, CheckCircle2, X } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Recover Access State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const apiHost = window.location.hostname;
      const response = await axios.post(`http://${apiHost}:4000/api/auth/login`, { email, password });
      localStorage.setItem('PICE SaaS_token', response.data.token);
      localStorage.setItem('PICE SaaS_user', JSON.stringify(response.data.agent));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error de conexión con el centro de mando');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotSuccess('');
    setForgotError('');
    try {
      const apiHost = window.location.hostname;
      const response = await axios.post(`http://${apiHost}:4000/api/auth/reset-password`, { 
        email: forgotEmail, 
        newPassword: forgotPassword 
      });
      setForgotSuccess(response.data.message || 'Contraseña actualizada con éxito');
      setEmail(forgotEmail);
      setPassword(forgotPassword);
      setTimeout(() => {
        setShowForgot(false);
        setForgotSuccess('');
      }, 2000);
    } catch (err: any) {
      setForgotError(err.response?.data?.error || 'Error al restablecer la contraseña');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#070c1a]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-10 border border-white/10"
      >
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-cyan-500/10 rounded-full border border-cyan-500/20 neon-glow-blue">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-center mb-2 tracking-tight text-white">CENTRO DE MANDO</h1>
        <p className="text-slate-500 text-center text-[10px] uppercase tracking-[0.3em] font-black mb-10">Ingreso Autorizado</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="email" 
              placeholder="admin@antigravity.io"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="password" 
              placeholder="Contraseña Maestra"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase">
              <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? 'AUTENTICANDO...' : 'ENTRAR AL SISTEMA'} <LogIn className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            type="button" 
            onClick={() => { setShowForgot(true); setForgotEmail(email); }} 
            className="text-[10px] font-black text-cyan-400 hover:underline uppercase tracking-wider transition-all"
          >
            ¿Olvidaste tu contraseña? / Recuperar Acceso
          </button>
        </div>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] leading-relaxed">
                Propiedad de Antigravity Core LTD<br/>Acceso restringido Nivel 7
            </p>
        </div>
      </motion.div>

      {/* Modal Recuperar Acceso */}
      <AnimatePresence>
        {showForgot && (
          <div className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#0b1329] p-8 rounded-3xl border border-cyan-500/30 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/20 rounded-xl text-cyan-400">
                    <KeyRound size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">Recuperar Acceso</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Restablece tu contraseña de administrador</p>
                  </div>
                </div>
                <button onClick={() => setShowForgot(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1 block">Email Registrado</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400" />
                    <input 
                      type="email" 
                      placeholder="ejemplo@antigravity.io"
                      className="input-field pl-10 text-xs"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1 block">Nueva Contraseña</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400" />
                    <input 
                      type="password" 
                      placeholder="Nueva Contraseña Maestra"
                      className="input-field pl-10 text-xs"
                      value={forgotPassword}
                      onChange={(e) => setForgotPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {forgotError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase">
                    <ShieldAlert className="w-4 h-4 shrink-0" /> {forgotError}
                  </div>
                )}

                {forgotSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {forgotSuccess}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  {forgotLoading ? 'ACTUALIZANDO...' : 'RESTABLECER CONTRASEÑA'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

