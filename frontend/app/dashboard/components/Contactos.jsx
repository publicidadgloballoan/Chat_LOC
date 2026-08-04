import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Plus, Mail, Phone, MessageSquare, Database, Trash2, Edit, Save, Globe, X, ChevronRight, CheckCircle2, Activity, Tag, Filter, Upload, Link, MoreHorizontal, Download } from 'lucide-react';
import axios from 'axios';

export default function Contactos({ agenda = [], mediaManifest = [], apiHost, token, refresh, selectedCompany }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('TODOS');
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState('');
  const [importGroup, setImportGroup] = useState('CLIENTES');
  
  // Mapping state: { columnIndex: fieldName }
  const [mapping, setMapping] = useState({});
  const [availableHeaders, setAvailableHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  
  const [newContact, setNewContact] = useState({ 
    name: '', phone: '', email: '', meta: '', group: 'CLIENTES', 
    instagram: '', facebook: '', linkedin: '', telegram: '', 
    dni: '', address: '', cbu: '', alias: '', bank: '', branch: '' 
  });
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [rubros, setRubros] = useState(['TODOS', 'CLIENTES', 'VENDEDORES', 'PROVEEDORES']);
  const [showManageRubros, setShowManageRubros] = useState(false);
  const [newRubroName, setNewRubroName] = useState('');
  
  // OCR Import State
  const [showOcrImport, setShowOcrImport] = useState(false);
  const [ocrImagePreview, setOcrImagePreview] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrNumbers, setOcrNumbers] = useState([]);
  const [ocrReference, setOcrReference] = useState(`Captura Imagen ${new Date().toLocaleDateString()}`);
  const [ocrGroup, setOcrGroup] = useState('CLIENTES');
  const ocrFileInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchRubros = async () => {
    try {
      const res = await axios.post(`http://${apiHost}:4000/api/data`, { action: 'get_rubros', companyId: selectedCompany?.id }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setRubros(['TODOS', ...res.data.rubros]);
    } catch (e) { console.error("Error fetching rubros", e); }
  };

  React.useEffect(() => {
    fetchRubros();
  }, [apiHost, token]);

  const handleAddRubro = async () => {
    if (!newRubroName) return;
    try {
      await axios.post(`http://${apiHost}:4000/api/data`, { action: 'add_rubro', name: newRubroName, companyId: selectedCompany?.id }, { headers: { Authorization: `Bearer ${token}` } });
      setNewRubroName('');
      fetchRubros();
    } catch (e) { alert("Error al añadir rubro"); }
  };

  const handleDeleteRubro = async (name) => {
    if (!confirm(`¿Borrar rubro ${name}?`)) return;
    try {
      await axios.post(`http://${apiHost}:4000/api/data`, { action: 'delete_rubro', name, companyId: selectedCompany?.id }, { headers: { Authorization: `Bearer ${token}` } });
      fetchRubros();
    } catch (e) { alert("Error al borrar rubro"); }
  };
  const fieldOptions = [
    { id: 'name', label: 'Nombre Completo', icon: <Users size={12}/> },
    { id: 'phone', label: 'Teléfono / WhatsApp', icon: <Phone size={12}/> },
    { id: 'email', label: 'Email', icon: <Mail size={12}/> },
    { id: 'dni', label: 'DNI / ID', icon: <Users size={12}/> },
    { id: 'address', label: 'Dirección', icon: <Users size={12}/> },
    { id: 'instagram', label: 'Instagram', icon: <Link size={12}/> },
    { id: 'facebook', label: 'Facebook', icon: <Link size={12}/> },
    { id: 'linkedin', label: 'LinkedIn', icon: <Link size={12}/> },
    { id: 'cbu', label: 'CBU / CVU', icon: <Database size={12}/> },
    { id: 'alias', label: 'Alias', icon: <Database size={12}/> },
    { id: 'bank', label: 'Banco', icon: <Database size={12}/> },
    { id: 'branch', label: 'Sucursal', icon: <Database size={12}/> },
    { id: 'detail', label: 'Notas / Detalles', icon: <MessageSquare size={12}/> },
    { id: 'ignore', label: 'Ignorar / Auto-Notas', icon: <X size={12}/> }
  ];

  const filtered = agenda.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (c.phone || '').includes(search) ||
                          (c.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesGroup = groupFilter === 'TODOS' || (c.group || c.group_name) === groupFilter;
    return matchesSearch && matchesGroup;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(c => c.id));
  };

  const selectOnly = (group) => {
    setSelectedIds(agenda.filter(c => (c.group || c.group_name) === group).map(c => c.id));
  };

  const handleBulkDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar ${selectedIds.length} contactos?`)) return;
    try {
      setLoading(true);
      await axios.post(`http://${apiHost}:4000/api/data`, { action: 'bulk_delete_agenda_contacts', ids: selectedIds }, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedIds([]);
      if (refresh) refresh();
      alert("Contactos eliminados");
    } catch (e) { alert("Error al eliminar"); }
    finally { setLoading(false); }
  };

  const handleBulkMove = async (newGroup) => {
    try {
      setLoading(true);
      await axios.post(`http://${apiHost}:4000/api/data`, { action: 'bulk_move_agenda_contacts', ids: selectedIds, group: newGroup }, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedIds([]);
      if (refresh) refresh();
      alert(`Contactos movidos a ${newGroup}`);
    } catch (e) { alert("Error al mover"); }
    finally { setLoading(false); }
  };

  const loadPreview = async (fileName) => {
    try {
      setLoading(true);
      const res = await axios.post(`http://${apiHost}:4000/api/data`, { action: 'get_file_preview', fileName }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setAvailableHeaders(res.data.headers);
        setPreviewRows(res.data.rows);
        
        // Auto-detect based on headers
        const initialMapping = {};
        res.data.headers.forEach((h, i) => {
          const l = h.toLowerCase();
          if (l.includes('nom') || l.includes('full')) initialMapping[i] = 'name';
          else if (l.includes('tel') || l.includes('cel') || l.includes('phone') || l.includes('wha')) initialMapping[i] = 'phone';
          else if (l.includes('mail')) initialMapping[i] = 'email';
          else if (l.includes('ig') || l.includes('insta')) initialMapping[i] = 'instagram';
          else if (l.includes('fb') || l.includes('face')) initialMapping[i] = 'facebook';
          else if (l.includes('link')) initialMapping[i] = 'linkedin';
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
        setSelectedFile(file.name);
        setImportStep(2);
        loadPreview(file.name);
        if (refresh) refresh();
      }
    } catch (e) { alert("Error al subir archivo"); }
    finally { setLoading(false); }
  };

  const handleAddManual = async () => {
    if (!newContact.phone) return alert("El teléfono es obligatorio");
    try {
      setLoading(true);
      await axios.post(`http://${apiHost}:4000/api/data`, { action: 'add_manual_contact', ...newContact, companyId: selectedCompany?.id }, { headers: { Authorization: `Bearer ${token}` } });
      setShowAdd(false);
      setNewContact({ 
        name: '', phone: '', email: '', meta: '', group: 'CLIENTES', 
        instagram: '', facebook: '', linkedin: '', telegram: '', 
        dni: '', address: '', cbu: '', alias: '', bank: '', branch: '' 
      });
      if (refresh) refresh();
      alert("Contacto guardado");
    } catch (e) { alert("Error al guardar"); }
    finally { setLoading(false); }
  };

  const handleEditClick = (contact) => {
    setNewContact({
      ...contact,
      group: contact.group || contact.group_name || 'CLIENTES',
      meta: contact.meta || contact.metadata || '',
      instagram: contact.instagram || '',
      facebook: contact.facebook || '',
      linkedin: contact.linkedin || '',
      telegram: contact.telegram || '',
      dni: contact.dni || '',
      address: contact.address || '',
      cbu: contact.cbu || '',
      alias: contact.alias || '',
      bank: contact.bank || '',
      branch: contact.branch || ''
    });
    setShowAdd(true);
  };

  const handleDeleteContact = async (contact) => {
    if (!confirm(`¿Estás seguro de eliminar a ${contact.name}?`)) return;
    try {
      setLoading(true);
      await axios.post(`http://${apiHost}:4000/api/data`, { action: 'delete_agenda_contact', phone: contact.phone }, { headers: { Authorization: `Bearer ${token}` } });
      if (refresh) refresh();
      alert("Contacto eliminado");
    } catch (e) { alert("Error al eliminar"); }
    finally { setLoading(false); }
  };

  const handleImport = async () => {
    if (!selectedFile) return alert("Selecciona un archivo");
    try {
      setLoading(true);
      await axios.post(`http://${apiHost}:4000/api/data`, {
        action: 'import_agenda_file',
        fileName: selectedFile,
        mapping,
        group: importGroup,
        companyId: selectedCompany?.id
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowImport(false);
      setImportStep(1);
      if (refresh) refresh();
      alert("Importación completada");
    } catch (e) { alert("Error al importar: " + e.message); }
    finally { setLoading(false); }
  };

  const handleOcrImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = reader.result;
      setOcrImagePreview(b64);
      try {
        setOcrLoading(true);
        const res = await axios.post(`http://${apiHost}:4000/api/data`, {
          action: 'ocr_extract_contacts',
          image: b64
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (res.data.success && res.data.numbers) {
          const items = res.data.numbers.map((n, idx) => ({
            id: idx,
            raw: n.raw,
            digits: n.digits,
            formatted: n.formatted,
            selected: true,
            customName: `Pendiente (+${n.digits})`
          }));
          setOcrNumbers(items);
        } else {
          alert(res.data.error || "No se detectaron números telefónicos en la imagen");
        }
      } catch (err) {
        console.error("Error procesando OCR:", err);
        alert("Error al procesar la imagen con OCR");
      } finally {
        setOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveOcrContacts = async () => {
    const selected = ocrNumbers.filter(n => n.selected);
    if (selected.length === 0) return alert("Selecciona al menos un número para agendar");
    try {
      setOcrLoading(true);
      const contactsToSave = selected.map(n => ({
        phone: n.digits,
        name: n.customName || `Pendiente (+${n.digits})`,
        group: ocrGroup,
        origin: 'OCR_IMAGEN',
        metadata: { reference: ocrReference, raw_ocr: n.raw }
      }));

      const res = await axios.post(`http://${apiHost}:4000/api/data`, {
        action: 'save_ocr_contacts',
        companyId: selectedCompany?.id,
        contacts: contactsToSave
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.success) {
        alert(`¡Exito! Se agendaron ${res.data.count} contactos desde la imagen.`);
        setShowOcrImport(false);
        setOcrNumbers([]);
        setOcrImagePreview('');
        if (refresh) refresh();
      } else {
        alert(res.data.error || "Error al guardar contactos");
      }
    } catch (e) {
      alert("Error al agendar contactos reconocidos");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleExportCSV = () => {
    const listToExport = filtered && filtered.length > 0 ? filtered : agenda;
    if (!listToExport || listToExport.length === 0) return alert("No hay contactos en la agenda para exportar");

    const headers = ["Nombre", "Telefono", "Email", "DNI", "Direccion", "Grupo", "Origen", "Instagram", "Facebook", "LinkedIn", "CBU", "Alias", "Banco", "Sucursal"];
    
    const rows = listToExport.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.dni || '').replace(/"/g, '""')}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${(c.group || c.group_name || '').replace(/"/g, '""')}"`,
      `"${(c.origin || '').replace(/"/g, '""')}"`,
      `"${(c.instagram || '').replace(/"/g, '""')}"`,
      `"${(c.facebook || '').replace(/"/g, '""')}"`,
      `"${(c.linkedin || '').replace(/"/g, '""')}"`,
      `"${(c.cbu || '').replace(/"/g, '""')}"`,
      `"${(c.alias || '').replace(/"/g, '""')}"`,
      `"${(c.bank || '').replace(/"/g, '""')}"`,
      `"${(c.branch || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `agenda_contactos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar en la agenda..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-sky-500 transition-all"
            />
          </div>
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-[500px] custom-scrollbar">
            {rubros.map(g => (
              <button 
                key={g}
                onClick={() => setGroupFilter(g)}
                className={`px-4 py-3 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${groupFilter === g ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:text-white'}`}
              >
                {g}
              </button>
            ))}
            <button onClick={() => setShowManageRubros(true)} className="px-4 py-3 rounded-lg text-[10px] font-black text-sky-400 hover:bg-sky-500/10 transition-all">EDITAR RUBROS</button>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="px-6 py-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center gap-3 shadow-lg shadow-amber-500/10"
            title="Exportar agenda actual a archivo CSV/Excel"
          >
            <Download size={16} className="text-amber-400" /> EXPORTAR CSV
          </button>
          <button 
            onClick={() => setShowOcrImport(true)}
            className="px-6 py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-3 shadow-lg shadow-emerald-500/10"
          >
            <Upload size={16} className="text-emerald-400" /> ESCANEAR CAPTURA (OCR)
          </button>
          <button 
            onClick={() => setShowImport(true)}
            className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
          >
            <Database size={16} className="text-purple-400" /> IMPORTAR MASIVO
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="px-8 py-4 bg-sky-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <Plus size={18} /> NUEVO CONTACTO
          </button>
        </div>
      </div>

      {/* Barra de Acciones Masivas */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="flex items-center justify-between p-6 bg-sky-500 rounded-3xl shadow-2xl shadow-sky-500/40 border border-sky-400/30"
          >
            <div className="flex items-center gap-6">
              <div className="bg-white/20 p-3 rounded-2xl text-white font-black text-sm">
                {selectedIds.length} SELECCIONADOS
              </div>
              <div className="flex gap-2">
                <button onClick={toggleSelectAll} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all">Todos</button>
                <button onClick={() => selectOnly('VENDEDORES')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all">Vendedores</button>
                <button onClick={() => selectOnly('CLIENTES')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all">Clientes</button>
              </div>
            </div>

              <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/10 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-[400px] custom-scrollbar">
                <span className="text-[8px] font-black text-white/60 uppercase ml-2 mr-1">Mover a:</span>
                {rubros.filter(r => r !== 'TODOS').map(r => (
                  <button key={r} onClick={() => handleBulkMove(r)} className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-[9px] font-black text-white uppercase transition-all whitespace-nowrap">{r}</button>
                ))}
              </div>
              <button onClick={handleBulkDelete} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-red-500/20">
                <Trash2 size={14} /> BORRAR MASIVO
              </button>
              <button onClick={() => setSelectedIds([])} className="p-3 text-white/60 hover:text-white transition-all"><X size={24}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass rounded-[3rem] border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-6 w-10">
                 <input 
                   type="checkbox" 
                   checked={selectedIds.length === filtered.length && filtered.length > 0}
                   onChange={toggleSelectAll}
                   className="w-5 h-5 rounded-lg border-white/20 bg-white/5 accent-sky-500 cursor-pointer"
                 />
              </th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Contacto</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Grupo / Etiqueta</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Canal / Origen</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Metadata</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((c, i) => (
              <tr key={i} className={`hover:bg-white/5 transition-all group ${selectedIds.includes(c.id) ? 'bg-sky-500/5' : ''}`}>
                <td className="p-6">
                   <input 
                     type="checkbox"
                     checked={selectedIds.includes(c.id)}
                     onChange={() => setSelectedIds(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
                     className="w-5 h-5 rounded-lg border-white/20 bg-white/5 accent-sky-500 cursor-pointer"
                   />
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center font-black text-sky-400 border border-sky-500/20 uppercase">
                      {c.name ? c.name.charAt(0) : 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">{c.name || 'Sin Nombre'}</div>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Phone size={10} /> {c.phone}</span>
                        {c.email && <span className="flex items-center gap-1 text-purple-400"><Mail size={10} /> {c.email}</span>}
                        {c.instagram && <span className="flex items-center gap-1 text-pink-400"><Globe size={10} /> IG</span>}
                        {c.facebook && <span className="flex items-center gap-1 text-blue-400"><Globe size={10} /> FB</span>}
                        {c.linkedin && <span className="flex items-center gap-1 text-sky-600"><Globe size={10} /> IN</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                   <div className="flex items-center gap-2">
                      <Tag size={12} className="text-sky-500" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{c.group_name || c.group || 'SIN GRUPO'}</span>
                   </div>
                </td>
                <td className="p-6">
                  <div className="space-y-1">
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-md text-[8px] font-black uppercase border border-green-500/20 inline-block mr-2">
                      {c.channel || 'N/A'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-tighter italic">
                      {c.origin?.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="text-[10px] font-medium text-slate-400 max-w-xs truncate italic">
                    {c.dni ? `DNI: ${c.dni} | ` : ''} {c.address ? `DIR: ${c.address} | ` : ''} {c.meta || '-'}
                  </div>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => handleEditClick(c)} className="p-2 hover:bg-sky-500/10 rounded-lg text-sky-400 transition-all"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteContact(c)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-all"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Agregar Manual */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 lg:p-10 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-8 lg:p-10 rounded-[3rem] border border-white/20 w-full max-w-4xl space-y-8 my-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sky-500/20 rounded-2xl text-sky-400"><Users size={24}/></div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Ficha de Contacto CRM</h3>
                </div>
                <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white transition-all"><X size={32} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Datos Personales */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 flex items-center gap-2"><Users size={12}/> Información Personal</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Nombre Completo</label>
                      <input value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} placeholder="Ej: Ignacio Fernandez" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white font-bold outline-none focus:border-sky-500 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">DNI / ID</label>
                      <input value={newContact.dni} onChange={e => setNewContact({...newContact, dni: e.target.value})} placeholder="Documento..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white font-bold outline-none focus:border-sky-500 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Telegram</label>
                      <input value={newContact.telegram} onChange={e => setNewContact({...newContact, telegram: e.target.value})} placeholder="@usuario..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white font-bold outline-none focus:border-sky-500 transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Dirección Física</label>
                      <input value={newContact.address} onChange={e => setNewContact({...newContact, address: e.target.value})} placeholder="Calle, Altura, Ciudad..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white font-bold outline-none focus:border-sky-500 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Grupo / Rubro CRM</label>
                      <select value={newContact.group} onChange={e => setNewContact({...newContact, group: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 rounded-2xl px-5 py-3 text-white font-bold outline-none appearance-none">
                        {rubros.filter(r => r !== 'TODOS').map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contacto & Redes */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 flex items-center gap-2"><Phone size={12}/> Canales & Redes</h4>
                  <div className="space-y-3">
                    <div className="relative"><Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500"/><input value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} placeholder="WhatsApp..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-xs font-bold outline-none focus:border-sky-500" /></div>
                    <div className="relative"><Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500"/><input value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} placeholder="Email..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-xs font-bold outline-none focus:border-purple-500" /></div>
                    <div className="relative"><Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500"/><input value={newContact.instagram} onChange={e => setNewContact({...newContact, instagram: e.target.value})} placeholder="Instagram..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-xs font-bold outline-none focus:border-pink-500" /></div>
                    <div className="relative"><Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"/><input value={newContact.facebook} onChange={e => setNewContact({...newContact, facebook: e.target.value})} placeholder="Facebook..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-xs font-bold outline-none focus:border-blue-500" /></div>
                    <div className="relative"><Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-600"/><input value={newContact.linkedin} onChange={e => setNewContact({...newContact, linkedin: e.target.value})} placeholder="LinkedIn..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-xs font-bold outline-none focus:border-sky-600" /></div>
                  </div>
                </div>

                {/* Bancos & Pagos */}
                <div className="md:col-span-3 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 flex items-center gap-2"><Database size={12}/> Información Bancaria</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1"><label className="text-[8px] font-black text-slate-400 uppercase ml-2">CBU / CVU</label><input value={newContact.cbu} onChange={e => setNewContact({...newContact, cbu: e.target.value})} placeholder="22 dígitos..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-sky-500" /></div>
                    <div className="space-y-1"><label className="text-[8px] font-black text-slate-400 uppercase ml-2">Alias</label><input value={newContact.alias} onChange={e => setNewContact({...newContact, alias: e.target.value})} placeholder="Alias bancario..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-sky-500" /></div>
                    <div className="space-y-1"><label className="text-[8px] font-black text-slate-400 uppercase ml-2">Banco</label><input value={newContact.bank} onChange={e => setNewContact({...newContact, bank: e.target.value})} placeholder="Nombre del banco..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-sky-500" /></div>
                    <div className="space-y-1"><label className="text-[8px] font-black text-slate-400 uppercase ml-2">Sucursal</label><input value={newContact.branch} onChange={e => setNewContact({...newContact, branch: e.target.value})} placeholder="Sucursal..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-sky-500" /></div>
                  </div>
                </div>

                <div className="md:col-span-3 pt-6 border-t border-white/10 flex items-center justify-between gap-6">
                   <p className="text-[10px] font-bold text-slate-500 uppercase max-w-sm">Asegúrate de verificar los datos bancarios antes de guardar para evitar errores en las transacciones.</p>
                   <button onClick={handleAddManual} disabled={loading} className="px-12 py-5 bg-sky-500 text-white rounded-2xl font-black uppercase text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                    {loading ? <Activity className="animate-spin" /> : <><Save size={20}/> GUARDAR EN CRM</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Importar (Tab Mapper) */}
      <AnimatePresence>
        {showImport && (
          <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 lg:p-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-8 lg:p-10 rounded-[3rem] border border-white/20 w-full max-w-6xl space-y-6 max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400"><Database size={24}/></div>
                   <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Importador Inteligente de Datos</h3>
                </div>
                <button onClick={() => setShowImport(false)} className="text-slate-500 hover:text-white transition-all"><X size={24} /></button>
              </div>

              {importStep === 1 ? (
                <div className="space-y-6 flex-1 flex flex-col items-center justify-center">
                  <div className="w-full max-w-xl p-10 bg-white/5 border border-dashed border-white/20 rounded-[3rem] text-center space-y-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-400"><Upload size={32} /></div>
                    <div><h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Subir Base de Datos</h3><p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Excel, CSV o SQLite</p></div>
                    <button onClick={() => fileInputRef.current.click()} className="px-8 py-4 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all">SELECCIONAR ARCHIVO</button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv, .xlsx, .xls, .db, .sqlite" className="hidden" />
                  </div>
                  <div className="w-full max-w-xl space-y-2">
                    <p className="text-[10px] font-black text-slate-600 uppercase text-center">O elige de la biblioteca</p>
                    <div className="grid grid-cols-2 gap-2">
                      {mediaManifest.filter(m => m.name.match(/\.(csv|db|sqlite|xlsx)$/i)).slice(0, 4).map((m, i) => (
                        <button key={i} onClick={() => { setSelectedFile(m.name); setImportStep(2); loadPreview(m.name); }} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5"><div className="flex items-center gap-3"><Database size={16} className="text-purple-400" /><span className="text-[10px] font-black text-white truncate max-w-[100px]">{m.name}</span></div><ChevronRight size={14} className="text-slate-600"/></button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between bg-purple-500/10 p-5 rounded-3xl border border-purple-500/20 shrink-0">
                    <div className="flex items-center gap-4">
                       <CheckCircle2 size={20} className="text-purple-400" />
                       <div className="text-left">
                          <span className="text-xs font-black text-purple-400 uppercase tracking-widest">{selectedFile}</span>
                          <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">Mapea las columnas haciendo clic en los encabezados</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <select value={importGroup} onChange={e => setImportGroup(e.target.value)} className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-white text-[10px] font-black outline-none appearance-none cursor-pointer">
                          <option value="CLIENTES">GRUPO: CLIENTES</option><option value="VENDEDORES">GRUPO: VENDEDORES</option><option value="PROVEEDORES">GRUPO: PROVEEDORES</option>
                       </select>
                       <button onClick={() => setImportStep(1)} className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-xl transition-all"><X size={18}/></button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto border border-white/5 rounded-3xl bg-black/20 custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-slate-900">
                          {availableHeaders.map((h, i) => (
                            <th key={i} className="p-4 border-r border-white/5">
                               <div className="space-y-2">
                                  <div className="text-[9px] font-black text-slate-500 uppercase truncate mb-2">{h}</div>
                                  <div className="relative">
                                    <select 
                                      value={mapping[i] || 'ignore'} 
                                      onChange={e => setMapping({...mapping, [i]: e.target.value})}
                                      className={`w-full text-[10px] font-black py-2 pl-3 pr-8 rounded-lg outline-none appearance-none cursor-pointer transition-all ${mapping[i] && mapping[i] !== 'ignore' ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-sky-500'}`}
                                    >
                                      {fieldOptions.map(opt => <option key={opt.id} value={opt.id} className="bg-[#1e293b] text-white font-bold">{opt.label}</option>)}
                                    </select>
                                    <ChevronRight size={12} className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none opacity-50" />
                                  </div>
                               </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-white/5 hover:bg-white/5 transition-all">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className={`p-4 text-[10px] border-r border-white/5 ${mapping[cIdx] && mapping[cIdx] !== 'ignore' ? 'font-bold text-white bg-sky-500/5' : 'text-slate-500'}`}>
                                {String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="shrink-0 pt-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"/>
                        <p className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">Las columnas marcadas como Ignorar se guardarán como notas automáticamente.</p>
                     </div>
                     <button 
                        onClick={handleImport} disabled={loading}
                        className="px-12 py-5 bg-sky-500 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-sky-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        {loading ? <Activity className="animate-spin" /> : <><CheckCircle2 size={20}/> FINALIZAR E IMPORTAR</>}
                      </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal Gestionar Rubros */}
      <AnimatePresence>
        {showManageRubros && (
          <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass p-10 rounded-[3rem] border border-white/20 w-full max-w-lg space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Gestionar Rubros</h3>
                <button onClick={() => setShowManageRubros(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
              </div>
              <div className="flex gap-2">
                <input value={newRubroName} onChange={e => setNewRubroName(e.target.value.toUpperCase())} placeholder="NUEVO RUBRO..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-sky-500" />
                <button onClick={handleAddRubro} className="p-3 bg-sky-500 text-white rounded-xl hover:scale-105 active:scale-95 transition-all"><Plus size={20}/></button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {rubros.filter(r => r !== 'TODOS').map(r => (
                  <div key={r} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{r}</span>
                    <button onClick={() => handleDeleteRubro(r)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal Escanear Captura OCR (Renderizado mediante Portal en document.body para desacoplar de transform/scrolls de padres) */}
      {showOcrImport && mounted && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b1329] glass p-4 rounded-2xl border border-emerald-500/40 w-full max-w-2xl h-[420px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-emerald-500/20 space-y-2"
            >
              {/* Header */}
              <div className="flex items-center justify-between shrink-0 pb-2 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <Upload size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Reconocimiento OCR por Imagen</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Escanea números de teléfono desde capturas de pantalla o imágenes</p>
                  </div>
                </div>
                <button onClick={() => { setShowOcrImport(false); setOcrNumbers([]); setOcrImagePreview(''); }} className="text-slate-400 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              {ocrNumbers.length === 0 ? (
                <div className="space-y-4 flex-1 flex flex-col items-center justify-center py-6">
                  <div className="w-full max-w-lg p-8 bg-white/5 border border-dashed border-emerald-500/30 rounded-[2.5rem] text-center space-y-4 flex flex-col items-center hover:bg-emerald-500/5 transition-all">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                      {ocrLoading ? <Activity size={30} className="animate-spin" /> : <Upload size={30} />}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white uppercase italic tracking-tighter">
                        {ocrLoading ? "Escaneando imagen con OCR..." : "Seleccionar Captura de Pantalla"}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                        {ocrLoading ? "Analizando números de teléfono..." : "Sube la imagen con los números telefónicos (PNG, JPG, JPEG)"}
                      </p>
                    </div>
                    {!ocrLoading && (
                      <button 
                        onClick={() => ocrFileInputRef.current.click()} 
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Upload size={14} /> SUBIR IMAGEN
                      </button>
                    )}
                    <input 
                      type="file" 
                      ref={ocrFileInputRef} 
                      onChange={handleOcrImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0 space-y-2 overflow-hidden">
                  {/* Reference & Config Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-white/5 p-2 rounded-xl border border-white/10 shrink-0">
                    <div className="space-y-0.5">
                      <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Etiqueta / Referencia Origen</label>
                      <input 
                        value={ocrReference} 
                        onChange={e => setOcrReference(e.target.value)} 
                        placeholder="Ej: Captura WA Promo" 
                        className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-2.5 py-1 text-white text-[11px] font-bold outline-none focus:border-emerald-500" 
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Rubro / Grupo CRM</label>
                      <select 
                        value={ocrGroup} 
                        onChange={e => setOcrGroup(e.target.value)} 
                        className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-2.5 py-1 text-white text-[11px] font-bold outline-none appearance-none cursor-pointer"
                      >
                        {rubros.filter(r => r !== 'TODOS').map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-end">
                      <button 
                        onClick={() => { setOcrNumbers([]); setOcrImagePreview(''); }} 
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-[8px] font-black uppercase transition-all flex items-center gap-1"
                      >
                        <X size={12} /> Cambiar Imagen
                      </button>
                    </div>
                  </div>

                  {/* Main Grid: Forced Side-by-Side Grid (cols-12) */}
                  <div className="grid grid-cols-12 gap-2 flex-1 min-h-0 overflow-hidden">
                    {/* Left: Image Thumbnail */}
                    <div className="col-span-4 bg-black/60 rounded-xl p-1.5 border border-white/10 flex items-center justify-center h-[200px] overflow-hidden">
                      {ocrImagePreview && (
                        <img 
                          src={ocrImagePreview} 
                          alt="Captura escaneada" 
                          className="max-h-[190px] max-w-full object-contain rounded border border-white/10 shadow" 
                        />
                      )}
                    </div>

                    {/* Right: Table of Detected Numbers */}
                    <div className="col-span-8 flex flex-col h-[200px] border border-white/10 rounded-xl bg-black/50 overflow-hidden">
                      <div className="px-2 py-1 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 size={12} /> {ocrNumbers.filter(n => n.selected).length} / {ocrNumbers.length} Seleccionados
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setOcrNumbers(ocrNumbers.map(n => ({ ...n, selected: true })))} 
                            className="text-[8px] font-black text-sky-400 hover:underline uppercase"
                          >
                            Todos
                          </button>
                          <span className="text-slate-600">|</span>
                          <button 
                            onClick={() => setOcrNumbers(ocrNumbers.map(n => ({ ...n, selected: false })))} 
                            className="text-[8px] font-black text-slate-500 hover:underline uppercase"
                          >
                            Ninguno
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                        {ocrNumbers.map((item) => (
                          <div 
                            key={item.id} 
                            className={`flex items-center justify-between px-2 py-1 rounded-lg border transition-all ${item.selected ? 'bg-emerald-500/10 border-emerald-500/30 text-white' : 'bg-white/5 border-white/5 text-slate-500 opacity-50'}`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <input 
                                type="checkbox" 
                                checked={item.selected} 
                                onChange={e => setOcrNumbers(ocrNumbers.map(n => n.id === item.id ? { ...n, selected: e.target.checked } : n))} 
                                className="w-3.5 h-3.5 rounded accent-emerald-500 cursor-pointer shrink-0" 
                              />
                              <Phone size={10} className="text-emerald-400 shrink-0" />
                              <span className="text-[11px] font-black tracking-wider text-white shrink-0">{item.formatted}</span>
                              <span className="text-[8px] font-mono text-slate-500 truncate max-w-[80px]">({item.raw})</span>
                              <input 
                                value={item.customName} 
                                onChange={e => setOcrNumbers(ocrNumbers.map(n => n.id === item.id ? { ...n, customName: e.target.value } : n))} 
                                placeholder="Nombre..." 
                                className="ml-auto w-36 bg-black/60 border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white font-bold outline-none focus:border-emerald-500" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Confirm Action */}
                  <div className="shrink-0 pt-1.5 border-t border-white/10 flex items-center justify-between">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">
                      Contactos agendados en estado "Pendiente" para identificarlos al hablar.
                    </p>
                    <button 
                      onClick={handleSaveOcrContacts} 
                      disabled={ocrLoading} 
                      className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {ocrLoading ? <Activity className="animate-spin" size={14} /> : <><CheckCircle2 size={14}/> AGENDAR CONTACTOS ({ocrNumbers.filter(n => n.selected).length})</>}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
      </div>
  );
}
