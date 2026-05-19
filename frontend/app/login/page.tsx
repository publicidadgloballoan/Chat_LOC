'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Usar IP local de la máquina para evitar conflictos de Docker/localhost
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

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
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

        <h1 className="text-2xl font-black text-center mb-2 tracking-tight">CENTRO DE MANDO</h1>
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

        <div className="mt-10 text-center border-t border-white/5 pt-6">
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] leading-relaxed">
                Propiedad de Antigravity Core LTD<br/>Acceso restringido Nivel 7
            </p>
        </div>
      </motion.div>
    </main>
  );
}
