'use client';
import React, { useState, useEffect } from 'react';
import { 
  Ticket, Search, Plus, Trash2, Send, CheckCircle2, 
  Clock, Truck, AlertCircle, UserPlus, MoreVertical,
  Filter, X, Save, ExternalLink
} from 'lucide-react';
import axios from 'axios';

interface TicketsAdminProps {
  selectedChannel: any;
  selectedCompany: any;
}

export default function TicketsAdmin({ selectedChannel, selectedCompany }: TicketsAdminProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [showDelegateModal, setShowDelegateModal] = useState<any>(null);
  const [aiSummaries, setAiSummaries] = useState<Record<number, string>>({});
  const [summarizing, setSummarizing] = useState<number | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const apiHost = window.location.hostname;
      const token = localStorage.getItem('antigravity_token');
      const statusVal = filter === 'all' ? '' : (filter === 'open' ? 'open,pending_auth' : filter);
      const res = await axios.get(`http://${apiHost}:4000/api/data`, {
        params: { action: 'get_tickets', status: statusVal, companyId: selectedCompany?.id },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setTickets(res.data.tickets || []);
    } catch (e) { console.error("Error fetching tickets:", e); }
    finally { setLoading(false); }
  };

  const fetchTeam = async () => {
    try {
      const apiHost = window.location.hostname;
      const token = localStorage.getItem('antigravity_token');
      const res = await axios.get(`http://${apiHost}:4000/api/data`, {
        params: { action: 'get_team', companyId: selectedCompany?.id },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setTeam(res.data.team || []);
    } catch (e) { console.error("Error fetching team:", e); }
  };

  useEffect(() => {
    fetchTickets();
    fetchTeam();
  }, [filter, selectedCompany]);

  const handleUpdateTicket = async (ticket: any) => {
    try {
      const apiHost = window.location.hostname;
      const token = localStorage.getItem('antigravity_token');
      await axios.post(`http://${apiHost}:4000/api/data`, {
        action: 'update_ticket',
        ...ticket,
        companyId: selectedCompany?.id
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchTickets();
      setEditingTicket(null);
    } catch (e) { alert("Error al actualizar ticket"); }
  };

  const handleDeleteTicket = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este ticket?")) return;
    try {
      const apiHost = window.location.hostname;
      const token = localStorage.getItem('antigravity_token');
      await axios.post(`http://${apiHost}:4000/api/data`, {
        action: 'delete_ticket',
        id
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchTickets();
    } catch (e) { alert("Error al eliminar ticket"); }
  };

  const handleForwardTicket = async (id: number, phone: string) => {
    try {
      const apiHost = window.location.hostname;
      const token = localStorage.getItem('antigravity_token');
      const res = await axios.post(`http://${apiHost}:4000/api/data`, {
        action: 'forward_ticket',
        id,
        target_phone: phone,
        method: 'whatsapp'
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) alert("Ticket enviado con éxito");
      else alert("Error: " + res.data.error);
    } catch (e) { alert("Error al enviar ticket"); }
  };

  const filteredTickets = (tickets || []).filter(t => 
    t.phone.includes(searchTerm) || 
    (t.summary && t.summary.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSummarize = async (phone: string, ticketId: number, channel: string) => {
    try {
      setSummarizing(ticketId);
      const apiHost = window.location.hostname;
      const token = localStorage.getItem('antigravity_token');
      const res = await axios.post(`http://${apiHost}:4000/api/data`, {
        action: 'summarize_conversation',
        phone,
        instance: channel,
        companyId: selectedCompany?.id
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setAiSummaries(prev => ({ ...prev, [ticketId]: res.data.summary }));
      }
    } catch (e) { alert("Error al resumir con IA"); }
    finally { setSummarizing(null); }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
            <Ticket className="text-pink-500" size={32} />
            Administrador de Tickets
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
            Gestión y seguimiento de órdenes activas
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-sky-500 hover:bg-sky-400 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all flex items-center gap-2"
        >
          <Plus size={18} /> NUEVO TICKET
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="BUSCAR POR TELÉFONO O CONTENIDO..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-sky-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          {['all', 'open', 'pending_auth', 'en logistica', 'closed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              {s === 'all' ? 'TODOS' : s === 'open' ? 'ACTIVOS' : s === 'pending_auth' ? 'PENDIENTES' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/[0.03] text-[10px] font-black uppercase text-slate-500 tracking-[0.25em] border-b border-white/5">
            <tr>
              <th className="px-8 py-6">Ticket / Origen</th>
              <th className="px-8 py-6">Estado</th>
              <th className="px-8 py-6">Asignado a</th>
              <th className="px-8 py-6">Prioridad</th>
              <th className="px-8 py-6">Resumen</th>
              <th className="px-8 py-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {loading ? (
              <tr><td colSpan={6} className="p-20 text-center text-slate-600 font-bold italic">Cargando tickets...</td></tr>
            ) : filteredTickets.length > 0 ? filteredTickets.map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.02] transition-all group">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white">#{t.id} - {t.phone}</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{t.time}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <select 
                    value={t.status}
                    onChange={(e) => handleUpdateTicket({...t, status: e.target.value})}
                    className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-lg border outline-none bg-transparent ${
                      t.status === 'pending_auth' ? 'text-pink-400 border-pink-400/20' :
                      t.status === 'open' ? 'text-sky-400 border-sky-400/20' : 
                      t.status === 'en logistica' ? 'text-amber-400 border-amber-400/20' : 
                      'text-green-400 border-green-400/20'
                    }`}
                  >
                    <option value="pending_auth">POR AUTORIZAR</option>
                    <option value="open">ACTIVO</option>
                    <option value="en logistica">EN LOGÍSTICA</option>
                    <option value="closed">CERRADO</option>
                  </select>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <select 
                      value={t.assigned_to || ''}
                      onChange={(e) => handleUpdateTicket({...t, assigned_to: e.target.value})}
                      className="bg-transparent text-[10px] font-bold text-slate-300 outline-none hover:text-white transition-all cursor-pointer"
                    >
                      <option value="">Sin asignar</option>
                      {(team || []).map(m => <option key={m.phone} value={m.name}>{m.name.toUpperCase()}</option>)}
                    </select>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-1">
                    {['low', 'normal', 'high'].map(p => (
                      <button 
                        key={p}
                        onClick={() => handleUpdateTicket({...t, priority: p})}
                        className={`w-2 h-2 rounded-full transition-all ${
                          t.priority === p ? (
                            p === 'high' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                            p === 'normal' ? 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]' :
                            'bg-slate-500'
                          ) : 'bg-white/10 hover:bg-white/20'
                        }`}
                        title={p.toUpperCase()}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-2 max-w-xs">
                    <p className="text-[10px] text-slate-400 line-clamp-2">{t.summary || 'Sin descripción'}</p>
                    {(t.summary_ia || aiSummaries[t.id]) ? (
                      <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-xl animate-in zoom-in-95 duration-300">
                        <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Resumen IA
                        </p>
                        <p className="text-[9px] text-slate-300 italic leading-relaxed">{t.summary_ia || aiSummaries[t.id]}</p>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleSummarize(t.phone, t.id, t.channel)}
                        disabled={summarizing === t.id}
                        className="text-[8px] font-black text-slate-500 hover:text-sky-400 uppercase tracking-widest transition-all flex items-center gap-1 disabled:opacity-50"
                      >
                        {summarizing === t.id ? 'Generando...' : '✨ Generar Resumen IA'}
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => window.open(`https://wa.me/${t.phone}`, '_blank')}
                      className="p-2.5 bg-white/5 rounded-xl hover:bg-green-500/20 hover:text-green-400 transition-all"
                      title="Abrir en WhatsApp"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button 
                      onClick={() => setShowDelegateModal(t)}
                      className="p-2.5 bg-white/5 rounded-xl hover:bg-sky-500/20 hover:text-sky-400 transition-all"
                      title="Delegar vía WhatsApp"
                    >
                      <Send size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTicket(t.id)}
                      className="p-2.5 bg-white/5 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="p-20 text-center text-slate-600 font-bold italic uppercase tracking-[0.2em]">No hay tickets que coincidan con la búsqueda</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delegate Modal */}
      {showDelegateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowDelegateModal(null)}></div>
          <div className="bg-[#0f1115] w-full max-w-md rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-black text-xl text-white tracking-tight uppercase italic">Delegar Ticket</h3>
              <button onClick={() => setShowDelegateModal(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Seleccionar miembro del equipo:</p>
              <div className="space-y-3">
                {(team || []).length > 0 ? (team || []).map(m => (
                  <button
                    key={m.phone}
                    onClick={() => {
                      handleForwardTicket(showDelegateModal.id, m.phone);
                      setShowDelegateModal(null);
                    }}
                    className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-sky-500/10 hover:border-sky-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center font-black text-sky-400 text-xs uppercase">
                        {m.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black text-white group-hover:text-sky-400 transition-all">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.phone}</div>
                      </div>
                    </div>
                    <Send size={16} className="text-slate-600 group-hover:text-sky-500 transition-all" />
                  </button>
                )) : (
                  <div className="text-center p-10 bg-white/5 rounded-2xl italic text-slate-500 text-xs">
                    No hay miembros del equipo registrados con el grupo "TEAM" en la agenda.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTicketModal 
          onClose={() => setShowCreateModal(false)} 
          onSave={() => { fetchTickets(); setShowCreateModal(false); }}
          team={team}
          selectedCompany={selectedCompany}
        />
      )}
    </div>
  );
}

function CreateTicketModal({ onClose, onSave, team, selectedCompany }: any) {
  const [ticket, setTicket] = useState({ phone: '', summary: '', assigned_to: '', status: 'open', priority: 'normal' });

  const handleSave = async () => {
    if (!ticket.phone || !ticket.summary) return alert("Complete los campos requeridos");
    try {
      const apiHost = window.location.hostname;
      const token = localStorage.getItem('antigravity_token');
      await axios.post(`http://${apiHost}:4000/api/data`, {
        action: 'create_ticket',
        ticket,
        companyId: selectedCompany?.id
      }, { headers: { Authorization: `Bearer ${token}` } });
      onSave();
    } catch (e) { alert("Error al crear ticket"); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-[#0f1115] w-full max-w-lg rounded-[3rem] border border-white/10 overflow-hidden relative shadow-2xl">
        <div className="p-10 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-black text-2xl text-white tracking-tighter uppercase italic">Nuevo Ticket Manual</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={24} /></button>
        </div>
        <div className="p-10 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Teléfono del Cliente</label>
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs font-bold outline-none focus:border-sky-500/50"
              value={ticket.phone}
              onChange={(e) => setTicket({...ticket, phone: e.target.value})}
              placeholder="54911..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resumen / Detalle</label>
            <textarea 
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs font-bold outline-none focus:border-sky-500/50 resize-none"
              value={ticket.summary}
              onChange={(e) => setTicket({...ticket, summary: e.target.value})}
              placeholder="Detalles de la orden..."
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asignar a</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs font-bold outline-none"
                value={ticket.assigned_to}
                onChange={(e) => setTicket({...ticket, assigned_to: e.target.value})}
              >
                <option value="">Sin asignar</option>
                {(team || []).map((m:any) => <option key={m.phone} value={m.name}>{m.name.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prioridad</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-xs font-bold outline-none"
                value={ticket.priority}
                onChange={(e) => setTicket({...ticket, priority: e.target.value})}
              >
                <option value="low">BAJA</option>
                <option value="normal">NORMAL</option>
                <option value="high">ALTA</option>
              </select>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className="w-full py-5 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-xl transition-all mt-4"
          >
            CREAR TICKET
          </button>
        </div>
      </div>
    </div>
  );
}
