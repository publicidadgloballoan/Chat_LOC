import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, FileText, Database, Target, Activity, Search, File, CheckCircle2, ChevronRight, X, Image, Video, Table, Filter, Check, Save, Copy, Eye, Trash2, Upload, Link, Phone, Mail, Globe, RotateCcw } from 'lucide-react';
import axios from 'axios';

export default function MktEmisivo({ agenda = [], mktTemplates = [], refresh, mediaManifest = [], apiHost, token, instance, selectedCompany }) {
  const [campaignName, setCampaignName] = useState('');
  const [template, setTemplate] = useState('Hola {{nombre}}, tenemos novedades para ti en Colaboratium.');
  const [selectedMediaList, setSelectedMediaList] = useState([]);
  const fileInputRef = useRef(null);
  
  // Destinatarios
  const [destMode, setDestMode] = useState('AGENDA');
  const [importStep, setImportStep] = useState(1);
  const [selectedImportFile, setSelectedImportFile] = useState('');
  const [mapping, setMapping] = useState({});
  const [availableHeaders, setAvailableHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  
  const [agendaSearch, setAgendaSearch] = useState('');
  const [agendaGroupFilter, setAgendaGroupFilter] = useState('TODOS');
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  
  const [mediaFilter, setMediaFilter] = useState('TODOS');
  const [loading, setLoading] = useState(false);

  // Logs y Control de Lanzamiento
  const [mktLogs, setMktLogs] = useState([]);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [activeChannels, setActiveChannels] = useState({ WA: true, EMAIL: true, IG: true, FB: true });

  React.useEffect(() => {
    let interval;
    interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://${apiHost}:4000/api/data?action=get_mkt_logs&companyId=${selectedCompany?.id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data && res.data.success) {
          setMktLogs(res.data.logs || []);
        }
      } catch (e) {
        console.error("Log poll error", e);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [apiHost, token]);

  const fieldOptions = [
    { id: 'name', label: 'Nombre Completo' },
    { id: 'phone', label: 'Teléfono / WhatsApp' },
    { id: 'email', label: 'Email' },
    { id: 'dni', label: 'DNI / ID' },
    { id: 'address', label: 'Dirección' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'cbu', label: 'CBU / CVU' },
    { id: 'alias', label: 'Alias' },
    { id: 'bank', label: 'Banco' },
    { id: 'branch', label: 'Sucursal' },
    { id: 'ignore', label: 'Ignorar / Meta' }
  ];

  // Plantillas
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  const filteredAgenda = agenda.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(agendaSearch.toLowerCase()) || (c.phone || '').includes(agendaSearch);
    const matchesGroup = agendaGroupFilter === 'TODOS' || c.group === agendaGroupFilter;
    return matchesSearch && matchesGroup;
  });

  const loadPreview = async (fileName) => {
    try {
      setLoading(true);
      const res = await axios.post(`http://${apiHost}:4000/api/data`, { action: 'get_file_preview', fileName }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setAvailableHeaders(res.data.headers);
        setPreviewRows(res.data.rows);
        const initialMapping = {};
        res.data.headers.forEach((h, i) => {
          const l = h.toLowerCase();
          if (l.includes('nom') || l.includes('full')) initialMapping[i] = 'name';
          else if (l.includes('tel') || l.includes('cel') || l.includes('phone')) initialMapping[i] = 'phone';
          else if (l.includes('mail')) initialMapping[i] = 'email';
          else initialMapping[i] = 'ignore';
        });
        setMapping(initialMapping);
      }
    } catch (e) { alert("Error cargando previsualización"); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'upload_media');
    try {
      setLoading(true);
      const res = await axios.post(`http://${apiHost}:4000/api/data`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        setSelectedImportFile(file.name);
        setImportStep(2);
        loadPreview(file.name);
        if (refresh) refresh();
      }
    } catch (e) { alert("Error al subir archivo"); }
    finally { setLoading(false); }
  };

  const [rubros, setRubros] = useState(['TODOS', 'CLIENTES', 'VENDEDORES', 'PROVEEDORES']);
  const fetchRubros = async () => {
    try {
      const res = await axios.post(`http://${apiHost}:4000/api/data`, { action: 'get_rubros', companyId: selectedCompany?.id }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setRubros(['TODOS', ...res.data.rubros]);
    } catch (e) { console.error("Error fetching rubros", e); }
  };

  React.useEffect(() => {
    fetchRubros();
  }, [apiHost, token]);

  const toggleSelectAll = () => {
    if (selectedContactIds.length === filteredAgenda.length) setSelectedContactIds([]);
    else setSelectedContactIds(filteredAgenda.map(c => c.id));
  };

  const toggleContact = (id) => {
    setSelectedContactIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSaveCampaign = async () => {
    if (!campaignName) return alert("Ingresa un nombre para la campaña");
    if (selectedContactIds.length === 0 && destMode === 'AGENDA') return alert("Selecciona al menos un destinatario");
    setShowLaunchModal(true);
  };

  const confirmLaunch = async () => {
    try {
      setShowLaunchModal(false);
      setLoading(true);
      const res = await axios.post(`http://${apiHost}:4000/api/data`, {
        action: 'save_mkt_campaign',
        name: campaignName,
        template,
        media: selectedMediaList.map(m => m.url || m.name).join(','),
        channels: { ...activeChannels, instance }, // Enviar qué canales quiere el usuario y la instancia actual
        companyId: selectedCompany?.id
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        const campaignId = res.data.id;
        if (destMode === 'FILE' && selectedImportFile) {
          await axios.post(`http://${apiHost}:4000/api/data`, {
            action: 'import_mkt_file',
            campaignId,
            fileName: selectedImportFile,
            mapping
          }, { headers: { Authorization: `Bearer ${token}` } });
        } else if (destMode === 'AGENDA' && selectedContactIds.length > 0) {
          const selectedContacts = agenda.filter(c => selectedContactIds.includes(c.id)).map(c => {
             // Si el canal está activo en el modal Y el contacto tiene el dato, incluirlo
             const defaultChannels = [];
             if (activeChannels.WA && c.phone) defaultChannels.push('WA');
             if (activeChannels.EMAIL && c.email) defaultChannels.push('EMAIL');
             if (activeChannels.IG && c.instagram) defaultChannels.push('IG');
             if (activeChannels.FB && c.facebook) defaultChannels.push('FB');

             const manualChannels = c.selectedChannels || [];
             const finalChannels = Array.from(new Set([...defaultChannels, ...manualChannels])).filter(ch => activeChannels[ch]);
             
             return { ...c, selectedChannels: finalChannels.length > 0 ? finalChannels : ['WA'] };
          });
          await axios.post(`http://${apiHost}:4000/api/data`, {
            action: 'import_mkt_contacts_list',
            campaignId,
            contacts: selectedContacts
          }, { headers: { Authorization: `Bearer ${token}` } });
        }
        if (refresh) refresh();
      }
    } catch (e) { alert("Error: " + e.message); }
    finally { setLoading(false); }
  };

  const handleRetry = async () => {
    try {
      setLoading(true);
      await axios.post(`http://${apiHost}:4000/api/data`, { action: 'retry_mkt_contacts' }, { headers: { Authorization: `Bearer ${token}` } });
      // Limpiar logs visuales para ver los nuevos
      setMktLogs([]);
    } catch (e) { alert("Error al relanzar: " + e.message); }
    finally { setLoading(false); }
  };
  
  const handleClearLogs = async () => {
    if(!confirm("¿Deseas cancelar todos los envíos pendientes y limpiar el historial?")) return;
    try {
      setLoading(true);
      await axios.post(`http://${apiHost}:4000/api/data`, { action: 'clear_mkt_contacts' }, { headers: { Authorization: `Bearer ${token}` } });
      setMktLogs([]);
      if (refresh) refresh();
    } catch (e) { alert("Error al limpiar: " + e.message); }
    finally { setLoading(false); }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName) return alert("Nombre de plantilla requerido");
    try {
      await axios.post(`http://${apiHost}:4000/api/data`, { 
        action: 'save_mkt_template', 
        name: newTemplateName, 
        content: template,
        subject: campaignName,
        media: selectedMediaList.map(m => m.name).join(','),
        companyId: selectedCompany?.id
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowSaveTemplate(false);
      setNewTemplateName('');
      if (refresh) refresh();
    } catch (e) { alert("Error al guardar plantilla"); }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm("¿Eliminar plantilla?")) return;
    try {
      await axios.post(`http://${apiHost}:4000/api/data`, { action: 'delete_mkt_template', id }, { headers: { Authorization: `Bearer ${token}` } });
      if (refresh) refresh();
    } catch (e) { alert("Error al eliminar"); }
  };

  const getPreview = () => {
    const firstSelected = agenda.find(c => selectedContactIds.includes(c.id));
    const name = firstSelected ? firstSelected.name : "Nombre de Ejemplo";
    return template.replace(/\{\{nombre\}\}/gi, name);
  };

  const filteredMedia = mediaManifest.filter(m => {
    if (mediaFilter === 'TODOS') return true;
    const ext = m.name.split('.').pop().toLowerCase();
    if (mediaFilter === 'DOCUMENTOS') return ['pdf', 'doc', 'docx', 'txt'].includes(ext);
    if (mediaFilter === 'FOTOS') return ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
    if (mediaFilter === 'VIDEOS') return ['mp4', 'mov', 'avi'].includes(ext);
    if (mediaFilter === 'TABLAS') return ['csv', 'xlsx', 'xls', 'db', 'sqlite'].includes(ext);
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* CONFIGURACIÓN Y PLANTILLAS */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-[2.5rem] border border-white/10 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-500/20 rounded-xl text-sky-400"><Target size={20} /></div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Mensaje de Campaña</h2>
              </div>
              <button onClick={() => setShowSaveTemplate(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-white uppercase border border-white/5 tracking-widest"><Save size={14} /> Guardar Plantilla</button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Nombre de Campaña / Asunto Email</label>
                <input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Ej: Presentación Colaboratium..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-sky-500" />
              </div>
              <div className="relative group">
                <textarea value={template} onChange={e => setTemplate(e.target.value)} placeholder="Redacta tu mensaje aquí..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold h-40 outline-none focus:border-sky-500" />
                <div className="absolute bottom-4 right-4 flex gap-2"><span className="px-2 py-1 bg-black/40 text-slate-400 text-[8px] font-black rounded uppercase border border-white/5">Tip: usa {'{{nombre}}'}</span></div>
              </div>
            </div>
            {mktTemplates.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Copy size={12} /> Plantillas Guardadas</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {mktTemplates.map(t => (
                    <div key={t.id} className="flex-shrink-0 group relative">
                      <button 
                        onClick={() => {
                          setTemplate(t.content);
                          if (t.subject) setCampaignName(t.subject);
                          if (t.media) {
                            const mediaNames = t.media.split(',');
                            const foundList = mediaManifest.filter(m => mediaNames.includes(m.name));
                            setSelectedMediaList(foundList);
                          } else {
                            setSelectedMediaList([]);
                          }
                        }} 
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-slate-300 pr-10"
                      >
                        {t.name}
                      </button>
                      <button onClick={() => handleDeleteTemplate(t.id)} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded-md transition-all"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass p-8 rounded-[2.5rem] border border-white/10 space-y-4">
             <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2 mb-4"><Database size={14} /> Explorador de Biblioteca</h3>
             <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                {['TODOS', 'FOTOS', 'VIDEOS', 'DOCUMENTOS', 'TABLAS'].map(cat => (
                  <button key={cat} onClick={() => setMediaFilter(cat)} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${mediaFilter === cat ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}>{cat}</button>
                ))}
             </div>
             <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredMedia.map((m, i) => {
                  const isSelected = selectedMediaList.some(item => item.name === m.name);
                  return (
                    <button 
                      key={i} 
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMediaList(prev => prev.filter(item => item.name !== m.name));
                        } else {
                          setSelectedMediaList(prev => [...prev, m]);
                        }
                      }} 
                      className={`p-4 rounded-2xl border text-left transition-all group ${isSelected ? 'bg-sky-500/20 border-sky-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-sky-500 text-white' : 'bg-white/10 text-slate-400 group-hover:text-sky-400'}`}>
                          {m.name.match(/\.(jpg|jpeg|png|webp)$/i) ? <Image size={14}/> : m.name.match(/\.(mp4|mov)$/i) ? <Video size={14}/> : <FileText size={14}/>}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-black text-white truncate">{m.name}</div>
                          <div className="text-[8px] font-bold text-slate-500 uppercase mt-1">{m.type || 'Archivo'}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
             </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border border-white/10 space-y-4">
             <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Eye size={14} /> Previsualización Omnicanal</h3>
             <div className="p-6 bg-slate-900/50 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
                <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center text-sky-400 font-black text-xs">A</div><span className="text-[10px] font-black text-slate-400 uppercase">Antigravity Bot</span></div>
                <p className="text-sm font-medium text-white whitespace-pre-wrap leading-relaxed">{getPreview()}</p>
                {selectedMediaList.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedMediaList.map((m, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3 animate-in slide-in-from-left-2 duration-300">
                        <FileText size={16} className="text-sky-400" />
                        <div className="text-[10px] font-black text-slate-400 uppercase truncate flex-1">{m.name}</div>
                        <button onClick={() => setSelectedMediaList(prev => prev.filter(item => item.name !== m.name))} className="text-slate-500 hover:text-red-400 transition-colors"><X size={14}/></button>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* DESTINATARIOS */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/10 space-y-6 relative overflow-hidden flex flex-col min-h-[600px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="p-3 bg-purple-500/20 rounded-xl text-purple-400"><Users size={20} /></div><h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Destinatarios</h2></div>
            <div className="flex gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
              <button onClick={() => setDestMode('AGENDA')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${destMode === 'AGENDA' ? 'bg-purple-500 text-white' : 'text-slate-500 hover:text-white'}`}>CRM AGENDA</button>
              <button onClick={() => setDestMode('FILE')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${destMode === 'FILE' ? 'bg-purple-500 text-white' : 'text-slate-500 hover:text-white'}`}>IMPORTAR ARCHIVO</button>
            </div>
          </div>

          {destMode === 'AGENDA' ? (
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
               <div className="flex items-center gap-4">
                  <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} /><input value={agendaSearch} onChange={e => setAgendaSearch(e.target.value)} placeholder="Buscar en agenda..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-xs font-bold outline-none" /></div>
                  <select value={agendaGroupFilter} onChange={e => setAgendaGroupFilter(e.target.value)} className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-[10px] font-black outline-none appearance-none">
                    {rubros.map(r => <option key={r} value={r}>{r === 'TODOS' ? 'FILTRAR: TODOS' : r}</option>)}
                  </select>
               </div>

               <div className="flex gap-2 shrink-0 overflow-x-auto custom-scrollbar pb-1">
                  <button onClick={toggleSelectAll} className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest transition-all whitespace-nowrap">Todos</button>
                  {rubros.filter(r => r !== 'TODOS').map(r => (
                    <button key={r} onClick={() => setSelectedContactIds(agenda.filter(c => (c.group_name || c.group) === r).map(c => c.id))} className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest transition-all whitespace-nowrap">{r}</button>
                  ))}
                  {selectedContactIds.length > 0 && (
                    <button onClick={() => setSelectedContactIds([])} className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-[9px] font-black text-red-400 uppercase tracking-widest transition-all">Limpiar ({selectedContactIds.length})</button>
                  )}
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 max-h-[500px]">
                  {filteredAgenda.map(c => (
                    <div key={c.id} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedContactIds.includes(c.id) ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <button onClick={() => toggleContact(c.id)} className="flex items-center gap-3 flex-1 text-left">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${selectedContactIds.includes(c.id) ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-400'}`}>{c.name ? c.name.charAt(0) : 'U'}</div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-white truncate">{c.name || "Sin Nombre"}</div>
                          <div className="text-[9px] font-bold text-slate-500">{c.phone}</div>
                        </div>
                      </button>
                      
                      {selectedContactIds.includes(c.id) && (
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                            {[
                              { id: 'WA', icon: <Phone size={10}/>, color: 'text-green-400', active: true },
                              { id: 'EMAIL', icon: <Mail size={10}/>, color: 'text-purple-400', active: !!c.email },
                              { id: 'IG', icon: <Globe size={10}/>, color: 'text-pink-400', active: !!c.instagram },
                              { id: 'FB', icon: <Globe size={10}/>, color: 'text-blue-400', active: !!c.facebook },
                              { id: 'LINK', icon: <Globe size={10}/>, color: 'text-sky-600', active: !!c.linkedin }
                            ].map(ch => (
                              <button
                                key={ch.id}
                                disabled={!ch.active}
                                onClick={() => {
                                  const current = c.selectedChannels || ['WA'];
                                  const next = current.includes(ch.id) 
                                    ? current.filter(x => x !== ch.id) 
                                    : [...current, ch.id];
                                  c.selectedChannels = next.length > 0 ? next : ['WA'];
                                  setAgendaSearch(agendaSearch + ' '); // Force re-render
                                  setTimeout(() => setAgendaSearch(agendaSearch.trim()), 10);
                                }}
                                className={`p-2 rounded-lg transition-all ${!ch.active ? 'opacity-20 cursor-not-allowed' : (c.selectedChannels || ['WA']).includes(ch.id) ? 'bg-white/10 ' + ch.color : 'text-slate-600 hover:text-white'}`}
                              >
                                {ch.icon}
                              </button>
                            ))}
                          </div>
                          <CheckCircle2 size={16} className="text-purple-400 ml-2" />
                        </div>
                      )}
                    </div>
                  ))}
               </div>
            </div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col">
              {importStep === 1 ? (
                <div className="w-full space-y-6 animate-in fade-in duration-300 my-auto">
                  <div className="p-10 bg-white/5 border border-dashed border-white/20 rounded-[3rem] text-center space-y-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400"><Upload size={32} /></div>
                    <div><h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Seleccionar Base de Datos</h3><p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Excel, CSV o SQLite</p></div>
                    <button onClick={() => fileInputRef.current.click()} className="px-8 py-4 bg-purple-500 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all">SELECCIONAR ARCHIVO</button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv, .xlsx, .xls, .db, .sqlite" className="hidden" />
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-6 animate-in slide-in-from-right-4 duration-300 pb-20 overflow-auto">
                   <div className="flex items-center justify-between bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20 shrink-0"><span className="text-xs font-black text-purple-400 uppercase truncate max-w-[200px]">{selectedImportFile}</span><button onClick={() => setImportStep(1)} className="text-slate-500 hover:text-white"><X size={16}/></button></div>
                   
                   <div className="bg-black/20 rounded-2xl border border-white/5 overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-slate-900/50">
                            {availableHeaders.map((h, i) => (
                              <th key={i} className="p-4 border-r border-white/5">
                                <div className="space-y-2">
                                  <div className="text-[8px] font-black text-slate-500 uppercase truncate">{h}</div>
                                  <select value={mapping[i] || 'ignore'} onChange={e => setMapping({...mapping, [i]: e.target.value})} className={`w-full bg-[#0f172a] text-[9px] font-black p-2 rounded border border-white/10 outline-none appearance-none ${mapping[i] && mapping[i] !== 'ignore' ? 'bg-sky-500 text-white' : 'text-slate-400'}`}>
                                    {fieldOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                                  </select>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewRows.slice(0, 3).map((row, ri) => (
                            <tr key={ri} className="border-t border-white/5">
                              {row.map((cell, ci) => (
                                <td key={ci} className="p-4 text-[9px] text-slate-400 border-r border-white/5 truncate max-w-[100px]">
                                  {String(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              )}
            </div>
          )}

          <button onClick={handleSaveCampaign} disabled={loading} className="w-full py-6 bg-sky-500 text-white rounded-[2.5rem] font-black uppercase text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-auto sticky bottom-0 z-10">
            {loading ? <Activity className="animate-spin" /> : <><CheckCircle2 size={18}/> Lanzar Campaña Omnicanal</>}
          </button>
        </div>
      </div>

      {/* Panel de Logs / Actividad integrado debajo */}
      <div className="glass p-8 rounded-[3rem] border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-xl text-green-400"><Activity size={20} /></div>
            <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Actividad en Tiempo Real</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Monitoreo de envíos y estados de entrega</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {mktLogs.some(l => l.status === 'failed') && (
              <button onClick={handleRetry} className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2">
                <RotateCcw size={14} /> Relanzar Fallidos
              </button>
            )}
            {mktLogs.length > 0 && (
              <button onClick={handleClearLogs} className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2">
                <Trash2 size={14} /> Borrar Pendientes / Historial
              </button>
            )}
            <button 
              onClick={async () => {
                try {
                  const apiHost = window.location.hostname;
                  await axios.post(`http://${apiHost}:4000/api/data`, { action: 'sync' }, { headers: { Authorization: `Bearer ${token}` } });
                  alert("Engine sincronizado: Webhooks actualizados en todas las instancias");
                } catch (e) { alert("Error al sincronizar"); }
              }}
              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
            >
              <RotateCcw size={14} /> Sincronizar Engine
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-white/5 bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Canal</th>
                <th className="px-6 py-4">Campaña</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Estado / Resultado</th>
                <th className="px-6 py-4 text-right">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mktLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600"><Activity size={32}/></div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No hay actividad reciente. Inicia una campaña para ver los logs.</p>
                  </td>
                </tr>
              ) : (
                mktLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${log.status === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {log.channel === 'WA' ? <Phone size={14}/> : <Mail size={14}/>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-black text-sky-400 uppercase truncate max-w-[150px]">{log.campaign || "S/N"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-bold text-white uppercase">{log.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] ${log.status === 'sent' ? 'text-green-500' : 'text-red-500'}`}>●</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{log.msg}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-[9px] font-black text-slate-600 uppercase tabular-nums bg-black/40 px-3 py-1.5 rounded-lg inline-block">
                        {log.time}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lanzar Campaña */}
      <AnimatePresence>
        {showLaunchModal && (
          <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-10">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass p-10 rounded-[3rem] border border-white/20 w-full max-w-lg space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Confirmar Lanzamiento</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Selecciona los canales habilitados para este envío</p>
                </div>
                <button onClick={() => setShowLaunchModal(false)} className="text-slate-500 hover:text-white"><X size={24}/></button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'WA', label: 'WhatsApp', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
                  { id: 'EMAIL', label: 'Email', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
                  { id: 'TG', label: 'Telegram', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
                  { id: 'IG', label: 'Instagram', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
                  { id: 'FB', label: 'Facebook', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
                ].map(ch => (
                  <button 
                    key={ch.id} 
                    onClick={() => setActiveChannels(prev => ({ ...prev, [ch.id]: !prev[ch.id] }))}
                    className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 ${activeChannels[ch.id] ? ch.color : 'bg-white/5 border-white/10 text-slate-600'}`}
                  >
                    <div className="font-black text-xs uppercase tracking-widest">{ch.label}</div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${activeChannels[ch.id] ? 'border-current bg-current/20' : 'border-white/20'}`}>
                      {activeChannels[ch.id] && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Resumen de Envío</div>
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-white">Destinatarios Seleccionados:</div>
                  <div className="text-xs font-black text-sky-400">{destMode === 'AGENDA' ? selectedContactIds.length : 'Archivo Externo'}</div>
                </div>
              </div>

              <button onClick={confirmLaunch} className="w-full py-6 bg-sky-500 text-white rounded-[2rem] font-black uppercase text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                <Send size={18} /> INICIAR CAMPAÑA AHORA
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Modal Guardar Plantilla */}
      <AnimatePresence>
        {showSaveTemplate && (
          <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-10">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass p-10 rounded-[3rem] border border-white/20 w-full max-w-md space-y-6">
              <div className="flex items-center justify-between"><h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Guardar Plantilla</h3><button onClick={() => setShowSaveTemplate(false)} className="text-slate-500 hover:text-white"><X size={24}/></button></div>
              <input value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="Nombre de la plantilla..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none" />
              <button onClick={handleSaveTemplate} className="w-full py-5 bg-sky-500 text-white rounded-[2rem] font-black uppercase text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all">GUARDAR PLANTILLA</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
