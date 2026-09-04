'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  Zap,
  Globe,
  ArrowUpRight,
  Search,
  Bell,
  ChevronDown,
  Building,
  Radio,
  Terminal,
  Mail,
  Calendar,
  Music,
  Video,
  Send,
  Plus,
  Tv,
  Camera,
  Share2,
  Trash2,
  Cpu,
  Play,
  Fingerprint,
  MousePointer2,
  Brain,
  Ticket,
  FileText,
  Eye,
  Paperclip,
  Pause,
  Save,
  Activity,
  ShieldCheck,
  Layers,
  RefreshCw,
  Power,
  AlertCircle,
  CheckCircle2,
  Box,
  Target,
  User,
  Filter,
  Clock,
  Smartphone,
  HeartPulse,
  Pencil,
  DollarSign,
  Coins
} from 'lucide-react';
import MktEmisivo from './components/MktEmisivo';
import Contactos from './components/Contactos';
import TicketsAdmin from './components/TicketsAdmin';
import LicensePanel from './components/LicensePanel';
import SetupCopilot from './components/SetupCopilot';
import axios from 'axios';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [stats, setStats] = useState({ companies: 0, bots: 0, tickets: 0, aiUsage: '0%' });
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showChannelMenu, setShowChannelMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [modelsStats, setModelsStats] = useState<any[]>([]);
  const [qrData, setQrData] = useState<any>(null);
  const [debugPhones, setDebugPhones] = useState<string[]>([]);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [systemLogs, setSystemLogs] = useState("");
  const [allInstances, setAllInstances] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any>({ a1: {}, a2: { knowledge: '' }, a3: { templates: [] }, flow: { steps: [] } });
  const [conversations, setConversations] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [commandLogs, setCommandLogs] = useState<any[]>([]);
  const [mktCampaigns, setMktCampaigns] = useState<any[]>([]);
  const [mktTemplates, setMktTemplates] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>({ cpu: 0, queue_size: 0, stress_mode: false });
  const [customCommands, setCustomCommands] = useState<any[]>([
    { trigger: 'iaon', action: 'Activar IA', context: 'Activa la respuesta automática para el chat actual' },
    { trigger: 'iaoff', action: 'Desactivar IA', context: 'Apaga la respuesta automática para el chat actual' },
    { trigger: 'systema', action: 'Status Hardware', context: 'Devuelve CPU, RAM y latencia del motor AMD' },
    { trigger: '.flu', action: 'Listado de flujos', context: 'Devuelve el listado de flows disponibles y cual es el activo' },
    { trigger: 'rag_list', action: 'Listado de archivos RAG', context: 'Devuelve el listado de biblioteca de medios RAG' }
  ]);
  const [mediaManifest, setMediaManifest] = useState<any[]>([
    { name: 'Presentacion_Canes_Oficial.pdf', type: 'Documentos', context: 'Presentación del producto Canes y servicios.' },
    { name: 'Canes_Resumen.pdf', type: 'Documentos', context: 'Presentación resumen para clientes.' },
    { name: 'Logo_Canes.pdf', type: 'Fotos', context: 'Logo oficial fondo blanco.' },
    { name: 'Manual_Canes.pdf', type: 'Documentos', context: 'Manual de procedimientos Canes.' },
    { name: 'Presentacion_Canes_Fondo_Blanco.pdf', type: 'Documentos', context: 'Presentación resumen para enviar a clientes.' },
    { name: 'Video Canes', type: 'Videos', url: 'https://www.youtube.com/watch?v=Zbs_suP9ddc', context: 'Video de presentación de la empresa Canes.' }
  ]);
  const [selectedFolder, setSelectedFolder] = useState('Todos');
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [analyzingMedia, setAnalyzingMedia] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [knowledgeFiles, setKnowledgeFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState<string | null>(null);
  const [connectData, setConnectData] = useState<any>({});
  const [editingChannel, setEditingChannel] = useState<any>(null);
  const [showEditChannelModal, setShowEditChannelModal] = useState<boolean>(false);
  const [editChannelData, setEditChannelData] = useState<any>({});
  
  // Admin Config States
  const [hwStats, setHwStats] = useState<any>(null);
  const [adminCompanies, setAdminCompanies] = useState<any[]>([]);
  const [adminAgents, setAdminAgents] = useState<any[]>([]);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [editingAgent, setEditingAgent] = useState<any>(null);

  // Structured Knowledge
  const [structuredKnowledge, setStructuredKnowledge] = useState<any>({
    stock: [],
    pricing: { cashPrice: 0, listPrice: 0, minDeposit: 0, supportedQuotas: 1, approxInterest: 0 },
    identity: { mission: '', vision: '', voiceTone: 'Amable', faqs: '' },
    logistics: { coverageZones: '', deliveryTerms: '', daysAndHours: '' }
  });

  // Flows
  const [flows, setFlows] = useState<any[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<any>(null);
  const [flowScale, setFlowScale] = useState(1);
  const [flowPan, setFlowPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [draggingNode, setDraggingNode] = useState<any>(null);
  const [connectingNode, setConnectingNode] = useState<any>(null);
  const [editingNode, setEditingNode] = useState<any>(null);
  const [selectedElement, setSelectedElement] = useState<{id: string, type: 'node' | 'edge'} | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [tokenPriceUSD, setTokenPriceUSD] = useState<number>(0.00002);
  const [wasenderStatus, setWasenderStatus] = useState<string>('stopped');

  // Refs for high-frequency access
  const flowRef = React.useRef<any>(null);
  const selectedRef = React.useRef<any>(null);

  useEffect(() => {
    flowRef.current = selectedFlow;
  }, [selectedFlow]);

  useEffect(() => {
    selectedRef.current = selectedElement;
  }, [selectedElement]);

  useEffect(() => {
    const savedUser = localStorage.getItem('PICE SaaS_user');
    const token = localStorage.getItem('PICE SaaS_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      fetchInitialData(token);
    } else {
      window.location.href = '/login';
    }
  }, []);

  const fetchLogs = async () => {
    try {
      const apiHost = window.location.hostname;
      const token = localStorage.getItem('PICE SaaS_token');
      if (!token) return;
      const res = await axios.get(`http://${apiHost}:4000/api/logs`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.logs) setSystemLogs(res.data.logs);
      
      const compParam = selectedCompany?.id ? `?companyId=${selectedCompany.id}` : '';
      const resInst = await axios.get(`http://${apiHost}:4000/api/wa/instances${compParam}`, { headers: { Authorization: `Bearer ${token}` } });
      if (resInst.data) setAllInstances(resInst.data);
    } catch (e: any) {
      // Silently ignore
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      fetchLogs();
      if (activeTab === 'Atención Humana' || activeTab === 'Dashboard') {
        fetchData();
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [activeTab, selectedCompany]);

  const fetchWhatsAppQR = async (customInstance?: string) => {
    const instance = customInstance || connectData.botName || (showConnectModal === 'whatsapp_mkt' ? 'mkt_colab' : selectedChannel?.instanceName);
    if (!instance) {
      alert("Por favor, ingrese un nombre para la instancia");
      return;
    }
    try {
      const apiHost = window.location.hostname;
      const res = await axios.get(`http://${apiHost}:4000/api/wa/qr?instance=${instance}`);
      setQrData(res.data);
    } catch (err: any) {
      console.error('Error fetching QR:', err.message || err);
    }
  };

  const handleConnectMetaAPI = async () => {
    if (!connectData.botName || !connectData.phone_number_id || !connectData.access_token) {
      alert("Por favor complete todos los campos (Nombre, Phone ID y Token)");
      return;
    }
    try {
      const apiHost = window.location.hostname;
      await axios.post(`http://${apiHost}:4000/channels/connect/${showConnectModal}`, {
        botName: connectData.botName,
        companyId: selectedCompany?.id || 1,
        credentials: {
          type: showConnectModal,
          phone_number_id: connectData.phone_number_id,
          access_token: connectData.access_token
        }
      });
      alert('Canal Meta API conectado correctamente');
      setShowConnectModal(null);
      const token = localStorage.getItem('PICE SaaS_token');
      if (token) fetchInitialData(token);
    } catch (e: any) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    }
  };


  const handleDeleteInstance = async (instName: string) => {
    if(!confirm(`¿Estás seguro de eliminar la instancia ${instName}? Esto la desconectará por completo.`)) return;
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const apiHost = window.location.hostname;
      await axios.post(`http://${apiHost}:4000/api/data`, {
        action: 'delete_instance',
        instance: instName
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Instancia eliminada correctamente.');
      if (token) {
        fetchInitialData(token);
      } else {
        fetchData();
      }
    } catch(e) {
      alert('Error eliminando instancia.');
    }
  };

  const handleSaveChannelEdit = async () => {
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const apiHost = window.location.hostname;
      await axios.put(`http://${apiHost}:4000/api/channels/${editingChannel.id}`, {
        botName: editChannelData.botName,
        configA1: editChannelData.configA1,
        configA2: editChannelData.configA2,
        configA3: editChannelData.configA3
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      // Auto sync or restart logic could go here if needed, but for now we just save.
      setShowEditChannelModal(false);
      alert('Canal actualizado correctamente.');
      fetchInitialData(token!);
    } catch(err: any) {
      console.error('Error updating channel:', err);
      alert('Error al guardar la configuración del canal.');
    }
  };

  const handleSyncInstances = async () => {
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const apiHost = window.location.hostname;
      await axios.post(`http://${apiHost}:4000/api/data`, { action: 'sync' }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Servicios sincronizados y reconectados.');
      fetchData();
    } catch(e) {
      alert('Error sincronizando servicios.');
    }
  };

  
  const fetchModelsStats = async () => {
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const res = await axios.get(`http://${window.location.hostname}:4000/api/models-stats`, { headers: { Authorization: `Bearer ${token}` } });
      setModelsStats(res.data);
    } catch(e) {}
  };

  const fetchData = async (overrideCompanyId?: number) => {
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const inst = selectedChannel?.instanceName || 'ALL';
      const apiHost = window.location.hostname;
      const cId = overrideCompanyId || selectedCompany?.id || '';
      const res = await axios.get(`http://${apiHost}:4000/api/data?instance=${inst}&companyId=${cId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      axios.get(`http://${apiHost}:4000/api/data?action=get_wasender_status`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => { if (r.data?.success && r.data?.config) setWasenderStatus(r.data.config.status || 'stopped'); })
        .catch(() => {});
      if (res.data.success) {
        setConfigs(res.data.configs || {});
        console.log(`[FETCH] Inst: ${inst}, CompID: ${cId}, Found: ${res.data.conversations?.length || 0} chats`);
        setConversations((res.data.conversations || []).filter(Boolean));
        setPendingCount(res.data.pendingCount || 0);
        setMessages((res.data.messages || []).filter(Boolean));
        setCommandLogs((res.data.commandLogs || []).filter(Boolean));
        if (res.data.customCommands) setCustomCommands(res.data.customCommands);
        if (res.data.mediaManifest) setMediaManifest(res.data.mediaManifest);
        if (res.data.mktCampaigns) setMktCampaigns(res.data.mktCampaigns);
        if (res.data.mktTemplates) setMktTemplates(res.data.mktTemplates);
        setAgenda(res.data.agenda || []);
        setTickets(res.data.tickets || []);
        setDebugPhones((res.data.configs?.debugPhones || []).filter(Boolean));
        setDebugEnabled(res.data.configs?.debugMode || false);
        if (res.data.systemStatus) setSystemStatus(res.data.systemStatus);
      }
    } catch (e: any) { 
      if (e.response?.status === 403 || e.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      } else if (e.response?.status !== 500) {
        console.error('Fetch error:', e.message); 
      }
    }
  };

  // Refresca SOLO la lista de conversaciones sin tocar los mensajes del chat abierto
  const fetchConversationsOnly = async () => {
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const inst = selectedChannel?.instanceName || 'ALL';
      const apiHost = window.location.hostname;
      const cId = selectedCompany?.id || '';
      const res = await axios.get(`http://${apiHost}:4000/api/data?instance=${inst}&companyId=${cId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // Solo actualizar la lista de conversaciones — NO tocar messages ni selectedConversation
        setConversations((res.data.conversations || []).filter(Boolean));
        setPendingCount(res.data.pendingCount || 0);
        setTickets(res.data.tickets || []);
        if (res.data.systemStatus) setSystemStatus(res.data.systemStatus);
      }
    } catch (e: any) { 
      if (e.response?.status === 403 || e.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      } else if (e.response?.status !== 500) {
        console.error('Fetch conversations error:', e.message); 
      }
    }
  };

  const handleSaveConfig = async (type: string, config: any, applyAll = false) => {
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const inst = selectedChannel?.instanceName;
      const apiHost = window.location.hostname;
      const res = await axios.post(`http://${apiHost}:4000/api/data`, { 
          action: (applyAll || !inst) ? 'apply_all_config' : 'save_config', 
          type, 
          config, 
          instance: inst,
          companyId: selectedCompany?.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert(applyAll || !inst ? "Sincronización masiva completada" : "Configuración guardada");
        fetchData();
      }
    } catch (e) { alert("Error al guardar: " + e); }
  };

  const handleSaveDebug = async (phones: string[], enabled: boolean) => {
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const inst = selectedChannel?.instanceName || 'nico_ventas_wa';
      const apiHost = window.location.hostname;
      await axios.post(`http://${apiHost}:4000/api/debug/toggle`, { 
          instance: inst, enabled, phones 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) { console.error('Debug save error:', e); }
  };

  const fetchKnowledgeFiles = async () => {
    if (!selectedCompany) return;
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const apiHost = window.location.hostname;
      const inst = selectedChannel?.instanceName || selectedCompany.channels?.[0]?.instanceName;
      if (!inst) return;
      const res = await axios.get(`http://${apiHost}:4000/api/knowledge/files`, {
        params: { company: selectedCompany.businessName, channel: inst },
        headers: { Authorization: `Bearer ${token}` }
      });
      setKnowledgeFiles(res.data);
    } catch (e: any) { console.error('Error fetching files:', e.message || e); }
  };

  const fetchStructuredKnowledge = async () => {
    const inst = selectedChannel?.instanceName || selectedCompany?.channels?.[0]?.instanceName;
    if (!inst) return;
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const apiHost = window.location.hostname;
      const res = await axios.get(`http://${apiHost}:4000/api/knowledge/structured`, {
        params: { instanceName: inst },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) setStructuredKnowledge(res.data);
    } catch (e: any) { console.error('Error fetching structured knowledge:', e.message || e); }
  };

  const handleSaveStructured = async (type: string, data: any) => {
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const apiHost = window.location.hostname;
      await axios.post(`http://${apiHost}:4000/api/knowledge/${type}`, {
        instanceName: selectedChannel.instanceName,
        [type]: data
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Información actualizada en el Cerebro");
      fetchStructuredKnowledge();
    } catch (e: any) { alert("Error al guardar: " + e.message); }
  };

  const handleSummarize = async () => {
    if (!selectedConversation) return;
    setSummarizing(true);
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const apiHost = window.location.hostname;
      const res = await axios.post(`http://${apiHost}:4000/api/data`, { 
        action: 'summarize_conversation', 
        phone: selectedConversation,
        instance: conversations.find(c => c.numero === selectedConversation)?.instance 
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setShowSummaryModal(res.data.summary);
      } else {
        alert("No se pudo generar el resumen: " + res.data.error);
      }
    } catch (e: any) {
      alert("Error al resumir conversación");
    }
    setSummarizing(false);
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'upload_media');
      if (selectedCompany?.id) {
        formData.append('companyId', String(selectedCompany.id));
      }
      
      const token = localStorage.getItem('PICE SaaS_token');
      const apiHost = window.location.hostname;
      
      // Upload principal a la biblioteca (assets/colaboratium)
      await axios.post(`http://${apiHost}:4000/api/data`, formData, { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        } 
      });
      
      // Intentar también subir a la carpeta de entrenamiento legacy por compatibilidad
      if (selectedCompany && selectedChannel) {
        try {
          const legacyData = new FormData();
          legacyData.append('file', file);
          await axios.post(`http://${apiHost}:4000/api/knowledge/upload`, legacyData, {
            params: { company: selectedCompany.businessName, channel: selectedChannel.instanceName },
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
          });
        } catch (e) { console.warn("Legacy upload skipped or failed"); }
      }

      fetchData(); 
      fetchKnowledgeFiles();
      alert("Archivo subido e indexado correctamente en el ecosistema PICE SaaS");
    } catch (e: any) {
      alert("Error al subir archivo");
    }
    setUploading(false);
  };

  const fetchFlows = async () => {
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const apiHost = window.location.hostname;
      const res = await axios.get(`http://${apiHost}:4000/api/flows`, { 
        params: { companyId: selectedCompany?.id },
        headers: { Authorization: `Bearer ${token}` } 
      });
      console.log("[FLOWS] Fetched for company " + selectedCompany?.id + ":", res.data);
      setFlows(res.data);
      // Solo seleccionar si no hay nada seleccionado o si el seleccionado no está en la lista
      if (res.data.length > 0 && !selectedFlow) {
        setSelectedFlow(res.data[0].content);
      }
    } catch (e: any) { console.error("Flow fetch error:", e.message || e); }
  };

  const handleSaveFlow = async () => {
    if (!selectedFlow || !selectedFlow.name) return;
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const apiHost = window.location.hostname;
      
      // 1. Guardar en repositorio de flujos
      await axios.post(`http://${apiHost}:4000/api/flows/save`, { 
        name: selectedFlow.name, 
        flow: selectedFlow,
        companyId: selectedCompany?.id
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      // 2. Aplicar/Desplegar al motor (Nucleo IA)
      if (selectedChannel) {
        await axios.post(`http://${apiHost}:4000/api/data`, { 
          action: 'save_config', 
          type: 'flow', 
          config: selectedFlow,
          flowName: selectedFlow.name,
          instance: selectedChannel.instanceName 
        }, { headers: { Authorization: `Bearer ${token}` } });
      }

      alert("Pipeline guardado y desplegado con éxito en " + (selectedChannel?.instanceName || 'instancia actual'));
      fetchFlows();
      fetchData(); // Para actualizar el badge de activo
    } catch (e: any) { alert("Error al guardar/desplegar: " + e.message); }
  };

  const handleDeleteFlow = async () => {
    if (!selectedFlow || !selectedFlow.name) return;
    if (!confirm(`¿Estás seguro de que deseas eliminar el flujo "${selectedFlow.name}"?`)) return;
    
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const apiHost = window.location.hostname;
      
      await axios.delete(`http://${apiHost}:4000/api/flows/${selectedFlow.name}`, {
        params: { companyId: selectedCompany?.id },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`Flujo "${selectedFlow.name}" eliminado con éxito.`);
      
      // Actualizar la lista local
      const resFlows = await axios.get(`http://${apiHost}:4000/api/flows`, {
        params: { companyId: selectedCompany?.id },
        headers: { Authorization: `Bearer ${token}` }
      });
      setFlows(resFlows.data);
      
      // Seleccionar el primer flujo de la lista o resetear
      if (resFlows.data.length > 0) {
        setSelectedFlow(resFlows.data[0].content);
      } else {
        setSelectedFlow(null);
      }
    } catch (e: any) {
      console.error("Error deleting flow:", e.message || e);
      alert(`Error al eliminar flujo: ${e.response?.data?.error || e.message}`);
    }
  };


  useEffect(() => {
    let interval: any;
    if (activeTab === 'Configuración') {
      fetchAdminData();
      interval = setInterval(fetchAdminData, 10000);
    }
    if (activeTab === 'Debugger') {
      fetchLogs();
      interval = setInterval(fetchLogs, 5000);
    }
    // Tab specific data fetching
    const dataTabs = ['Dashboard', 'CRM Agenda', 'MKT Emisivo', 'Comandos OS', 'Biblioteca', 'Botones A1', 'Entrenamiento', 'Tickets A3', 'Atención Humana', 'Flujos IA', 'Modelos de IA'];
    
    if (dataTabs.includes(activeTab)) {
      fetchData();
      
      if (activeTab === 'Entrenamiento') {
        fetchKnowledgeFiles();
        fetchStructuredKnowledge();
      }
      if (activeTab === 'Flujos IA') {
        fetchFlows();
      }
      if (activeTab === 'Modelos de IA') {
        fetchModelsStats();
      }
      if (activeTab === 'Atención Humana') {
        interval = setInterval(fetchConversationsOnly, 8000);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, selectedChannel, selectedCompany]);

  const fetchInitialData = async (token: string) => {
    try {
      const apiHost = window.location.hostname;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://${apiHost}:4000/api/companies`, config);
      setCompanies((res.data || []).filter(Boolean));
      if (res.data && res.data.length > 0) {
        const colab = res.data.find((c: any) => c && (c.businessName === 'Canes' || c.name === 'Canes'));
        const initial = colab || res.data[0];
        setSelectedCompany((prev: any) => prev || initial);
        const companyChannels = (initial?.channels || []).filter(Boolean);
        setChannels(companyChannels);
        
        // Default to all channels (null)
        setSelectedChannel((prev: any) => prev !== undefined ? prev : null);
        
        fetchStats(token, initial?.id);
        fetchActivity(token, initial?.id);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err.message || err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (token: string, companyId?: number) => {
    try {
      const apiHost = window.location.hostname;
      const config = { headers: { Authorization: `Bearer ${token}` }, params: { companyId } };
      const res = await axios.get(`http://${apiHost}:4000/api/stats`, config);
      setStats(res.data);
    } catch (err: any) { console.error('Stats error:', err.message || err); }
  };

  const fetchActivity = async (token: string, companyId?: number) => {
    try {
      const apiHost = window.location.hostname;
      const config = { headers: { Authorization: `Bearer ${token}` }, params: { companyId } };
      const res = await axios.get(`http://${apiHost}:4000/api/activity`, config);
      setActivity(res.data);
    } catch (err: any) { console.error('Stats error:', err.message || err); }
  };

  const fetchAdminData = async () => {
    try {
      const apiHost = window.location.hostname;
      const token = localStorage.getItem('PICE SaaS_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const resHw = await axios.get(`http://${apiHost}:4000/api/admin/hardware`, config);
      setHwStats(resHw.data);
      
      const resComp = await axios.get(`http://${apiHost}:4000/api/admin/companies`, config);
      setAdminCompanies(resComp.data);
      
      const resAg = await axios.get(`http://${apiHost}:4000/api/admin/agents`, { ...config, params: { companyId: selectedCompany?.id } });
      setAdminAgents(resAg.data);
    } catch (e: any) { console.error("Admin fetch error:", e.message || e); }
  };

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company);
    setChannels(company.channels || []);
    setSelectedChannel(null);
    setSelectedFlow(null);
    setFlows([]);
    setConversations([]);
    setMessages([]);
    setConfigs({});
    setMktTemplates([]);
    setAgenda([]);
    setTickets([]);
    setShowCompanyMenu(false);
    const token = localStorage.getItem('PICE SaaS_token');
    if (token) {
      fetchStats(token, company.id);
      fetchActivity(token, company.id);
      fetchData(company.id);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const newScale = flowScale - e.deltaY * 0.001;
    setFlowScale(Math.min(Math.max(0.2, newScale), 3));
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('canvas-area')) {
      setIsPanning(true);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setFlowPan({ x: flowPan.x + e.movementX, y: flowPan.y + e.movementY });
    }
    if (draggingNode) {
      const currentFlow = flowRef.current || { nodes: [], edges: [] };
      const newNodes = (currentFlow.nodes || []).map((n: any) => {
        if (n.id === draggingNode.id) {
          const px = n.position?.x ?? 0;
          const py = n.position?.y ?? 0;
          return { ...n, position: { x: px + e.movementX / flowScale, y: py + e.movementY / flowScale } };
        }
        return n;
      });
      setSelectedFlow({ ...currentFlow, nodes: newNodes });
    }
  };

  const handleNodeConnection = (nodeId: string, portType: 'in' | 'out') => {
    const currentFlow = flowRef.current || { nodes: [], edges: [] };
    if (portType === 'out') {
      setConnectingNode(nodeId);
    } else if (connectingNode && portType === 'in' && connectingNode !== nodeId) {
      const newEdge = { id: `edge_${Date.now()}`, source: connectingNode, target: nodeId };
      setSelectedFlow({ ...currentFlow, edges: [...(currentFlow.edges || []), newEdge] });
      setConnectingNode(null);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingNode(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    const currentFlow = flowRef.current || { nodes: [], edges: [] };
    const newNodes = (currentFlow.nodes || []).filter((n: any) => n.id !== nodeId);
    const newEdges = (currentFlow.edges || []).filter((e: any) => e.source !== nodeId && e.target !== nodeId);
    setSelectedFlow({ ...currentFlow, nodes: newNodes, edges: newEdges });
    if (selectedRef.current?.id === nodeId) setSelectedElement(null);
  };

  const handleDeleteEdge = (edgeId: string) => {
    const currentFlow = flowRef.current || { nodes: [], edges: [] };
    const newEdges = (currentFlow.edges || []).filter((e: any) => e.id !== edgeId);
    setSelectedFlow({ ...currentFlow, edges: newEdges });
    if (selectedRef.current?.id === edgeId) setSelectedElement(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedRef.current) {
        if (selectedRef.current.type === 'node') handleDeleteNode(selectedRef.current.id);
        else handleDeleteEdge(selectedRef.current.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Only subscribe once

  const getNodeIcon = (type: string) => {
    switch(type) {
      case 'webhook': return <Play size={18} />;
      case 'identity': return <Fingerprint size={18} />;
      case 'buttons': return <MousePointer2 size={18} />;
      case 'rag': return <Brain size={18} />;
      case 'ticket': return <Ticket size={18} />;
      case 'vision': return <Eye size={18} />;
      case 'approval': return <Pause size={18} />;
      case 'media': return <Camera size={18} />;
      case 'decision': return <ArrowUpRight size={18} />;
      case 'ai_branch': return <Zap size={18} />;
      default: return <Box size={18} />;
    }
  };

  const getNodeColor = (type: string) => {
    switch(type) {
      case 'webhook': return 'from-sky-500/20 to-sky-500/5 border-sky-500/30 text-sky-400';
      case 'identity': return 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400';
      case 'buttons': return 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-400';
      case 'rag': return 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400';
      case 'ticket': return 'from-pink-500/20 to-pink-500/5 border-pink-500/30 text-pink-400';
      case 'approval': return 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400';
      case 'decision': return 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30 text-indigo-400';
      case 'ai_branch': return 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 text-yellow-400';
      default: return 'from-slate-500/20 to-slate-500/5 border-slate-500/30 text-slate-400';
    }
  };

  if (!user || loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      <button 
        onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
        className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-all"
      >
        FORZAR CIERRE DE SESIÓN
      </button>
    </div>
  );

  const handleAction = async (action: string, payload: any = {}) => {
    try {
      const token = localStorage.getItem('PICE SaaS_token');
      const apiHost = window.location.hostname;
      const res = await axios.post(`http://${apiHost}:4000/api/data`, { 
        action, 
        ...payload 
      }, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (e) {
      console.error("Action error:", e);
    }
  };

  const renderContent = () => {
    if (activeTab === 'Dashboard') {
      return (
        <div className="p-10 space-y-10 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard label="Empresas en Red" value={stats.companies.toString()} growth="+1" icon={<Building className="text-sky-400" />} />
            <StatCard label="Instancias AI" value={stats.bots.toString()} growth="+3" icon={<Zap className="text-amber-400" />} />
            <StatCard label="Total Tickets" value={stats.tickets.toString()} growth="Real-time" icon={<MessageSquare className="text-purple-400" />} />
            <StatCard label="Rendimiento IA" value={stats.aiUsage} growth="Estable" icon={<Globe className="text-green-400" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h3 className="font-black text-xl text-white tracking-tight">Actividad de Comunicación</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Últimos tickets gestionados por la IA</p>
                </div>
                <button 
                  onClick={() => setActiveTab('Atención Humana')}
                  className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5"
                >
                   <ArrowUpRight size={20} className="text-sky-400" />
                </button>
              </div>
              <div className="p-0">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.03] text-[10px] font-black uppercase text-slate-500 tracking-[0.25em]">
                    <tr>
                      <th className="px-8 py-5">Número</th>
                      <th className="px-8 py-5">Estado</th>
                      <th className="px-8 py-5">Nombre Detectado</th>
                      <th className="px-8 py-5 text-right">Último Mensaje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {conversations.length > 0 ? conversations.map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-all group">
                         <td className="px-8 py-5 flex items-center gap-3">
                            <div className="w-8 h-8 bg-sky-500/20 rounded-xl flex items-center justify-center font-black text-sky-400 text-xs relative shrink-0">
                                {row.channel === 'WA' && <MessageSquare size={10} className="absolute -top-1 -right-1 text-green-500 bg-black rounded-full" />}
                                {row.channel === 'TELEGRAM' && <Send size={10} className="absolute -top-1 -right-1 text-blue-400 bg-black rounded-full" />}
                                {row.channel === 'INSTAGRAM' && <Camera size={10} className="absolute -top-1 -right-1 text-pink-500 bg-black rounded-full" />}
                                {row.channel === 'FACEBOOK' && <Share2 size={10} className="absolute -top-1 -right-1 text-blue-600 bg-black rounded-full" />}
                                {row.channel === 'EMAIL' && <Mail size={10} className="absolute -top-1 -right-1 text-gray-400 bg-black rounded-full" />}
                                {(row.nombre && row.nombre.charAt(0)) || (row.numero ? String(row.numero).charAt(0) : '?')}
                            </div>
                            <span className="text-xs font-black text-white">{row.numero}</span>
                         </td>
                         <td className="px-8 py-5">
                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border ${row.silent ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-green-500/10 text-green-400 border-green-400/20'}`}>
                               {row.silent ? 'SILENCIOSO' : 'IA ACTIVA'}
                            </span>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-bold text-slate-400">{row.nombre || 'Desconocido'}</span>
                               {row.last_origin === 'MKT' && <span className="bg-sky-500/20 text-sky-400 px-1 py-0.5 rounded text-[6px] font-black">MKT</span>}
                            </div>
                         </td>
                         <td className="px-8 py-5 text-right text-[10px] text-slate-500 font-mono italic">{row.last_msg_date}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="p-20 text-center text-slate-600 font-bold italic">No hay conversaciones activas en esta instancia</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-to-br from-sky-600 via-indigo-700 to-purple-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-white/10 blur-[80px] group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10">
                  <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                    <Zap size={24} className="text-white fill-white" />
                  </div>
                  <h4 className="text-2xl font-black text-white mb-2 leading-tight">MÓDULO DE DESPLIEGUE</h4>
                  <p className="text-white/70 text-sm mb-8 font-medium">Conecta una nueva instancia de WhatsApp o Telegram a la red de PICE SaaS en segundos.</p>
                  <button className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:translate-y-0">
                    CREAR INSTANCIA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    
    if (activeTab === 'Modelos de IA') {
      const totalTokens = modelsStats.reduce((acc, m) => acc + (Number(m.tokens_used) || 0), 0);
      const costPerTokenUSD = tokenPriceUSD !== undefined && tokenPriceUSD >= 0 ? tokenPriceUSD : 0.00002;
      const totalCostUSD = totalTokens * costPerTokenUSD;

      const ollamaModels = modelsStats.filter(m => 
        (m.model_name || '').toLowerCase().includes('ollama') || 
        (m.model_name || '').toLowerCase().includes('local')
      );
      const ollamaTokens = ollamaModels.reduce((acc, m) => acc + (Number(m.tokens_used) || 0), 0);
      const ollamaCostUSD = ollamaTokens * costPerTokenUSD;

      const totalSuccess = modelsStats.reduce((acc, m) => acc + (Number(m.success_count) || 0), 0);
      const totalFail = modelsStats.reduce((acc, m) => acc + (Number(m.fail_count) || 0), 0);
      const totalOps = totalSuccess + totalFail;
      const successRate = totalOps > 0 ? ((totalSuccess / totalOps) * 100).toFixed(1) : '100.0';

      const maxTokens = Math.max(...modelsStats.map(m => Number(m.tokens_used) || 0), 1);

      return (
        <div className="p-10 space-y-10 animate-in fade-in duration-500 overflow-y-auto h-[calc(100vh-6rem)] custom-scrollbar">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
                Modelos de IA & Métricas de Consumo
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Monitoreo consolidado de volumen de tokens, costos estimados en USD e inferencias locales con Ollama.
              </p>
            </div>
            
            <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
              {/* Input Box para modificar tarifa por token en vivo */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-2xl shadow-inner">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Costo x Token (USD):
                </span>
                <div className="relative flex items-center">
                  <span className="text-xs text-emerald-400 font-black mr-1">$</span>
                  <input
                    type="number"
                    step="0.000001"
                    min="0"
                    value={tokenPriceUSD}
                    onChange={(e) => setTokenPriceUSD(parseFloat(e.target.value) || 0)}
                    className="w-28 bg-black/50 border border-emerald-500/30 focus:border-emerald-400 rounded-xl px-2.5 py-1 text-xs font-mono font-black text-emerald-300 focus:outline-none transition-all text-right shadow-sm"
                    placeholder="0.00002"
                  />
                </div>
              </div>

              <button
                onClick={fetchModelsStats}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-slate-300 transition-all active:scale-95"
              >
                <RefreshCw size={14} className="text-blue-400" />
                <span>Actualizar Datos</span>
              </button>
            </div>
          </div>

          {/* BANNER DE RESUMEN GLOBAL (KPIs de Consumo y Costos en USD) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI 1: TOTAL DE TOKENS */}
            <div className="glass p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Cpu size={80} className="text-blue-400" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                  <Cpu size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Tokens Procesados</p>
                  <p className="text-xs text-blue-400/80 font-bold">Consumo Global Acumulado</p>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-white tracking-tight">
                  {totalTokens.toLocaleString('es-AR')}
                </h3>
                <p className="text-xs text-slate-400">Inferencia en Nube + Servidor Local</p>
              </div>
            </div>

            {/* KPI 2: COSTO EQUIVALENTE EN USD */}
            <div className="glass p-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign size={80} className="text-emerald-400" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                  <DollarSign size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equivalente Estimado USD</p>
                  <p className="text-xs text-emerald-400/80 font-bold">Costo Inferencia IA</p>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-emerald-400 tracking-tight">
                  ${totalCostUSD < 0.01 ? totalCostUSD.toFixed(4) : totalCostUSD.toFixed(2)} USD
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                    ${(costPerTokenUSD * 1000).toFixed(4)} / 1K Toks
                  </span>
                  <span>Tarifa promedio</span>
                </div>
              </div>
            </div>

            {/* KPI 3: MODELO LOCAL OLLAMA */}
            <div className="glass p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Brain size={80} className="text-purple-400" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
                  <Brain size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modelo Local Ollama</p>
                  <p className="text-xs text-purple-400/80 font-bold">Cuantificación In-House</p>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-purple-300 tracking-tight">
                  {ollamaTokens.toLocaleString('es-AR')} <span className="text-sm font-bold text-purple-400/70">toks</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Ahorro local estimado: <span className="text-purple-300 font-bold">${ollamaCostUSD.toFixed(4)} USD</span>
                </p>
              </div>
            </div>

            {/* KPI 4: EFICIENCIA Y OPERACIONES */}
            <div className="glass p-6 rounded-3xl border border-amber-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={80} className="text-amber-400" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20">
                  <Activity size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasa de Éxito Inferencia</p>
                  <p className="text-xs text-amber-400/80 font-bold">{totalOps} Operaciones Totales</p>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-amber-300 tracking-tight">
                  {successRate}%
                </h3>
                <p className="text-xs text-slate-400">
                  {totalSuccess} Éxitos | <span className="text-red-400 font-bold">{totalFail} Fallos</span>
                </p>
              </div>
            </div>
          </div>

          {/* DETALLE INDIVIDUAL DE MODELOS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Coins size={18} className="text-blue-400" />
                <span>Detalle por Modelo de Inteligencia Artificial</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {modelsStats.length} Modelos Registrados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modelsStats.map((model, i) => {
                const modelToks = Number(model.tokens_used) || 0;
                const modelCostUSD = modelToks * costPerTokenUSD;
                const isLocal = (model.model_name || '').toLowerCase().includes('ollama') || (model.model_name || '').toLowerCase().includes('local');
                const progressPct = Math.min(100, Math.round((modelToks / maxTokens) * 100));

                return (
                  <div key={model.model_name} className="glass p-6 rounded-3xl border border-white/10 space-y-5 hover:border-white/20 transition-all group relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl border ${isLocal ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                          {isLocal ? <Brain size={22}/> : <Cpu size={22}/>}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white leading-snug group-hover:text-blue-400 transition-colors">
                            {i + 1}. {model.model_name}
                          </h4>
                          <span className={`inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                            isLocal 
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' 
                              : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                          }`}>
                            {isLocal ? 'Inferencia Local Ollama' : 'API Cloud Provider'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tokens & USD Breakdown */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Tokens Procesados:</span>
                        <span className="text-white font-black text-sm">{modelToks.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                        <span className="text-slate-400 font-bold">Equivalente USD:</span>
                        <span className="text-emerald-400 font-black text-sm">${modelCostUSD < 0.01 ? modelCostUSD.toFixed(4) : modelCostUSD.toFixed(3)} USD</span>
                      </div>
                    </div>

                    {/* Usage Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>Participación en consumo</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isLocal ? 'bg-gradient-to-r from-purple-500 to-indigo-400' : 'bg-gradient-to-r from-blue-500 to-emerald-400'}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Success / Fail counts */}
                    <div className="flex gap-3 pt-1">
                      <div className="flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Éxitos</p>
                        <p className="text-xl font-black text-emerald-400 mt-0.5">{model.success_count}</p>
                      </div>
                      <div className="flex-1 bg-red-500/5 border border-red-500/10 rounded-2xl p-3 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fallos</p>
                        <p className="text-xl font-black text-red-400 mt-0.5">{model.fail_count}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Administrador de tickets') {
      return <TicketsAdmin selectedChannel={selectedChannel} selectedCompany={selectedCompany} />;
    }

    if (activeTab === 'STRESS TEST') {
      return <SystemView status={systemStatus} onAction={handleAction} instance={selectedChannel?.instanceName} />;
    }


    if (activeTab === 'Flujos IA') {
      const currentFlow = selectedFlow || { nodes: [], edges: [] };

      return (
        <div className="p-10 space-y-10 animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col overflow-hidden select-none">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Editor de Flujos Nodal</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Zoom: {Math.round(flowScale * 100)}% | Pan: {flowPan.x}, {flowPan.y}</span>
                    <span className="text-[8px] font-black bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-md uppercase tracking-widest">
                      RUNNING: {configs.activeFlowName || 'DEFAULT'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 p-2 bg-white/5 rounded-xl border border-white/10">
                   <button onClick={() => setFlowScale(Math.min(3, flowScale + 0.1))} className="p-2 hover:bg-white/10 rounded-lg text-white font-black">+</button>
                   <button onClick={() => setFlowScale(Math.max(0.2, flowScale - 0.1))} className="p-2 hover:bg-white/10 rounded-lg text-white font-black">-</button>
                   <button onClick={() => { setFlowScale(1); setFlowPan({x:0, y:0}); }} className="px-4 py-2 hover:bg-white/10 rounded-lg text-white text-[9px] font-black uppercase tracking-widest">RESET</button>
                </div>
              </div>
              <div className="flex gap-4">
                  <button 
                    onClick={() => setSelectedFlow({ name: 'nuevo_flujo', nodes: [], edges: [] })}
                    className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    + NUEVO
                  </button>
                  
                 <div className="relative">
                   <select 
                     value={selectedFlow?.name || ''}
                     className="appearance-none bg-slate-900 border border-white/20 rounded-xl px-4 py-2 pr-8 text-xs font-bold text-white outline-none cursor-pointer hover:border-sky-500/50 transition-all min-w-[200px]"
                     style={{ colorScheme: 'dark' }}
                     onChange={(e) => {
                       const f = flows.find(fl => fl.name === e.target.value);
                       if (f) setSelectedFlow(f.content);
                     }}
                   >
                      <option value="" disabled style={{background:'#0f172a', color:'#64748b'}}>Seleccionar Flujo</option>
                      {flows.map(f => <option key={f.name} value={f.name} style={{background:'#0f172a', color:'white'}}>{f.name.toUpperCase()}.FLU</option>)}
                   </select>
                   <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>

                 {selectedFlow && selectedFlow.name && (
                    <button 
                      onClick={handleDeleteFlow}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center"
                      title="Eliminar Flujo"
                    >
                      <Trash2 size={16} />
                    </button>
                 )}

                 <button 
                   onClick={handleSaveFlow}
                   className="bg-sky-500 hover:bg-sky-400 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all"
                 >
                   DESPLEGAR PIPELINE
                 </button>
              </div>
           </div>

           <div 
             onWheel={handleWheel}
             onMouseDown={handleCanvasMouseDown}
             onMouseMove={handleCanvasMouseMove}
             onMouseUp={handleCanvasMouseUp}
             onMouseLeave={handleCanvasMouseUp}
             className="flex-1 glass rounded-[3rem] border border-white/10 relative overflow-hidden bg-black/40 group canvas-area cursor-grab active:cursor-grabbing"
           >
              {/* GRID BACKGROUND */}
              <div 
                className="absolute inset-0 pointer-events-none transition-transform duration-75"
                style={{ 
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', 
                  backgroundSize: `${30 * flowScale}px ${30 * flowScale}px`,
                  backgroundPosition: `${flowPan.x}px ${flowPan.y}px`
                }}
              ></div>
              
              {/* NODES CANVAS */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ 
                  transform: `translate(${flowPan.x}px, ${flowPan.y}px) scale(${flowScale})`,
                  transformOrigin: '0 0'
                }}
              >
                 <div className="relative w-full h-full">
                    {currentFlow.nodes?.length === 0 ? (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 italic pointer-events-none">
                          <Box size={48} className="mb-4 opacity-20" />
                          <p className="text-sm font-bold uppercase tracking-widest">Cargue o cree un flujo para comenzar</p>
                       </div>
                    ) : (
                      <>
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                           <defs>
                              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                 <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                              </marker>
                           </defs>
                           {currentFlow.edges?.map((edge: any) => {
                              const sourceNode = currentFlow.nodes.find((n:any) => n.id === edge.source);
                              const targetNode = currentFlow.nodes.find((n:any) => n.id === edge.target);
                              if (!sourceNode || !targetNode) return null;
                              
                              const x1 = (sourceNode.position?.x ?? 0) + 250;
                              const y1 = (sourceNode.position?.y ?? 0) + 60;
                              const x2 = targetNode.position?.x ?? 0;
                              const y2 = (targetNode.position?.y ?? 0) + 60;
                              
                              const cp1x = x1 + (x2 - x1) / 2;
                              const cp2x = x1 + (x2 - x1) / 2;
                              const isSelected = selectedElement?.id === edge.id;

                              return (
                                 <g key={edge.id} className="cursor-pointer group/edge" onClick={(e) => { e.stopPropagation(); setSelectedElement({id: edge.id, type: 'edge'}); }}>
                                    <path 
                                      d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
                                      stroke="transparent" strokeWidth="20" fill="none"
                                    />
                                    <path 
                                      d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
                                      stroke={isSelected ? '#38bdf8' : '#475569'} 
                                      strokeWidth={isSelected ? "4" : "3"} 
                                      fill="none" markerEnd="url(#arrow)"
                                      className={`transition-all ${isSelected ? 'opacity-100' : 'opacity-40 group-hover/edge:opacity-100'}`}
                                    />
                                 </g>
                              );
                           })}
                        </svg>

                        {currentFlow.nodes?.map((node: any) => (
                           <div 
                             key={node.id}
                             onMouseDown={(e) => { e.stopPropagation(); setDraggingNode(node); setSelectedElement({id: node.id, type: 'node'}); }}
                             className={`absolute w-[250px] bg-gradient-to-br ${getNodeColor(node.type)} p-6 rounded-[2rem] border backdrop-blur-xl shadow-2xl space-y-4 group/node cursor-move pointer-events-auto ${connectingNode === node.id ? 'ring-2 ring-sky-500 animate-pulse' : ''} ${selectedElement?.id === node.id ? 'border-sky-500 ring-2 ring-sky-500/50' : 'border-white/10'}`}
                             style={{ left: node.position?.x ?? 0, top: node.position?.y ?? 0 }}
                           >
                              <div className="flex items-center justify-between pointer-events-none">
                                 <div className="flex items-center gap-3">
                                    {getNodeIcon(node.type)}
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{node.name || node.data?.label || node.type}</span>
                                 </div>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                                   className="w-6 h-6 flex items-center justify-center bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 transition-all pointer-events-auto"
                                 >
                                    <Trash2 size={12} />
                                 </button>
                              </div>
                              <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed pointer-events-none">{node.description || node.data?.label || ''}</p>
                              <div className="pt-4 border-t border-white/5 flex justify-between items-center pointer-events-auto">
                                 <span className="text-[8px] font-black opacity-50 uppercase">Configurar</span>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); setEditingNode(node); }}
                                   className="text-[8px] font-black hover:text-white transition-all bg-white/5 px-3 py-1 rounded-lg"
                                 >
                                   CONFIG
                                 </button>
                              </div>

                              {/* HANDLES */}
                              <div 
                                onClick={(e) => { e.stopPropagation(); handleNodeConnection(node.id, 'in'); }}
                                className={`absolute top-1/2 -left-2 w-4 h-4 rounded-full border border-white/20 -translate-y-1/2 cursor-pointer transition-all ${connectingNode && connectingNode !== node.id ? 'bg-sky-500 scale-150 shadow-[0_0_10px_#0ea5e9]' : 'bg-slate-800'}`}
                              ></div>
                              <div 
                                onClick={(e) => { e.stopPropagation(); handleNodeConnection(node.id, 'out'); }}
                                className={`absolute top-1/2 -right-2 w-4 h-4 bg-slate-800 border border-white/20 rounded-full -translate-y-1/2 cursor-pointer hover:bg-sky-500 hover:scale-150 transition-all`}
                              ></div>
                           </div>
                        ))}
                      </>
                    )}
                 </div>
              </div>

              {/* EDIT PANEL */}
              <AnimatePresence>
                {editingNode && (
                  <motion.div 
                    initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }}
                    className="absolute top-0 right-0 w-[350px] h-full glass border-l border-white/10 z-[100] p-10 flex flex-col pointer-events-auto shadow-2xl"
                  >
                     <div className="flex justify-between items-center mb-8">
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Configurar Nodo</h4>
                        <button onClick={() => setEditingNode(null)} className="text-slate-500 hover:text-white"><LogOut size={20} className="rotate-90"/></button>
                     </div>
                     <div className="space-y-6 flex-1">
                        <InputGroup label="NOMBRE" value={editingNode.name} onChange={(v) => {
                          const newNodes = currentFlow.nodes.map((n:any) => n.id === editingNode.id ? {...n, name: v} : n);
                          setSelectedFlow({...currentFlow, nodes: newNodes});
                          setEditingNode({...editingNode, name: v});
                        }} />
                        <InputGroup label="DESCRIPCIÓN" value={editingNode.description} onChange={(v) => {
                          const newNodes = currentFlow.nodes.map((n:any) => n.id === editingNode.id ? {...n, description: v} : n);
                          setSelectedFlow({...currentFlow, nodes: newNodes});
                          setEditingNode({...editingNode, description: v});
                        }} />
                        {editingNode.type === 'decision' && (
                           <div className="space-y-2">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CASOS (Separados por coma)</span>
                              <textarea className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none font-mono" placeholder="Precio, Stock, Ayuda..."></textarea>
                           </div>
                        )}
                        {editingNode.type === 'ai_branch' && (
                           <div className="space-y-2">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PROMPT DE DECISIÓN</span>
                              <textarea className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none font-mono" placeholder="Analiza si el cliente quiere comprar o solo preguntar..."></textarea>
                           </div>
                        )}
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* NODE PALETTE */}
              <div className="absolute left-10 bottom-10 flex gap-4 p-4 bg-black/80 backdrop-blur-2xl rounded-[3rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in slide-in-from-left-10 duration-700 pointer-events-auto">
                 <div className="flex items-center gap-2 pr-4 border-r border-white/10 mr-2">
                    <Box size={16} className="text-slate-500" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Librería</span>
                 </div>
                 {['webhook', 'identity', 'buttons', 'rag', 'vision', 'approval', 'ticket', 'decision', 'ai_branch'].map(type => (
                    <button 
                      key={type}
                      onClick={() => {
                        const newNode = {
                          id: `node_${Date.now()}`,
                          type,
                          name: type.toUpperCase(),
                          description: `Módulo de ${type}`,
                          position: { x: (100 - flowPan.x) / flowScale, y: (100 - flowPan.y) / flowScale }
                        };
                        setSelectedFlow({ ...currentFlow, nodes: [...currentFlow.nodes, newNode] });
                      }}
                      className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-slate-400 hover:bg-sky-500 hover:text-white transition-all group/btn relative"
                    >
                       {getNodeIcon(type)}
                       <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900 border border-white/10 text-white text-[8px] font-black rounded-xl opacity-0 group-hover/btn:opacity-100 transition-all uppercase pointer-events-none shadow-2xl whitespace-nowrap">
                          {type === 'ai_branch' ? 'IA DECISION' : type}
                       </div>
                    </button>
                 ))}
              </div>
           </div>
        </div>
      );
    }

    if (activeTab === 'Configuración') {
      return (
        <div className="p-10 space-y-12 animate-in slide-in-from-bottom-10 duration-500 overflow-y-auto h-[calc(100vh-6rem)] custom-scrollbar">
           <div className="flex justify-between items-center">
              <div>
                 <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Configuración de Plataforma</h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Hardware, Gestión de Empresas y Agentes Humanos</p>
              </div>
           </div>

           {/* 0. LICENCIA */}
           <div className="glass p-8 rounded-[2.5rem] border border-white/10">
             <div className="flex items-center gap-3 mb-6">
               <ShieldCheck size={18} className="text-indigo-400" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado de Licencia SaaS</span>
             </div>
             <LicensePanel
               apiHost={typeof window !== 'undefined' ? window.location.hostname : 'localhost'}
               token={typeof window !== 'undefined' ? localStorage.getItem('PICE SaaS_token') : null}
               companyId={selectedCompany?.id}
               onCompanyCreated={fetchAdminData}
             />
           </div>

           {/* 1. HARDWARE & STATS */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass p-8 rounded-[2rem] border border-white/10 space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400"><Cpu size={20} /></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Servidor CPU</span>
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-white">{hwStats?.cpu || 'Cargando...'}</h4>
                    <span className="text-[10px] font-bold text-sky-500 uppercase">{hwStats?.cores} Núcleos Detectados</span>
                 </div>
              </div>
              <div className="glass p-8 rounded-[2rem] border border-white/10 space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><Zap size={20} /></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Memoria RAM</span>
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-white">{hwStats?.memory} Total</h4>
                    <span className="text-[10px] font-bold text-purple-500 uppercase">{hwStats?.freeMemory} Disponible</span>
                 </div>
              </div>
              <div className="glass p-8 rounded-[2rem] border border-white/10 space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400"><Radio size={20} /></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Uptime Sistema</span>
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-white">{hwStats?.uptime}</h4>
                    <span className="text-[10px] font-bold text-amber-500 uppercase">Sin Interrupciones</span>
                 </div>
              </div>
              <div className="glass p-8 rounded-[2rem] border border-white/10 space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-400"><LayoutDashboard size={20} /></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Consumo Tokens</span>
                 </div>
                 <div>
                    <h4 className="text-sm font-black text-white">{hwStats?.tokensUsed?.toLocaleString()}</h4>
                    <span className="text-[10px] font-bold text-green-500 uppercase">Tokens IA este mes</span>
                 </div>
              </div>
           </div>

           {/* 2. TABLAS PRINCIPALES */}
           <div className="grid grid-cols-1 gap-12">
              {/* EMPRESAS */}
              <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-8">
                 <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                       <Building size={18} className="text-sky-400" /> Gestión de Empresas
                    </h3>
                 </div>
                 <div className="overflow-x-auto rounded-2xl border border-white/5">
                    <table className="w-full text-left">
                       <thead className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <tr>
                             <th className="px-6 py-4">ID</th>
                             <th className="px-6 py-4">Empresa / Razón Social</th>
                             <th className="px-6 py-4">CUIT</th>
                             <th className="px-6 py-4">Contacto (Web/Mails)</th>
                             <th className="px-6 py-4 text-right">Acciones</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {adminCompanies.map(c => (
                            <tr key={c.id} className="hover:bg-white/5 transition-all text-xs font-bold">
                               <td className="px-6 py-4 text-sky-400">#{c.id}</td>
                               <td className="px-6 py-4">
                                  <span className="block text-white uppercase">{c.businessName}</span>
                                  <span className="block text-[10px] text-slate-500">{c.legalName || 'S/N'}</span>
                               </td>
                               <td className="px-6 py-4 font-mono text-slate-400">{c.taxId}</td>
                               <td className="px-6 py-4">
                                  <span className="block text-slate-400">{c.website || '-'}</span>
                                  <span className="block text-[10px] text-slate-600 italic">{c.emails || '-'}</span>
                               </td>
                               <td className="px-6 py-4 text-right">
                                  <button 
                                    onClick={() => setEditingCompany(c)}
                                    className="p-2 bg-sky-500/10 text-sky-400 rounded-lg hover:bg-sky-500 hover:text-white transition-all"
                                  >EDITAR</button>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* AGENTES HUMANOS */}
              <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-8">
                 <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                       <Users size={18} className="text-purple-400" /> Agentes Humanos ({selectedCompany?.businessName})
                    </h3>
                    <button 
                      onClick={() => setEditingAgent({ companyId: selectedCompany?.id, role: 'agente', status: 'active' })}
                      className="px-6 py-3 bg-purple-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-500/20"
                    >+ NUEVO AGENTE</button>
                 </div>
                 <div className="overflow-x-auto rounded-2xl border border-white/5">
                    <table className="w-full text-left">
                       <thead className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <tr>
                             <th className="px-6 py-4">Agente</th>
                             <th className="px-6 py-4">Email / Teléfono</th>
                             <th className="px-6 py-4">Rol</th>
                             <th className="px-6 py-4">Status</th>
                             <th className="px-6 py-4 text-right">Acciones</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {adminAgents.map(a => (
                            <tr key={a.id} className="hover:bg-white/5 transition-all text-xs font-bold">
                               <td className="px-6 py-4 flex items-center gap-3">
                                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">{a.name.charAt(0)}</div>
                                  <span className="text-white uppercase">{a.name}</span>
                               </td>
                               <td className="px-6 py-4">
                                  <span className="block text-slate-400">{a.email}</span>
                                  <span className="block text-[10px] text-slate-600">{a.phone || '-'}</span>
                               </td>
                               <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${a.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-sky-500/10 text-sky-500'}`}>{a.role}</span>
                               </td>
                               <td className="px-6 py-4">
                                  <span className={`w-2 h-2 rounded-full inline-block mr-2 ${a.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></span>
                                  <span className="uppercase text-[9px] text-slate-400">{a.status}</span>
                               </td>
                               <td className="px-6 py-4 text-right space-x-2">
                                  <button onClick={() => setEditingAgent(a)} className="p-2 bg-white/5 text-slate-400 rounded-lg hover:text-white">EDITAR</button>
                                  <button 
                                    onClick={async () => {
                                      if(!confirm("¿Borrar agente?")) return;
                                      const apiHost = window.location.hostname;
                                      const token = localStorage.getItem('PICE SaaS_token');
                                      await axios.delete(`http://${apiHost}:4000/api/admin/agents/${a.id}`, { headers: { Authorization: `Bearer ${token}` } });
                                      fetchAdminData();
                                    }}
                                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"
                                  >BORRAR</button>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

           {/* MODALES DE EDICIÓN */}
           <AnimatePresence>
             {editingCompany && (
               <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-10">
                 <div className="glass w-full max-w-2xl p-12 rounded-[3rem] border border-white/20 shadow-2xl relative space-y-8">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Editar Empresa #{editingCompany.id}</h3>
                    <div className="grid grid-cols-2 gap-6">
                       <InputGroup label="NOMBRE FANTASÍA" value={editingCompany.businessName} onChange={(v) => setEditingCompany({...editingCompany, businessName: v})} />
                       <InputGroup label="RAZÓN SOCIAL" value={editingCompany.legalName} onChange={(v) => setEditingCompany({...editingCompany, legalName: v})} />
                       <InputGroup label="CUIT" value={editingCompany.taxId} onChange={(v) => setEditingCompany({...editingCompany, taxId: v})} />
                       <InputGroup label="TIPO INSCRIPCIÓN" value={editingCompany.taxType} onChange={(v) => setEditingCompany({...editingCompany, taxType: v})} />
                       <InputGroup label="TELÉFONOS" value={editingCompany.phones} onChange={(v) => setEditingCompany({...editingCompany, phones: v})} />
                       <InputGroup label="WEBSITE" value={editingCompany.website} onChange={(v) => setEditingCompany({...editingCompany, website: v})} />
                    </div>
                    <InputGroup label="EMAILS (separados por coma)" value={editingCompany.emails} onChange={(v) => setEditingCompany({...editingCompany, emails: v})} />
                    <div className="flex gap-4 pt-6">
                       <button onClick={() => setEditingCompany(null)} className="flex-1 py-4 border border-white/10 rounded-2xl font-black text-xs uppercase text-slate-500">CANCELAR</button>
                       <button 
                         onClick={async () => {
                            const apiHost = window.location.hostname;
                            const token = localStorage.getItem('PICE SaaS_token');
                            await axios.put(`http://${apiHost}:4000/api/admin/companies/${editingCompany.id}`, editingCompany, { headers: { Authorization: `Bearer ${token}` } });
                            setEditingCompany(null);
                            fetchAdminData();
                         }}
                         className="flex-1 py-4 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase"
                       >GUARDAR CAMBIOS</button>
                    </div>
                 </div>
               </div>
             )}

             {editingAgent && (
               <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-10">
                 <div className="glass w-full max-w-lg p-12 rounded-[3rem] border border-white/20 shadow-2xl relative space-y-8">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{editingAgent.id ? 'Editar Agente' : 'Nuevo Agente'}</h3>
                    <div className="space-y-6">
                       <InputGroup label="NOMBRE COMPLETO" value={editingAgent.name} onChange={(v) => setEditingAgent({...editingAgent, name: v})} />
                       <InputGroup label="EMAIL" value={editingAgent.email} onChange={(v) => setEditingAgent({...editingAgent, email: v})} />
                       <InputGroup label="TELÉFONO" value={editingAgent.phone} onChange={(v) => setEditingAgent({...editingAgent, phone: v})} />
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">ROL</label>
                             <select value={editingAgent.role} onChange={(e) => setEditingAgent({...editingAgent, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none">
                                <option value="admin">Admin</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="agente">Agente</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">STATUS</label>
                             <select value={editingAgent.status} onChange={(e) => setEditingAgent({...editingAgent, status: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none">
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                             </select>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-4 pt-6">
                       <button onClick={() => setEditingAgent(null)} className="flex-1 py-4 border border-white/10 rounded-2xl font-black text-xs uppercase text-slate-500">CANCELAR</button>
                       <button 
                         onClick={async () => {
                            const apiHost = window.location.hostname;
                            const token = localStorage.getItem('PICE SaaS_token');
                            if (editingAgent.id) {
                               await axios.put(`http://${apiHost}:4000/api/admin/agents/${editingAgent.id}`, editingAgent, { headers: { Authorization: `Bearer ${token}` } });
                            } else {
                               await axios.post(`http://${apiHost}:4000/api/admin/agents`, editingAgent, { headers: { Authorization: `Bearer ${token}` } });
                            }
                            setEditingAgent(null);
                            fetchAdminData();
                         }}
                         className="flex-1 py-4 bg-purple-500 text-white rounded-2xl font-black text-xs uppercase"
                       >GUARDAR AGENTE</button>
                    </div>
                 </div>
               </div>
             )}
           </AnimatePresence>
        </div>
      );
    }


    if (activeTab === 'Debugger') {

      return (
        <div className="p-10 space-y-10 animate-in fade-in duration-500 overflow-y-auto h-[calc(100vh-6rem)] custom-scrollbar">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Centro de Control & Debugger</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Monitoreo del Sistema y Estado de Canales</p>
            </div>
            <div className="flex gap-4">
               <button 
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('PICE SaaS_token');
                    await axios.post(`http://${window.location.hostname}:4000/api/data`, { action: 'sync' }, { headers: { Authorization: `Bearer ${token}` } });
                    alert("Sincronización de Webhooks enviada");
                  } catch (e) { alert("Error al sincronizar"); }
                }}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase hover:bg-white/10 transition-all flex items-center gap-2"
               >
                 <Zap size={14} /> SINCRONIZAR ENGINE
               </button>
               <button 
                onClick={() => {
                  const newState = !debugEnabled;
                  setDebugEnabled(newState);
                  handleSaveDebug(debugPhones, newState);
                }}
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:scale-105 transition-all ${debugEnabled ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-500/10 text-slate-500 border border-white/10'}`}
               >
                 <div className={`w-2 h-2 rounded-full ${debugEnabled ? 'bg-white animate-pulse' : 'bg-slate-500'}`}></div>
                 DEBUG MODE: {debugEnabled ? 'ON' : 'OFF'}
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass p-10 rounded-[3rem] border border-white/10 flex flex-col h-[600px]">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                   <Terminal size={18} className="text-sky-400" /> Live System Logs
                 </h3>
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Streaming activo...</span>
              </div>
              <div className="flex-1 bg-black/40 rounded-3xl p-6 font-mono text-[11px] overflow-y-auto custom-scrollbar border border-white/5">
                 <pre className="text-sky-300/80 leading-relaxed">
                   {systemLogs || "Esperando logs del núcleo..."}
                 </pre>
              </div>
            </div>

            <div className="space-y-8">
                <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-10">
                   <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <Radio size={18} className="text-emerald-400" /> Centro de Conexiones
                      </h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleSyncInstances}
                          className="px-4 py-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all"
                        >REINICIAR WA</button>
                        <button 
                          onClick={() => setShowConnectModal('whatsapp')}
                          className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                        >+ NUEVA INSTANCIA WA</button>
                      </div>
                   </div>

                    {/* TODOS LOS CANALES (TABLA) */}
                    <div className="overflow-x-auto w-full bg-white/5 rounded-2xl border border-white/5">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="py-3 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                            <th className="py-3 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Plataforma</th>
                            <th className="py-3 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Instancia / Bot</th>
                            <th className="py-3 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {(() => {
                            // Combinar Canales de la empresa seleccionada con estado en vivo de Baileys / Instagram
                            const merged = (channels || []).map(ch => {
                              const instName = ch.instanceName || ch.instance_name || '';
                              const live = (allInstances || []).find(i => i.instanceName?.toLowerCase() === instName?.toLowerCase());
                              const isMkt = instName.toLowerCase().includes('mkt') || (ch.platform || '').toLowerCase().includes('mkt');
                              const isOnline = isMkt 
                                ? (wasenderStatus === 'connected' || wasenderStatus === 'running' || wasenderStatus === 'qr_ready' || live?.state === 'open' || live?.state === 'connected')
                                : (live ? (live.state === 'open' || live.state === 'connected') : (ch.status === 'connected' && live?.state !== 'close' && live?.state !== 'disconnected'));
                              return { ...ch, state: isOnline ? 'open' : (live?.state || 'close'), isOnline, livePhone: live?.phone || ch.livePhone };
                            });

                            if (merged.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={4} className="py-8 text-center text-[9px] font-bold text-slate-500 uppercase">
                                    Sin canales conectados. Crea una nueva instancia ↑
                                  </td>
                                </tr>
                              );
                            }

                            return merged.map((inst: any, i) => (
                              <tr key={i} className="group hover:bg-white/[0.08] transition-all">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${inst.isOnline ? (inst.platform === 'whatsapp' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]') : 'bg-amber-500/70'}`}></div>
                                    <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${inst.isOnline ? (inst.platform==='whatsapp' ? 'bg-green-500/10 text-green-400' : 'bg-sky-500/10 text-sky-400') : 'bg-amber-500/10 text-amber-400'}`}>
                                      {inst.isOnline ? (inst.platform === 'whatsapp' ? 'CONECTADO' : 'IA ACTIVA') : 'OFFLINE'}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{inst.platform}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="block text-[10px] font-black text-white uppercase">{inst.instanceName}</span>
                                  <span className="block text-[8px] font-bold text-slate-500 uppercase">
                                    {inst.botName || 'SIN BOT'} {inst.livePhone ? `(+${inst.livePhone})` : ''}
                                  </span>
                                </td>
                                <td className="py-3 px-4 flex justify-end gap-2 items-center">
                                  {inst.id && (
                                    <button 
                                      onClick={() => {
                                        setEditingChannel(inst);
                                        setEditChannelData({
                                           botName: inst.botName,
                                           configA1: inst.configA1 ? (typeof inst.configA1 === 'string' ? JSON.parse(inst.configA1) : inst.configA1) : {},
                                           configA2: inst.configA2 ? (typeof inst.configA2 === 'string' ? JSON.parse(inst.configA2) : inst.configA2) : {},
                                           configA3: inst.configA3 ? (typeof inst.configA3 === 'string' ? JSON.parse(inst.configA3) : inst.configA3) : {}
                                        });
                                        setShowEditChannelModal(true);
                                      }}
                                      className="p-2 bg-white/5 text-sky-400 rounded-lg hover:bg-sky-500 hover:text-white transition-all" 
                                      title="Editar Configuración"
                                    >
                                      <Pencil size={12}/>
                                    </button>
                                  )}
                                  {inst.platform === 'whatsapp' && (
                                    <button onClick={() => fetchWhatsAppQR(inst.instanceName)} className="p-2 bg-white/5 text-slate-400 rounded-lg hover:text-white transition-all" title="Ver QR / Reconectar">
                                      <Eye size={12}/>
                                    </button>
                                  )}
                                  <button onClick={() => handleDeleteInstance(inst.instanceName)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Eliminar Instancia">
                                    <Trash2 size={12}/>
                                  </button>
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>

                   {/* OTROS CANALES */}
                   <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Otros Canales (Email, Tik-Tok)</span>
                         <button onClick={() => setShowConnectModal('mail')} className="text-[8px] font-black text-slate-400 uppercase tracking-widest">+ ADD OTRO</button>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center">
                         <p className="text-[9px] font-bold text-slate-500 uppercase italic">Sincronizando flujos de Email y TikTok con el cerebro...</p>
                      </div>
                   </div>
                </div>

               <div className="glass p-10 rounded-[3rem] border border-white/10">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Whitelist (Pruebas)</h3>
                  <div className="flex gap-2 mb-6">
                    <input 
                      type="text" 
                      id="newPhoneInputDebug"
                      placeholder="54911..." 
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-sky-500" 
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('newPhoneInputDebug') as HTMLInputElement;
                        if (input.value) {
                          const newPhones = [...debugPhones, input.value];
                          setDebugPhones(newPhones);
                          handleSaveDebug(newPhones, debugEnabled);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-sky-500 text-white rounded-xl font-black text-[10px] uppercase"
                    >ADD</button>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                     {debugPhones.map((p, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group">
                         <span className="text-[10px] font-bold text-slate-400">{p}</span>
                         <button onClick={() => {
                           const newPhones = debugPhones.filter((_, idx) => idx !== i);
                           setDebugPhones(newPhones);
                           handleSaveDebug(newPhones, debugEnabled);
                         }} className="text-red-500 opacity-0 group-hover:opacity-100 transition-all text-[8px] font-black uppercase">Del</button>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      );
    }



    if (activeTab === 'MKT Emisivo') {
      return (
        <div className="p-10 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">MKT Emisivo & Prospección</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Gestión de Campañas Outbound y Seguimiento Omnicanal</p>
            </div>
          </div>
          {/* @ts-ignore */}
          <MktEmisivo agenda={agenda} mktTemplates={mktTemplates} refresh={fetchData} mediaManifest={mediaManifest} apiHost={window.location.hostname} token={localStorage.getItem('PICE SaaS_token')} instance={selectedChannel?.instanceName} selectedCompany={selectedCompany} />
        </div>
      );
    }

    if (activeTab === 'Contactos') {
      return (
        <div className="p-10 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Agenda CRM & Contactos</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Gestión centralizada de leads, clientes e importaciones</p>
            </div>
          </div>
          {/* @ts-ignore */}
          <Contactos agenda={agenda} apiHost={window.location.hostname} token={localStorage.getItem('PICE SaaS_token')} refresh={fetchData} selectedCompany={selectedCompany} />
        </div>
      );
    }

    if (activeTab === 'Atención Humana') {
      const selectedConvData = conversations.find(c => c.numero === selectedConversation);
      const filteredMessages = messages
        .filter(m => m.phone === selectedConversation || m.numero === selectedConversation)
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      const handleSendMessage = async () => {
        if (!newMessage || !selectedConversation) return;
        try {
          const token = localStorage.getItem('PICE SaaS_token');
          const apiHost = window.location.hostname;
        await axios.post(`http://${apiHost}:4000/api/data`, { 
            action: 'send_message', 
            phone: selectedConversation,
            message: newMessage,
            instance: selectedChannel?.instanceName
          }, { headers: { Authorization: `Bearer ${token}` } });
          setNewMessage('');
          fetchData();
        } catch (e) { alert("Error al enviar"); }
      };

      return (
        <div className="p-0 h-[calc(100vh-6rem)] flex animate-in fade-in duration-500">
           <div className="w-80 border-r border-white/5 flex flex-col bg-slate-950/40">
              <div className="p-6 border-b border-white/5 space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chats ({conversations.length})</h3>
                     <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                             const filterDesc = channelFilter !== 'ALL' || timeFilter !== 'ALL' ? ` filtrados (${channelFilter}, ${timeFilter})` : ' TODOS';
                             if(confirm(`¿Estás seguro de eliminar los chats${filterDesc}? Esta acción no se puede deshacer.`)) {
                                try {
                                   const token = localStorage.getItem('PICE SaaS_token');
                                   const apiHost = window.location.hostname;
                                   const filteredPhones = conversations.filter(c => {
                                      const matchesSearch = !chatSearch || 
                                        (c.nombre || '').toLowerCase().includes(chatSearch.toLowerCase()) || 
                                        (c.numero || '').toLowerCase().includes(chatSearch.toLowerCase());
                                      const matchesChannel = channelFilter === 'ALL' || (channelFilter === 'ATENCIÓN' && c.pending_handoff) || c.channel === channelFilter;
                                      let matchesTime = true;
                                      if (timeFilter !== 'ALL' && c.last_msg_date) {
                                         const msgTime = new Date(c.last_msg_date).getTime();
                                         const now = new Date().getTime();
                                         const diffHours = (now - msgTime) / (1000 * 60 * 60);
                                         if (timeFilter === '24H') matchesTime = diffHours <= 24;
                                         else if (timeFilter === '48H') matchesTime = diffHours <= 48;
                                         else if (timeFilter === 'WEEK') matchesTime = diffHours <= 168;
                                         else if (timeFilter === '15D') matchesTime = diffHours <= 360;
                                      }
                                      return matchesSearch && matchesChannel && matchesTime;
                                   }).map(c => c.numero);

                                   await axios.post(`http://${apiHost}:4000/api/data`, { 
                                      action: 'delete_all_chats',
                                      phones: filteredPhones
                                   }, { headers: { Authorization: `Bearer ${token}` } });
                                   fetchData();
                                } catch(e) { alert("Error al borrar"); }
                             }
                          }}
                          className="text-[9px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2 py-1 rounded-lg flex items-center gap-1 border border-rose-500/20"
                        >
                          <Trash2 size={10} /> {channelFilter !== 'ALL' || timeFilter !== 'ALL' ? 'Borrar Filtrados' : 'Borrar Todo'}
                        </button>
                        <button onClick={() => fetchData()} className="text-[9px] font-black text-sky-500 hover:text-sky-400 uppercase tracking-widest bg-sky-500/10 px-2 py-1 rounded-lg border border-sky-500/20">Refrescar</button>
                     </div>
                 </div>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Buscar chat..." 
                       value={chatSearch}
                       onChange={(e) => setChatSearch(e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs font-bold outline-none focus:border-sky-500" 
                     />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar px-6 border-b border-white/5">
                     {['ALL', 'ATENCIÓN', 'WA', 'TELEGRAM', 'INSTAGRAM', 'EMAIL'].map(f => (
                        <button 
                          key={f}
                          onClick={() => setChannelFilter(f)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all whitespace-nowrap ${channelFilter === f ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                        >
                           {f}
                        </button>
                     ))}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar px-6 border-b border-white/5">
                     {[
                        {id: 'ALL', label: 'Todo'},
                        {id: '24H', label: '24 HS'},
                        {id: '48H', label: '48 HS'},
                        {id: 'WEEK', label: '7 DÍAS'},
                        {id: '15D', label: '15 DÍAS'}
                     ].map(f => (
                        <button 
                          key={f.id}
                          onClick={() => setTimeFilter(f.id)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all whitespace-nowrap ${timeFilter === f.id ? 'bg-amber-500 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                        >
                           {f.label}
                        </button>
                     ))}
                  </div>
               </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {conversations
                    .filter(c => {
                      const matchesSearch = !chatSearch || 
                        (c.nombre || '').toLowerCase().includes(chatSearch.toLowerCase()) || 
                        (c.numero || '').toLowerCase().includes(chatSearch.toLowerCase());
                      
                      const matchesChannel = channelFilter === 'ALL' || 
                                           (channelFilter === 'ATENCIÓN' && c.pending_handoff) || 
                                           c.channel === channelFilter;
                                           
                      let matchesTime = true;
                      if (timeFilter !== 'ALL' && c.last_msg_date) {
                         const msgTime = new Date(c.last_msg_date).getTime();
                         const now = new Date().getTime();
                         const diffHours = (now - msgTime) / (1000 * 60 * 60);
                         if (timeFilter === '24H') matchesTime = diffHours <= 24;
                         else if (timeFilter === '48H') matchesTime = diffHours <= 48;
                         else if (timeFilter === 'WEEK') matchesTime = diffHours <= 168;
                         else if (timeFilter === '15D') matchesTime = diffHours <= 360;
                      }
                      return matchesSearch && matchesChannel && matchesTime;
                    })
                    .map((chat, i) => (
                    <button 
                     key={i} 
                     onClick={() => setSelectedConversation(chat.numero)}
                     className={`w-full p-6 flex items-center gap-4 hover:bg-white/5 transition-all text-left border-b border-white/5 ${selectedConversation === chat.numero ? 'bg-sky-500/5 border-l-4 border-l-sky-500' : ''}`}
                    >
                       <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center font-black text-sky-400 text-xs relative">
                          {(chat.channel === 'WA' || !chat.channel) && <MessageSquare size={10} className="absolute -top-1 -right-1 text-green-500 bg-black rounded-full" />}
                          {chat.channel === 'TELEGRAM' && <Send size={10} className="absolute -top-1 -right-1 text-blue-400 bg-black rounded-full" />}
                          {chat.channel === 'INSTAGRAM' && <Camera size={10} className="absolute -top-1 -right-1 text-pink-500 bg-black rounded-full" />}
                          {chat.channel === 'FACEBOOK' && <Share2 size={10} className="absolute -top-1 -right-1 text-blue-600 bg-black rounded-full" />}
                          {chat.channel === 'EMAIL' && <Mail size={10} className="absolute -top-1 -right-1 text-gray-400 bg-black rounded-full" />}
                          {chat?.nombre?.charAt(0) || (chat?.numero ? String(chat.numero).charAt(0) : '?')}
                       </div>
                       <div className="flex-1 truncate">
                          <div className="flex justify-between items-center mb-1">
                             <div className="flex items-center gap-2 truncate">
                                <span className="text-[10px] font-black text-white uppercase truncate">{chat.nombre || chat.numero}</span>
                                {chat.last_origin === 'MKT' && <span className="bg-sky-500/20 text-sky-400 px-1 py-0.5 rounded text-[6px] font-black">MKT</span>}
                             </div>
                             <span className="text-[8px] font-bold text-slate-500">{chat.last_msg_date?.split(' ')[1] || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                              {chat.pending_handoff && (
                                <div className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[7px] font-black uppercase animate-pulse shrink-0">MANUAL</div>
                               )}
                               <p className="text-[9px] text-slate-500 truncate font-bold">{chat.summary || 'Sin resumen'}</p>
                            </div>
                        </div>
                      </button>
                  ))}
               </div>
            </div>
            <div className="flex-1 flex flex-col relative bg-[#0b141a]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}>
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#202c33] z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center font-black text-white text-lg">
                          {selectedConvData?.nombre?.charAt(0) || (selectedConversation ? String(selectedConversation).charAt(0) : 'U')}
                        </div>
                        <div>
                          <span className="block text-[13px] font-medium text-white">{selectedConvData?.nombre || selectedConversation}</span>
                          <span className="block text-[11px] text-slate-400 flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> {selectedConvData?.silent ? 'Intervención Manual' : 'IA Activa'}
                          </span>
                        </div>
                    </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={handleSummarize}
                            disabled={summarizing}
                            className={`px-4 py-2 bg-white/5 text-slate-300 rounded-lg font-medium text-[11px] hover:bg-white/10 transition-all ${summarizing ? 'animate-pulse' : ''}`}
                          >
                            {summarizing ? 'RESUMIENDO...' : 'RESUMIR IA'}
                          </button>
                          {selectedConvData?.silent ? (
                          <button 
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('PICE SaaS_token');
                                await axios.post(`http://${window.location.hostname}:4000/api/data`, { 
                                  action: 'resume_ia', 
                                  phone: selectedConversation,
                                  instance: selectedConvData?.instance 
                                }, { headers: { Authorization: `Bearer ${token}` } });
                                fetchData();
                              } catch (e) {}
                            }}
                            className="px-4 py-2 bg-[#00a884] text-[#111b21] rounded-lg font-bold text-[11px] shadow-lg"
                          >REANUDAR IA</button>
                        ) : (
                          <button 
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('PICE SaaS_token');
                                await axios.post(`http://${window.location.hostname}:4000/api/data`, { 
                                  action: 'pause_ia', 
                                  phone: selectedConversation,
                                  instance: selectedConvData?.instance 
                                }, { headers: { Authorization: `Bearer ${token}` } });
                                fetchData();
                              } catch (e) {}
                            }}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-bold text-[11px] hover:bg-red-500 hover:text-white transition-all"
                          >PAUSAR IA</button>
                        )}
                        <button 
                          onClick={async () => {
                            if(!confirm("¿Eliminar este chat? Se borrará el historial y se reseteará el bot para este cliente.")) return;
                            try {
                              const token = localStorage.getItem('PICE SaaS_token');
                              await axios.post(`http://${window.location.hostname}:4000/api/data`, { 
                                action: 'delete_chat', 
                                phone: selectedConversation,
                                instance: selectedConvData?.instance 
                              }, { headers: { Authorization: `Bearer ${token}` } });
                              setSelectedConversation(null);
                              fetchData();
                            } catch (e) { alert("Error al eliminar"); }
                          }}
                          className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-4 flex flex-col-reverse">
                    {filteredMessages.map((m, i) => (
                      <div key={i} className={`flex ${m.direction === 'out' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2 px-3 pb-6 relative rounded-lg max-w-md ${m.direction === 'out' ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'}`}>
                          <p className="text-[14.2px] leading-[19px] whitespace-pre-wrap">{m.message}</p>
                          <span className="text-[11px] text-white/50 absolute bottom-1 right-2">
                            {m.time?.split(' ')[1] || 'N/A'} {m.direction === 'out' ? '✓✓' : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-[#202c33] flex items-center gap-3">
                      <button className="p-2 text-[#8696a0] hover:text-[#d1d7db] transition-all"><Paperclip size={20} /></button>
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Escribe un mensaje" 
                        className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2.5 text-[15px] text-[#d1d7db] outline-none focus:bg-[#2a3942] placeholder-[#8696a0]" 
                      />
                      <button 
                        onClick={handleSendMessage}
                        className="p-2 bg-[#00a884] text-[#111b21] rounded-full hover:bg-[#06cf9c] transition-all"
                      ><Send size={18} className="ml-1" /></button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-[#e9edef]">
                   <MessageSquare size={80} />
                   <p className="text-xl font-light mt-6">WhatsApp para Windows</p>
                   <p className="text-sm mt-2 text-[#8696a0]">Selecciona un chat para comenzar a enviar mensajes</p>
                </div>
              )}
            </div>
         </div>
      );
    }

    if (activeTab === 'Botones A1') {
      return (
        <div className="p-10 space-y-10 animate-in fade-in duration-500 overflow-y-auto h-[calc(100vh-6rem)] custom-scrollbar">
           <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Configuración A1 - Cerebro</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Personalidad y Botonera Determinística</p>
              </div>
              <div className="flex gap-4">
                  <button 
                    onClick={() => handleSaveConfig('a1', configs.a1, true)}
                    className="px-8 py-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-xl shadow-purple-500/10"
                  >
                    Sincro Todos los Canales
                  </button>
                  <button 
                    onClick={() => handleSaveConfig('a1', configs.a1)}
                    className="bg-sky-500 hover:bg-sky-400 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all"
                  >
                    GUARDAR CEREBRO
                  </button>
               </div>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-8">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2 flex items-center gap-3">
                   <Zap size={18} className="text-sky-400" /> Parámetros de Identidad
                 </h3>
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <InputGroup 
                         label="Nombre de la Empresa" 
                         value={configs?.a1?.empresa || ''} 
                         onChange={(v) => setConfigs({...configs, a1: {...(configs?.a1 || {}), empresa: v}})}
                       />
                       <InputGroup 
                         label="Nombre del Agente" 
                         value={configs?.a1?.nombre_agente || ''} 
                         onChange={(v) => setConfigs({...configs, a1: {...(configs?.a1 || {}), nombre_agente: v}})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Tono de Respuestas</label>
                       <select 
                         value={configs?.a1?.tono || 'Amable'}
                         onChange={(e) => setConfigs({...configs, a1: {...(configs?.a1 || {}), tono: e.target.value}})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-sky-500"
                       >
                         <option value="Amable">Amable</option>
                         <option value="Profesional">Profesional</option>
                         <option value="Formal">Formal</option>
                         <option value="Informal">Informal</option>
                         <option value="Técnico">Técnico</option>
                       </select>
                    </div>
                    <InputGroup 
                      label="Saludo Inicial" 
                      value={configs?.a1?.saludo_inicial || ''} 
                      onChange={(v) => setConfigs({...configs, a1: {...(configs?.a1 || {}), saludo_inicial: v}})}
                    />
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">IA Prompt (Core Personality)</label>
                      <textarea 
                        value={configs?.a1?.ia_prompt || ''}
                        onChange={(e) => setConfigs({...configs, a1: {...(configs?.a1 || {}), ia_prompt: e.target.value}})}
                        className="w-full h-48 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-bold text-white outline-none focus:border-sky-500 transition-all resize-none leading-relaxed"
                      />
                    </div>
                 </div>
              </div>

              <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-8">
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                      <MessageSquare size={18} className="text-sky-400" /> Botonera Determinística
                    </h3>
                    <button 
                      onClick={() => {
                        const currentOpts = configs?.a1?.opciones_menu || [];
                        const nextNum = currentOpts.length > 0 ? (Math.max(...currentOpts.map((o:any) => parseInt(o.numero) || 0)) + 1).toString() : "1";
                        const newOpts = [...currentOpts, { numero: nextNum, nombre: 'Nueva Opción', respuesta: '' }];
                        setConfigs({...configs, a1: {...(configs?.a1 || {}), opciones_menu: newOpts}});
                      }}
                      className="text-sky-400 font-black text-[10px] uppercase"
                    >
                      + AGREGAR
                    </button>
                 </div>
                 <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {configs?.a1?.opciones_menu?.map((opt: any, i: number) => (
                      <div key={i} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4 relative group">
                        <button 
                          onClick={() => {
                            const newOpts = configs?.a1?.opciones_menu.filter((_:any, idx:number) => idx !== i);
                            setConfigs({...configs, a1: {...(configs?.a1 || {}), opciones_menu: newOpts}});
                          }}
                          className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-black uppercase"
                        >Eliminar</button>
                        <div className="flex gap-4">
                           <input 
                            value={opt.numero} 
                            onChange={(e) => {
                              const newOpts = [...configs?.a1?.opciones_menu];
                              newOpts[i].numero = e.target.value;
                              setConfigs({...configs, a1: {...(configs?.a1 || {}), opciones_menu: newOpts}});
                            }}
                            className="w-12 bg-sky-500/10 border border-sky-500/20 rounded-xl text-center font-black text-sky-400 py-2" 
                           />
                           <input 
                            value={opt.nombre} 
                            onChange={(e) => {
                              const newOpts = [...configs?.a1?.opciones_menu];
                              newOpts[i].nombre = e.target.value;
                              setConfigs({...configs, a1: {...(configs?.a1 || {}), opciones_menu: newOpts}});
                            }}
                            className="flex-1 bg-transparent border-b border-white/10 text-white font-bold outline-none" 
                            placeholder="Nombre visible"
                           />
                        </div>
                        <textarea 
                          value={opt.respuesta} 
                          onChange={(e) => {
                            const newOpts = [...configs?.a1?.opciones_menu];
                            newOpts[i].respuesta = e.target.value;
                            setConfigs({...configs, a1: {...(configs?.a1 || {}), opciones_menu: newOpts}});
                          }}
                          className="w-full bg-black/20 p-4 rounded-2xl text-[11px] font-bold text-slate-300 outline-none h-20 resize-none"
                          placeholder="Respuesta fija..."
                        />
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      );
    }

    if (activeTab === 'Tickets A3') {
      return (
        <div className="p-10 space-y-10 animate-in fade-in duration-500 overflow-y-auto h-[calc(100vh-6rem)] custom-scrollbar">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Templates A3 - Extracción</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Configuración de Captura de Datos IA</p>
            </div>
            <div className="flex gap-4">
               <button 
                onClick={() => handleSaveConfig('a3', configs.a3, true)}
                className="px-8 py-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-xl shadow-purple-500/10"
               >
                 Sincro Todos los Canales
               </button>
               <button 
                onClick={() => handleSaveConfig('a3', configs.a3)}
                className="px-10 py-4 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all"
               >
                 GUARDAR ESTRUCTURA
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
             <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-8">
                <div className="flex justify-between items-center">
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Estructura de Datos Requeridos</h3>
                   <button 
                    onClick={() => {
                      const newTemplates = [...(configs?.a3?.templates || []), { nombre: 'Nuevo Campo', tipo: 'Texto' }];
                      setConfigs({...configs, a3: {...(configs?.a3 || {}), templates: newTemplates}});
                    }}
                    className="text-sky-400 font-black text-[10px] uppercase"
                   >+ AGREGAR CAMPO</button>
                </div>
                <div className="space-y-4">
                   {configs?.a3?.templates?.map((t: any, i: number) => (
                     <div key={i} className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                        <input 
                          value={t.nombre} 
                          onChange={(e) => {
                            const newT = [...configs?.a3?.templates];
                            newT[i].nombre = e.target.value;
                            setConfigs({...configs, a3: {...(configs?.a3 || {}), templates: newT}});
                          }}
                          className="flex-1 bg-transparent border-b border-white/10 text-white font-bold outline-none text-sm"
                        />
                        <select 
                          value={t.tipo}
                          onChange={(e) => {
                            const newT = [...configs?.a3?.templates];
                            newT[i].tipo = e.target.value;
                            setConfigs({...configs, a3: {...(configs?.a3 || {}), templates: newT}});
                          }}
                          className="bg-black/40 text-[10px] font-black text-sky-400 uppercase p-2 rounded-lg outline-none"
                        >
                          <option value="Texto">Texto</option>
                          <option value="Número">Número</option>
                          <option value="Email">Email</option>
                          <option value="Teléfono">Teléfono</option>
                        </select>
                        <button 
                          onClick={() => {
                            const newT = configs?.a3?.templates.filter((_:any, idx:number) => idx !== i);
                            setConfigs({...configs, a3: {...(configs?.a3 || {}), templates: newT}});
                          }}
                          className="text-red-500 text-[10px] font-black uppercase"
                        >X</button>
                     </div>
                   ))}
               </div>
                <div className="pt-8 border-t border-white/5 space-y-4">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Instrucciones de Extracción IA</label>
                   <textarea 
                     value={configs?.a3?.instrucciones_ia || ''}
                     onChange={(e) => setConfigs({...configs, a3: {...(configs?.a3 || {}), instrucciones_ia: e.target.value}})}
                     className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-bold text-white outline-none focus:border-sky-500 transition-all resize-none"
                     placeholder="ej: Solicita los datos de forma amable. Valida que el email tenga @..."
                   />
                </div>
             </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Entrenamiento') {
      return (
        <div className="p-10 space-y-12 animate-in fade-in duration-500 overflow-y-auto h-[calc(100vh-6rem)] custom-scrollbar">
            {/* MÓDULO MOTOR IA (CONFIGURACIÓN TÉCNICA) */}
            <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-400">
                        <Cpu size={24} />
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Configuración del Motor IA</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Ajuste de rendimiento y consumo de recursos</p>
                     </div>
                  </div>
                  <div className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                     (4 + ((configs?.a2?.num_ctx || 4096) / 4096) * 3) > 15 ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                  }`}>
                     RAM ESTIMADA: {(4 + ((configs?.a2?.num_ctx || 4096) / 4096) * 3).toFixed(1)} GB / 16.6 GB
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Box size={12} className="text-sky-400" /> Ventana de Contexto
                     </label>
                     <select 
                       value={configs?.a2?.num_ctx || 4096}
                       onChange={(e) => setConfigs({...configs, a2: {...(configs?.a2 || {}), num_ctx: parseInt(e.target.value)}})}
                       className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white outline-none focus:border-sky-500 shadow-inner"
                     >
                        <option value="2048">2048 (Rápido / Bajo Consumo)</option>
                        <option value="4096">4096 (Equilibrado)</option>
                        <option value="8192">8192 (Recomendado RAG)</option>
                        <option value="16384">16384 (Máximo Detalle - 17GB RAM)</option>
                     </select>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Target size={12} className="text-sky-400" /> Temperatura ({configs?.a2?.temperature || 0.2})
                     </label>
                     <div className="px-6 py-4 bg-slate-900 border border-white/10 rounded-2xl flex items-center gap-4">
                        <input 
                          type="range" min="0" max="1" step="0.1"
                          value={configs?.a2?.temperature || 0.2}
                          onChange={(e) => setConfigs({...configs, a2: {...(configs?.a2 || {}), temperature: parseFloat(e.target.value)}})}
                          className="flex-1 accent-sky-500"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Zap size={12} className="text-sky-400" /> Límite de Respuesta
                     </label>
                     <select 
                       value={configs?.a2?.num_predict || 800}
                       onChange={(e) => setConfigs({...configs, a2: {...(configs?.a2 || {}), num_predict: parseInt(e.target.value)}})}
                       className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white outline-none focus:border-sky-500 shadow-inner"
                     >
                        <option value="200">Corto (200 tokens)</option>
                        <option value="500">Medio (500 tokens)</option>
                        <option value="800">Largo (800 tokens)</option>
                        <option value="1200">Muy Largo (1200 tokens)</option>
                     </select>
                  </div>
               </div>
               
               <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 pt-4">
                  <div className={`flex-1 p-6 rounded-[2rem] border flex items-start gap-4 transition-all ${
                     (4 + (configs?.a2?.num_ctx / 4096) * 3) > 16 
                     ? 'bg-red-500/10 border-red-500/20' 
                     : 'bg-sky-500/10 border-sky-500/20'
                  }`}>
                     <div className={`p-2 rounded-xl ${ (4 + (configs?.a2?.num_ctx / 4096) * 3) > 16 ? 'bg-red-500/20 text-red-400' : 'bg-sky-500/20 text-sky-400' }`}>
                        <LayoutDashboard size={20} />
                     </div>
                     <div className="space-y-1">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${ (4 + (configs?.a2?.num_ctx / 4096) * 3) > 16 ? 'text-red-400' : 'text-sky-400' }`}>
                           { (4 + (configs?.a2?.num_ctx / 4096) * 3) > 16 ? 'Riesgo de Desbordamiento detectado' : 'Configuración de Recursos Optimizada' }
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                           { (4 + (configs?.a2?.num_ctx / 4096) * 3) > 16 
                             ? '⚠️ Tu configuración actual requiere más de 16GB de RAM. El motor Ollama podría colapsar.'
                             : 'La IA leerá tus documentos con precisión. Se ha reservado un margen de seguridad.' }
                        </p>
                     </div>
                  </div>

                  <button 
                    onClick={() => handleSaveConfig('a2', configs.a2)}
                    className="px-10 py-6 bg-sky-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 justify-center min-w-[240px]"
                  >
                    <Save size={18} />
                    Guardar Parámetros
                  </button>
               </div>
            </div>



            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Cerebro RAG Estructurado</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Módulos de Conocimiento Optimizado para IA</p>
              </div>
              <div className="flex gap-4">
                 <button 
                  onClick={() => handleSaveConfig('a2', configs.a2, true)}
                  className="px-8 py-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-xl shadow-purple-500/10"
                 >
                   Sincro para todos los canales de la empresa
                 </button>
                 <button 
                  onClick={() => handleSaveConfig('a2', configs.a2)}
                  className="px-10 py-4 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:scale-105 transition-all"
                 >
                   Guardar Conocimiento
                 </button>
              </div>
           </div>

           <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <Brain size={18} className="text-sky-400" /> Base de Conocimiento Principal (Manual)
                 </h3>
                 <span className="text-[9px] font-bold text-slate-500 uppercase">Este texto tiene prioridad máxima en el RAG</span>
              </div>
              <textarea 
                placeholder="Describe aquí qué es la empresa, qué servicios ofrece, horarios, y toda la información base que la IA debe conocer perfectamente..."
                value={configs?.a2?.knowledge || ''}
                onChange={(e) => setConfigs({...configs, a2: {...(configs?.a2 || {}), knowledge: e.target.value}})}
                className="w-full h-64 bg-white/5 border border-white/10 rounded-[2rem] p-8 text-sm font-bold text-white outline-none focus:border-sky-500 transition-all resize-none font-mono leading-relaxed"
              />
              <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl flex items-center gap-4">
                 <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                 <p className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">
                    Tip: Define aquí conceptos clave como "Colaboratium" para que la IA no use definiciones genéricas.
                 </p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* MÓDULO 3: IDENTIDAD (MARKDOWN) */}
              <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                       <Zap size={18} className="text-amber-400" /> 3. Identidad & Misión (.md)
                    </h3>
                    <button 
                      onClick={() => handleSaveStructured('identity', structuredKnowledge.identity)}
                      className="text-[10px] font-black text-amber-400 uppercase tracking-widest border border-amber-400/20 px-4 py-2 rounded-xl hover:bg-amber-400/10 transition-all"
                    >SINCRONIZAR</button>
                 </div>
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Tono de Voz</label>
                          <select 
                            value={structuredKnowledge.identity?.voiceTone || 'Amable'}
                            onChange={(e) => setStructuredKnowledge({...structuredKnowledge, identity: {...structuredKnowledge.identity, voiceTone: e.target.value}})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none"
                          >
                             <option value="Amable">Amable / Cordial</option>
                             <option value="Premium">Premium / Exclusivo</option>
                             <option value="Técnico">Técnico / Directo</option>
                          </select>
                       </div>
                    </div>
                    <textarea 
                      placeholder="# Misión\nEscribe aquí la misión de la empresa..."
                      value={structuredKnowledge.identity?.mission || ''}
                      onChange={(e) => setStructuredKnowledge({...structuredKnowledge, identity: {...structuredKnowledge.identity, mission: e.target.value}})}
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-amber-500 transition-all resize-none font-mono"
                    />
                    <textarea 
                      placeholder="## FAQs\nQ: ¿Tienen local?\nA: Sí, en CABA..."
                      value={structuredKnowledge.identity?.faqs || ''}
                      onChange={(e) => setStructuredKnowledge({...structuredKnowledge, identity: {...structuredKnowledge.identity, faqs: e.target.value}})}
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-amber-500 transition-all resize-none font-mono"
                    />
                 </div>
              </div>

              {/* MÓDULO 2: PRECIOS (ESTRUCTURADO & GOOGLE SHEETS) */}
              <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-6">
                 <div className="flex flex-wrap items-center justify-between gap-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                       <LayoutDashboard size={18} className="text-green-400" /> 2. Estructura de Precios (Planilla Google Sheets)
                    </h3>
                    <div className="flex items-center gap-3">
                       <button 
                         onClick={async () => {
                           try {
                             const token = localStorage.getItem('PICE SaaS_token');
                             const apiHost = window.location.hostname;
                             const res = await axios.post(`http://${apiHost}:5000/api/data`, { action: 'sync_google_sheet_pricing' }, { headers: { Authorization: `Bearer ${token}` } });
                             if (res.data?.success) {
                               alert('✅ Precios sincronizados exitosamente desde la planilla de Google Sheets!');
                               fetchData();
                             } else {
                               alert('❌ Error al sincronizar: ' + (res.data?.error || 'Desconocido'));
                             }
                           } catch (err: any) {
                             alert('❌ Error de red al sincronizar: ' + err.message);
                           }
                         }}
                         className="text-[10px] font-black text-amber-300 uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl hover:bg-amber-500/20 transition-all flex items-center gap-2"
                       >
                         🔄 Sincronizar Google Sheet
                       </button>
                       <button 
                         onClick={() => handleSaveStructured('pricing', structuredKnowledge.pricing)}
                         className="text-[10px] font-black text-green-400 uppercase tracking-widest border border-green-400/20 px-4 py-2 rounded-xl hover:bg-green-400/10 transition-all"
                       >
                         ACTUALIZAR VALORES
                       </button>
                    </div>
                 </div>

                 {/* TABLA DE PRECIOS DEL GOOGLE SHEET */}
                 {(() => {
                    const sheetItems = configs?.training?.pricing?.data?.items || configs?.training?.pricing?.items || [];
                    if (sheetItems.length > 0) {
                       return (
                          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-1">
                             <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10">
                                   <tr>
                                      <th className="p-3">Box / Nombre</th>
                                      <th className="p-3">Sector / Categoría</th>
                                      <th className="p-3">Medidas</th>
                                      <th className="p-3">Superficie</th>
                                      <th className="p-3 text-emerald-400">Precio Neto (+IVA)</th>
                                      <th className="p-3 text-amber-400">Promo 3 Meses (-30%)</th>
                                      <th className="p-3 text-sky-400">Precio USD</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                   {sheetItems.map((item: any, idx: number) => (
                                      <tr key={idx} className="hover:bg-white/5 transition-all text-xs font-semibold text-slate-200">
                                         <td className="p-3 font-bold text-white">{item.box || item.name}</td>
                                         <td className="p-3 text-slate-300">{item.sector || '-'}</td>
                                         <td className="p-3 font-mono text-slate-400">{item.measures || '-'}</td>
                                         <td className="p-3 text-slate-300">{item.surface || '-'}</td>
                                         <td className="p-3 font-bold text-emerald-400">{item.price_net || item.price || '-'}</td>
                                         <td className="p-3 font-bold text-amber-400">{item.price_promo_3m || '-'}</td>
                                         <td className="p-3 font-mono text-sky-300">{item.price_usd || '-'}</td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       );
                    }
                    return null;
                 })()}

                 <div className="grid grid-cols-2 gap-6">
                    <InputGroup label="PRECIO EFECTIVO ($)" value={structuredKnowledge.pricing?.cashPrice || ''} onChange={(v) => setStructuredKnowledge({...structuredKnowledge, pricing: {...structuredKnowledge.pricing, cashPrice: v}})} />
                    <InputGroup label="PRECIO LISTA / IVA ($)" value={structuredKnowledge.pricing?.listPrice || ''} onChange={(v) => setStructuredKnowledge({...structuredKnowledge, pricing: {...structuredKnowledge.pricing, listPrice: v}})} />
                    <InputGroup label="SEÑA MÍNIMA ($)" value={structuredKnowledge.pricing?.minDeposit || ''} onChange={(v) => setStructuredKnowledge({...structuredKnowledge, pricing: {...structuredKnowledge.pricing, minDeposit: v}})} />
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Cuotas Soportadas</label>
                       <select 
                         value={structuredKnowledge.pricing?.supportedQuotas || 1}
                         onChange={(e) => setStructuredKnowledge({...structuredKnowledge, pricing: {...structuredKnowledge.pricing, supportedQuotas: e.target.value}})}
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none"
                       >
                          {[1,3,6,12,18].map(q => <option key={q} value={q}>{q} Cuotas</option>)}
                       </select>
                    </div>
                    <InputGroup label="INTERÉS APROX. (%)" value={structuredKnowledge.pricing?.approxInterest || ''} onChange={(v) => setStructuredKnowledge({...structuredKnowledge, pricing: {...structuredKnowledge.pricing, approxInterest: v}})} />
                 </div>
                 <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                    <p className="text-[9px] font-bold text-green-400 uppercase tracking-widest leading-relaxed">
                       * La IA utiliza esta tabla oficial sincronizada en vivo con Google Sheets para cotizaciones de Boxes, Bauleras y Oficinas Virtuales.
                    </p>
                 </div>
              </div>

              {/* MÓDULO 4: LOGÍSTICA (TEXTO/GEO) */}
              <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                       <Globe size={18} className="text-sky-400" /> 4. Logística & Entregas
                    </h3>
                    <button 
                      onClick={() => handleSaveStructured('logistics', structuredKnowledge.logistics)}
                      className="text-[10px] font-black text-sky-400 uppercase tracking-widest border border-sky-400/20 px-4 py-2 rounded-xl hover:bg-sky-400/10 transition-all"
                    >GUARDAR LOGÍSTICA</button>
                 </div>
                 <div className="space-y-6">
                    <InputGroup label="ZONAS DE COBERTURA (CABA, GBA, etc.)" value={structuredKnowledge.logistics?.coverageZones || ''} onChange={(v) => setStructuredKnowledge({...structuredKnowledge, logistics: {...structuredKnowledge.logistics, coverageZones: v}})} />
                    <div className="grid grid-cols-2 gap-6">
                       <InputGroup label="PLAZOS ENTREGA" placeholder="ej: 48hs hábiles" value={structuredKnowledge.logistics?.deliveryTerms || ''} onChange={(v) => setStructuredKnowledge({...structuredKnowledge, logistics: {...structuredKnowledge.logistics, deliveryTerms: v}})} />
                       <InputGroup label="DÍAS Y HORARIOS" placeholder="ej: Lun a Vie 9-18hs" value={structuredKnowledge.logistics?.daysAndHours || ''} onChange={(v) => setStructuredKnowledge({...structuredKnowledge, logistics: {...structuredKnowledge.logistics, daysAndHours: v}})} />
                    </div>
                    <InputGroup label="COSTO ENVÍO INTERIOR ($)" value={structuredKnowledge.logistics?.interiorCost || ''} onChange={(v) => setStructuredKnowledge({...structuredKnowledge, logistics: {...structuredKnowledge.logistics, interiorCost: v}})} />
                 </div>
              </div>

              {/* MÓDULO 1: STOCK (DATOS ESTRUCTURADOS) */}
              <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-6 flex flex-col">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                       <Search size={18} className="text-purple-400" /> 1. Control de Stock (Real-Time)
                    </h3>
                    <div className="flex gap-2">
                       <button className="text-[10px] font-black text-purple-400 uppercase tracking-widest border border-purple-400/20 px-4 py-2 rounded-xl hover:bg-purple-400/10 transition-all">CARGAR EXCEL</button>
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
                    <table className="w-full text-left">
                       <thead className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <tr>
                             <th className="px-4 py-3">Raza</th>
                             <th className="px-4 py-3">Sexo</th>
                             <th className="px-4 py-3">Edad</th>
                             <th className="px-4 py-3">Estado</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {(structuredKnowledge.stock || []).map((item: any, i: number) => (
                             <tr key={i} className="text-[10px] font-bold text-slate-300">
                                <td className="px-4 py-3">{item.breed}</td>
                                <td className="px-4 py-3 uppercase">{item.sex}</td>
                                <td className="px-4 py-3">{item.age}</td>
                                <td className="px-4 py-3">
                                   <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${item.status === 'disponible' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                      {item.status}
                                   </span>
                                </td>
                             </tr>
                          ))}
                          {(!structuredKnowledge.stock || structuredKnowledge.stock.length === 0) && (
                             <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-slate-600 italic text-[10px]">No hay stock cargado aún.</td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

            {/* BIBLIOTECA DE SOPORTE (FILES INDEX) */}
            <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                     <Box size={18} className="text-cyan-400" /> Biblioteca de Soporte (Activos)
                  </h3>
                  <div className="flex items-center gap-4">
                     <button 
                       onClick={async () => {
                         try {
                           const res = await axios.post(`http://${window.location.hostname}:4000/api/data`, { action: 'sync_all_to_brain', instance: selectedChannel?.instanceName, companyId: selectedCompany?.id }, { headers: { Authorization: `Bearer ${localStorage.getItem('PICE SaaS_token')}` } });
                           if(res.data.success) alert("✅ " + res.data.message);
                           else alert("❌ Error: " + res.data.error);
                         } catch (e: any) { alert("❌ Error de red: " + e.message); }
                       }}
                       className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest border border-fuchsia-400/20 px-4 py-2 rounded-xl hover:bg-fuchsia-400/10 transition-all flex items-center gap-2"
                     >
                        <Brain size={12} /> SINCRONIZAR TODO AL CEREBRO
                     </button>
                     <button 
                       onClick={async () => {
                         const res = await axios.post(`http://${window.location.hostname}:4000/api/data`, { action: 'get_library_index' }, { headers: { Authorization: `Bearer ${localStorage.getItem('PICE SaaS_token')}` } });
                         if(res.data.success) {
                           alert("Índice actualizado:\n" + res.data.index_md);
                           // Forzar refresco de UI si fuera necesario
                           fetchData();
                         }
                       }}
                       className="text-[10px] font-black text-cyan-400 uppercase tracking-widest border border-cyan-400/20 px-4 py-2 rounded-xl hover:bg-cyan-400/10 transition-all"
                     >ACTUALIZAR ÍNDICE</button>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(configs.libFiles || []).map((f: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-cyan-500/30 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 font-black italic text-[10px]">
                             {f?.name?.split('.').pop()?.toUpperCase() || '?'}
                          </div>
                          <div>
                             <span className="text-[11px] font-black text-white block truncate max-w-[120px]">{f?.name || 'Desconocido'}</span>
                             <span className="text-[8px] font-bold text-slate-500 uppercase">{f?.path?.split('\\').pop() || ''}</span>
                          </div>
                       </div>
                       <button 
                        onClick={async () => {
                          try {
                            const res = await axios.post(`http://${window.location.hostname}:4000/api/data`, { action: 'add_to_brain', path: f.name, instance: selectedChannel?.instanceName }, { headers: { Authorization: `Bearer ${localStorage.getItem('PICE SaaS_token')}` } });
                            if(res.data.success) alert("✅ Documento indexado en el cerebro de " + (selectedChannel?.instanceName || "todas las instancias"));
                            else alert("❌ Error: " + res.data.error);
                          } catch (e: any) { alert("❌ Error de red: " + e.message); }
                        }}
                        className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-cyan-500 hover:text-white"
                       >
                          <Brain size={14} />
                       </button>
                    </div>
                  ))}
                  {(!configs.libFiles || configs.libFiles.length === 0) && (
                    <div className="col-span-full py-10 text-center text-slate-600 italic text-[10px]">Haz clic en 'Actualizar Índice' para ver la biblioteca de soporte.</div>
                  )}
               </div>
            </div>

            {/* MÓDULO 5 & 6 & ARCHIVOS ADICIONALES */}
           <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <Settings size={18} className="text-slate-400" /> Documentación de Soporte (Files)
                 </h3>
                 <label className="cursor-pointer px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase hover:bg-white/10 transition-all flex items-center gap-2">
                    <ArrowUpRight size={14} /> SUBIR DOCUMENTO
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                 </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {knowledgeFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-sky-500/30 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center">
                             <Globe size={18} className="text-sky-400" />
                          </div>
                          <div>
                             <span className="text-[11px] font-black text-white block truncate max-w-[150px]">{file.name}</span>
                             <span className="text-[9px] font-bold text-slate-500 uppercase">{file.size}</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      );
    }

    if (activeTab === 'Conexiones') {
      const platforms = [
        { id: 'whatsapp', name: 'WhatsApp Oficial (Atención / IA)', icon: <Radio size={24} />, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
        { id: 'whatsapp_mkt', name: 'WhatsApp Emisivo (Campañas MKT / Anti-Baneo)', icon: <Send size={24} />, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
        { id: 'telegram', name: 'Telegram', icon: <Send size={24} />, color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
        { id: 'instagram', name: 'Instagram', icon: <Camera size={24} />, color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
        { id: 'linkedin', name: 'LinkedIn', icon: <Globe size={24} />, color: 'bg-blue-600/10 text-blue-500 border-blue-600/20' },
        { id: 'facebook', name: 'Facebook', icon: <Share2 size={24} />, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        { id: 'tiktok', name: 'TikTok', icon: <Music size={24} />, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
        { id: 'youtube', name: 'YouTube', icon: <Tv size={24} />, color: 'bg-red-600/10 text-red-500 border-red-600/20' },
        { id: 'mail', name: 'Email (SMTP/IMAP)', icon: <Mail size={24} />, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
        { id: 'google', name: 'Google Workspace', icon: <Calendar size={24} />, color: 'bg-sky-600/10 text-sky-500 border-sky-600/20' },
      ];

      return (
        <div className="p-10 space-y-10 animate-in fade-in duration-500 overflow-y-auto h-[calc(100vh-6rem)] custom-scrollbar">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Centro de Conexiones</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Vincule sus redes y herramientas para que la IA responda en todos sus canales</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platforms.map(p => (
              <div key={p.id} className="glass p-8 rounded-[2.5rem] border border-white/10 flex flex-col items-center text-center group hover:border-sky-500/50 transition-all cursor-pointer shadow-xl relative overflow-hidden">
                <div className={`p-6 rounded-3xl border mb-6 group-hover:scale-110 transition-all ${p.color}`}>
                  {p.icon}
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">{p.name}</h3>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  {channels.some(c => c.platform === p.id) ? '● CONECTADO' : '○ NO VINCULADO'}
                </span>
                
                <button 
                  onClick={() => {
                    setShowConnectModal(p.id);
                    const initName = p.id === 'whatsapp_mkt' ? 'mkt_colab' : '';
                    setConnectData(p.id === 'whatsapp_mkt' ? { botName: 'mkt_colab', waMethod: 'qr' } : {});
                    fetchWhatsAppQR(initName);
                  }}
                  className="mt-6 w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white"
                >
                  {channels.some(c => c.platform === p.id) ? 'GESTIONAR' : 'CONECTAR'}
                </button>

                {channels.some(c => c.platform === p.id) && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"></div>
                )}
              </div>
            ))}
          </div>

          <AnimatePresence>
            {showConnectModal && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-10"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                  className="glass w-full max-w-lg p-12 rounded-[3rem] border border-white/20 shadow-2xl relative"
                >
                  <button 
                    onClick={() => { setShowConnectModal(null); setConnectData({}); }}
                    className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all"
                  >
                    <LogOut size={24} className="rotate-90" />
                  </button>

                  <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-sky-500/10 rounded-2xl text-sky-400 border border-sky-500/20 mb-6">
                      {platforms.find(p => p.id === showConnectModal)?.icon}
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Vincular {platforms.find(p => p.id === showConnectModal)?.name}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Siga los pasos para autorizar al motor PICE SaaS</p>
                  </div>

                  <div className="space-y-6">
                    {showConnectModal === 'whatsapp' || showConnectModal === 'whatsapp_mkt' ? (
                      <div className="flex flex-col items-center gap-8">
                        <div className="w-full space-y-4">
                           <InputGroup 
                            label="NOMBRE DE LA INSTANCIA (ÚNICO)" 
                            placeholder={showConnectModal === 'whatsapp_mkt' ? "mkt_colab" : "ej: ventas_central"} 
                            value={connectData.botName || (showConnectModal === 'whatsapp_mkt' ? 'mkt_colab' : '')}
                            onChange={(v) => setConnectData({...connectData, botName: v})} 
                           />
                        </div>

                        <div className="flex justify-between w-full items-start">
                           <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">LÍNEA ACTUAL</span>
                              <h4 className="text-lg font-black text-white italic">{qrData?.phone || 'NO VINCULADA'}</h4>
                           </div>
                           {qrData?.status === 'connected' || qrData?.status === 'open' ? (
                              <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-4 py-2 rounded-full border border-green-400/20 uppercase shadow-[0_0_15px_rgba(34,197,94,0.2)]">ACTIVO</span>
                            ) : (
                              <span className="text-[10px] font-black text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20 animate-pulse uppercase">PENDIENTE</span>
                            )}
                        </div>

                        <div className="w-full flex gap-2 p-1 bg-white/5 rounded-xl">
                          <button 
                            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${connectData.waMethod !== 'api' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setConnectData({...connectData, waMethod: 'qr'})}
                          >{showConnectModal === 'whatsapp_mkt' ? 'MOTOR EMISOR (WASENDER / ANTI-BANEO)' : 'QR (Baileys)'}</button>
                          <button 
                            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${connectData.waMethod === 'api' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setConnectData({...connectData, waMethod: 'api'})}
                          >Meta Cloud API</button>
                        </div>

                        {connectData.waMethod === 'api' ? (
                          <div className="w-full space-y-4 animate-in fade-in zoom-in duration-300">
                            <InputGroup 
                              label="PHONE NUMBER ID" 
                              placeholder="Ej: 1130034106869719" 
                              value={connectData.phone_number_id || ''}
                              onChange={(v) => setConnectData({...connectData, phone_number_id: v})} 
                            />
                            <InputGroup 
                              label="ACCESS TOKEN (PERMANENTE)" 
                              placeholder="Ej: EAAYzytdd..." 
                              value={connectData.access_token || ''}
                              onChange={(v) => setConnectData({...connectData, access_token: v})} 
                            />
                            <button 
                              onClick={handleConnectMetaAPI}
                              className="w-full py-4 mt-4 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                              <Radio size={16} /> CONECTAR VÍA CLOUD API
                            </button>
                            <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">
                               Requiere número registrado en portal Meta Developers
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="p-8 bg-white rounded-[2rem] shadow-2xl relative group animate-in fade-in zoom-in duration-300">
                              {qrData?.status === 'connected' ? (
                                 <div className="w-48 h-48 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/50 mb-4">
                                       <Radio size={32} className="text-white animate-pulse" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase">VINCULADO</span>
                                 </div>
                              ) : qrData?.base64 ? (
                                <img src={qrData.base64} alt="QR" className="w-48 h-48" />
                              ) : (
                                <div className="w-48 h-48 flex items-center justify-center text-slate-400 font-bold text-[10px] animate-pulse italic">GENERANDO...</div>
                              )}
                            </div>

                            <div className="w-full space-y-4">
                               <button 
                                 onClick={() => {
                                    const targetBot = connectData.botName || (showConnectModal === 'whatsapp_mkt' ? 'mkt_colab' : '');
                                    fetchWhatsAppQR(targetBot);
                                  }}
                                 className="w-full py-4 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                               >
                                 <Radio size={16} /> {qrData?.status === 'connected' || qrData?.status === 'open' ? 'RE-VINCULAR LÍNEA' : 'OBTENER NUEVO QR'}
                               </button>
                               <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">
                                  Escanee desde WhatsApp {'>'} Dispositivos vinculados
                               </p>
                            </div>
                          </>
                        )}
                      </div>
                    ) : showConnectModal === 'mail' ? (
                      <>
                        <InputGroup label="NOMBRE DE LA CUENTA" placeholder="Email Soporte" onChange={(v) => setConnectData({...connectData, botName: v})} />
                        <div className="grid grid-cols-2 gap-4">
                          <InputGroup label="HOST IMAP" placeholder="imap.gmail.com" onChange={(v) => setConnectData({...connectData, imap: v})} />
                          <InputGroup label="PUERTO IMAP" placeholder="993" onChange={(v) => setConnectData({...connectData, imap_port: v})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputGroup label="HOST SMTP" placeholder="smtp.gmail.com" onChange={(v) => setConnectData({...connectData, smtp: v})} />
                          <InputGroup label="PUERTO SMTP" placeholder="465" onChange={(v) => setConnectData({...connectData, smtp_port: v})} />
                        </div>
                        <InputGroup label="EMAIL / USUARIO" placeholder="admin@empresa.com" onChange={(v) => setConnectData({...connectData, user: v})} />
                        <InputGroup label="CONTRASEÑA / APP PASSWORD" placeholder="••••••••••••" onChange={(v) => setConnectData({...connectData, pass: v})} />
                      </>
                    ) : showConnectModal === 'google' ? (
                      <>
                        <InputGroup label="CLIENT ID" placeholder="google-apps-id-..." onChange={(v) => setConnectData({...connectData, clientId: v})} />
                        <InputGroup label="CLIENT SECRET" placeholder="••••••••••••" onChange={(v) => setConnectData({...connectData, clientSecret: v})} />
                        <InputGroup label="REFRESH TOKEN" placeholder="1//..." onChange={(v) => setConnectData({...connectData, refreshToken: v})} />
                        <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-2xl">
                          <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest block mb-2">Herramientas Autorizadas:</span>
                          <div className="flex gap-4">
                            <ToggleItem label="Calendar" description="Agendar citas" active={true} />
                            <ToggleItem label="Meet" description="Links de video" active={true} />
                          </div>
                        </div>
                      </>
                    ) : showConnectModal === 'instagram' ? (
                      <>
                        <InputGroup label="NOMBRE DEL BOT / INSTANCIA" placeholder="ig_iabox" value={connectData.botName || ''} onChange={(v) => setConnectData({...connectData, botName: v})} />
                        <InputGroup label="USUARIO DE INSTAGRAM (O HANDLE)" placeholder="ej: iaboxestadosunidos" value={connectData.user || ''} onChange={(v) => setConnectData({...connectData, user: v})} />
                        <InputGroup label="CONTRASEÑA" placeholder="••••••••••••" type="password" value={connectData.password || ''} onChange={(v) => setConnectData({...connectData, password: v})} />
                        <InputGroup label="CÓDIGO DE SEGUNDO FACTOR (2FA / AUTHENTICATOR)" placeholder="ej: 123456 (6 dígitos)" value={connectData.twoFactorCode || ''} onChange={(v) => setConnectData({...connectData, twoFactorCode: v, two_factor_code: v, otp: v})} />
                        <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl space-y-2">
                          <InputGroup label="O CONECTAR CON COOKIE SESSION ID (OPCIONAL)" placeholder="ej: 78408471774%3AP61pq..." value={connectData.sessionid || ''} onChange={(v) => setConnectData({...connectData, sessionid: v, session_id: v})} />
                          <p className="text-[8px] text-sky-400 font-medium">
                            * Si Instagram bloquea por versión/2FA, podés pegar tu cookie sessionid de Instagram Web para conexión instantánea sin 2FA.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <InputGroup label="ID DE INSTANCIA / NOMBRE" placeholder="Mi_Conexion_Red" onChange={(v) => setConnectData({...connectData, botName: v})} />
                        <InputGroup label="TOKEN DE ACCESO / API KEY" placeholder="sk-..." onChange={(v) => setConnectData({...connectData, token: v})} />
                        <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed">
                          * Para {showConnectModal}, asegúrese de tener habilitado el acceso a mensajes en la configuración de la red social.
                        </p>
                      </>
                    )}

                    <button 
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('PICE SaaS_token');
                          const apiHost = window.location.hostname;
                          await axios.post(`http://${apiHost}:4000/channels/connect/${showConnectModal}`, {
                            botName: connectData.botName || `${showConnectModal}_${Date.now()}`,
                            companyId: selectedCompany.id,
                            credentials: connectData
                          }, { headers: { Authorization: `Bearer ${token}` } });
                          alert("Conexión establecida correctamente");
                          setShowConnectModal(null);
                          fetchInitialData(token as string);
                        } catch (e) { alert("Error al conectar: " + e); }
                      }}
                      className="w-full py-4 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:scale-[1.02] transition-all mt-4"
                    >
                      ESTABLECER CONEXIÓN FINAL
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    if (activeTab === 'Biblioteca') {
      const filteredMedia = selectedFolder === 'Todos' ? mediaManifest : mediaManifest.filter(m => m.type === selectedFolder);

      return (
        <div className="flex h-[calc(100vh-6rem)] animate-in fade-in duration-500 overflow-hidden">
          {/* Sidebar Explorer */}
          <div className="w-80 border-r border-white/5 flex flex-col glass overflow-hidden">
            <div className="p-6 border-b border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Explorador</span>
                <button 
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.onchange = (e: any) => handleFileUpload(e);
                    input.click();
                  }}
                  className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-sky-500/20"
                ><Plus size={16} /></button>
              </div>
              <div className="space-y-1">
                {['Todos', 'Documentos', 'Fotos', 'Videos', 'Tablas'].map(folder => (
                  <button 
                    key={folder}
                    onClick={() => setSelectedFolder(folder)}
                    className={`w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFolder === folder ? 'bg-sky-500/10 text-sky-400' : 'text-slate-500 hover:text-white'}`}
                  >
                    {folder}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
               {filteredMedia.map((item, i) => (
                 <div 
                   key={i} 
                   onClick={() => setSelectedMedia(item)}
                   className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 group ${selectedMedia?.name === item.name ? 'bg-sky-500 text-white border-sky-400 shadow-xl shadow-sky-500/20' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`}
                 >
                    <div className={`${selectedMedia?.name === item.name ? 'text-white' : 'text-sky-400'}`}>
                       {item.type === 'Fotos' ? <Camera size={16} /> : item.type === 'Videos' ? <Video size={16} /> : <FileText size={16} />}
                    </div>
                    <span className="text-[10px] font-bold truncate flex-1">{item.name}</span>
                 </div>
               ))}
               <button 
                onClick={() => {
                  const newM = { name: `Nuevo_Link_${Date.now()}`, type: 'Videos', url: 'https://...', context: '' };
                  setMediaManifest([...mediaManifest, newM]);
                  setSelectedMedia(newM);
                }}
                className="w-full p-4 border-2 border-dashed border-white/5 rounded-2xl text-[9px] font-black text-slate-600 uppercase hover:border-white/10"
               >+ Link Externo</button>
            </div>
          </div>

          {/* Details Panel */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/50">
             {selectedMedia ? (
               <div className="p-10 space-y-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                       <span className="px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-sky-500/20">{selectedMedia.type}</span>
                       <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{selectedMedia.name}</h2>
                       {selectedMedia.url && <p className="text-sky-500 font-bold text-xs">{selectedMedia.url}</p>}
                    </div>
                    <div className="flex gap-4">
                       <button 
                        onClick={async () => {
                          setAnalyzingMedia(true);
                          try {
                            const token = localStorage.getItem('PICE SaaS_token');
                            const apiHost = window.location.hostname;
                            const res = await axios.post(`http://${apiHost}:4000/api/data`, { 
                              action: 'analyze_media', 
                              name: selectedMedia.name, 
                              context: selectedMedia.context 
                            }, { headers: { Authorization: `Bearer ${token}` } });
                            
                            const newM = [...mediaManifest];
                            const idx = mediaManifest.findIndex(m => m.name === selectedMedia.name);
                            newM[idx].summary = res.data.summary;
                            setMediaManifest(newM);
                            setSelectedMedia({...selectedMedia, summary: res.data.summary});
                          } catch (e: any) { alert("Error en análisis IA: " + e.message); }
                          setAnalyzingMedia(false);
                        }}
                        className={`px-6 py-3 bg-white text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all ${analyzingMedia ? 'animate-pulse' : ''}`}
                       >
                         <Brain size={14} /> {analyzingMedia ? 'ANALIZANDO...' : 'Analizar con IA'}
                       </button>
                       <button 
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('PICE SaaS_token');
                            const apiHost = window.location.hostname;
                            await axios.post(`http://${apiHost}:4000/api/data`, { action: 'save_media_manifest', manifest: mediaManifest, companyId: selectedCompany?.id }, { headers: { Authorization: `Bearer ${token}` } });
                            alert("Conocimiento aplicado al motor");
                          } catch (e) { alert("Error al guardar"); }
                        }}
                        className="px-6 py-3 bg-sky-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:scale-105 transition-all"
                       >Guardar Índice</button>
                    </div>
                  </div>



            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Contexto de Aplicación (Manual)</label>
                        <textarea 
                          value={selectedMedia.context || ''}
                          onChange={(e) => {
                            const newM = [...mediaManifest];
                            const idx = mediaManifest.findIndex(m => m.name === selectedMedia.name);
                            newM[idx].context = e.target.value;
                            setMediaManifest(newM);
                            setSelectedMedia({...selectedMedia, context: e.target.value});
                          }}
                          className="w-full h-64 bg-white/5 border border-white/5 rounded-[2rem] p-8 text-sm font-bold text-white outline-none focus:border-sky-500/30 transition-all resize-none"
                          placeholder="Describe cuándo y cómo debe la IA usar este activo..."
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-sky-500 uppercase tracking-widest block">Resumen de Contenido (IA Generated)</label>
                        <div className="w-full h-64 bg-black/40 border border-sky-500/10 rounded-[2rem] p-8 text-xs font-bold text-slate-400 leading-relaxed overflow-y-auto italic border-l-4 border-l-sky-500">
                           {selectedMedia.summary || "Presiona 'Analizar con IA' para obtener un resumen del contenido basado en tu hardware AMD 16-Core."}
                        </div>
                     </div>
                  </div>

                  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                     <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Vista Previa / Detalles Técnicos</h3>
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-slate-600">
                           {selectedMedia.type === 'Fotos' ? <Camera size={32} /> : selectedMedia.type === 'Videos' ? <Video size={32} /> : <FileText size={32} />}
                        </div>
                        <div>
                           <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Metadata Asset</span>
                           <span className="block text-xl font-black text-white truncate">MD5: {Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
                           <span className="block text-[10px] font-bold text-sky-500">Estado: Indexado para RAG Plus</span>
                        </div>
                     </div>
                  </div>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center space-y-6 text-center opacity-30">
                  <Box size={80} className="text-slate-600" />
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Explorador PICE SaaS</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Selecciona un archivo para ver su contexto y análisis</p>
                  </div>
               </div>
             )}
          </div>
        </div>
      );
    }

    if (activeTab === 'Comandos OS') {
      return (
        <div className="p-10 space-y-10 animate-in fade-in duration-500 overflow-y-auto h-[calc(100vh-6rem)] custom-scrollbar">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">PICE SaaS OS - Command Control</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Gestión de Comandos Avanzados y Telemetría</p>
            </div>
            <div className="flex gap-4">
               <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10 flex flex-col items-end justify-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hardware Latency</span>
                  <span className="text-xl font-black text-sky-400">12ms <small className="text-[10px] text-sky-400/50">AMD 16-Core</small></span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
             <div className="lg:col-span-2 glass p-10 rounded-[3rem] border border-white/10 space-y-8">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Logs de Comandos de Administración</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                   {commandLogs.length > 0 ? [...commandLogs].reverse().map((log, i) => (
                     <div key={i} className="bg-black/40 p-6 rounded-[2rem] border border-white/5 space-y-2 group hover:border-sky-500/30 transition-all">
                        <div className="flex justify-between items-center">
                           <span className="text-sky-400 font-black text-[10px] uppercase tracking-widest">#{log.command}#</span>
                           <span className="text-slate-500 font-mono text-[9px]">{log.timestamp}</span>
                        </div>
                        <p className="text-white text-xs font-bold">Admin: <span className="text-slate-400">{log.admin}</span></p>
                        <div className="bg-white/5 p-3 rounded-xl mt-2 italic text-[10px] text-slate-500 border-l-2 border-sky-500">
                           {log.response}
                        </div>
                     </div>
                   )) : (
                     <div className="p-10 text-center text-slate-600 font-bold italic">No se han ejecutado comandos recientemente</div>
                   )}
                </div>
             </div>

             <div className="lg:col-span-2 space-y-10">
                <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-8">
                   <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Editor de Comandos Personalizados</h3>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setCustomCommands([...customCommands, { trigger: 'nuevo', action: 'Acción...', context: 'Contexto...' }])}
                          className="text-sky-400 font-black text-[10px] uppercase"
                        >+ AÑADIR</button>
                        <button 
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('PICE SaaS_token');
                              const apiHost = window.location.hostname;
                              await axios.post(`http://${apiHost}:4000/api/data`, { action: 'save_custom_commands', commands: customCommands }, { headers: { Authorization: `Bearer ${token}` } });
                              alert("Comandos guardados en custom_commands.json");
                            } catch (e) { alert("Error al guardar comandos"); }
                          }}
                          className="px-4 py-2 bg-sky-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-sky-500/20"
                        >GUARDAR COMANDOS</button>
                      </div>
                   </div>
                   <div className="space-y-4">
                      {customCommands.map((cmd, i) => (
                        <div key={i} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 space-y-4 group relative">
                           <div className="flex gap-4 items-center">
                              <input 
                                value={cmd.trigger} 
                                onChange={(e) => {
                                  const newC = [...customCommands];
                                  newC[i].trigger = e.target.value;
                                  setCustomCommands(newC);
                                }}
                                className="w-1/3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-center font-black text-sky-400 py-2 text-xs" 
                                placeholder="#trigger#"
                              />
                              <input 
                                value={cmd.action} 
                                onChange={(e) => {
                                  const newC = [...customCommands];
                                  newC[i].action = e.target.value;
                                  setCustomCommands(newC);
                                }}
                                className="flex-1 bg-transparent border-b border-white/10 text-white font-bold outline-none text-xs" 
                                placeholder="Acción IA..."
                              />
                           </div>
                           <textarea 
                             value={cmd.context || ''}
                             onChange={(e) => {
                               const newC = [...customCommands];
                               newC[i].context = e.target.value;
                               setCustomCommands(newC);
                             }}
                             className="w-full bg-black/20 p-4 rounded-2xl text-[11px] font-bold text-slate-400 outline-none h-16 resize-none"
                             placeholder="Explicación del contexto para la IA..."
                           />
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                   <h4 className="text-xl font-black text-white italic tracking-tight uppercase">Hardware AMD 16-Core Stats</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                         <span className="text-[10px] font-black text-white/50 uppercase block">CPU Load</span>
                         <span className="text-2xl font-black text-white">42%</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                         <span className="text-[10px] font-black text-white/50 uppercase block">RAM Avail</span>
                         <span className="text-2xl font-black text-white">23.6GB</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-20 text-center">
         <h1 className="text-5xl font-black text-white/10 uppercase tracking-[0.5em] italic">Módulo {activeTab}</h1>
         <p className="text-slate-600 font-bold mt-4 tracking-widest uppercase text-xs">Sincronizando con el Núcleo PICE SaaS V4</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      <aside className="w-64 border-r border-white/5 p-6 flex flex-col glass fixed h-full z-30">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => setActiveTab('Dashboard')}>
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30 neon-glow group">
            <Zap className="w-6 h-6 text-white text-glow group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter text-white block">PICE SaaS</span>
            <span className="text-[10px] font-black text-sky-400 tracking-widest uppercase">SaaS V4 Pro</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          <NavItem icon={<LayoutDashboard size={18} />} label="Conversaciones" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <NavItem icon={<Users size={18} />} label="Atención Humana" active={activeTab === 'Atención Humana'} onClick={() => setActiveTab('Atención Humana')} badge={pendingCount} />
          <NavItem icon={<HeartPulse size={18} />} label="STRESS TEST & HARDWARE" active={activeTab === 'STRESS TEST'} onClick={() => setActiveTab('STRESS TEST')} />
          <NavItem icon={<Target size={18} />} label="MKT Emisivo" active={activeTab === 'MKT Emisivo'} onClick={() => setActiveTab('MKT Emisivo')} />
          <NavItem icon={<Users size={18} />} label="Agenda CRM" active={activeTab === 'Contactos'} onClick={() => setActiveTab('Contactos')} />
          <NavItem icon={<Plus size={18} />} label="Conexiones" active={activeTab === 'Conexiones'} onClick={() => setActiveTab('Conexiones')} />
          <NavItem icon={<Zap size={18} />} label="Botones A1" active={activeTab === 'Botones A1'} onClick={() => setActiveTab('Botones A1')} />
          <NavItem icon={<Globe size={18} />} label="Entrenamiento" active={activeTab === 'Entrenamiento'} onClick={() => setActiveTab('Entrenamiento')} />
          <NavItem icon={<Radio size={18} />} label="Flujos IA" active={activeTab === 'Flujos IA'} onClick={() => setActiveTab('Flujos IA')} />
          <NavItem icon={<MessageSquare size={18} />} label="Tickets A3" active={activeTab === 'Tickets A3'} onClick={() => setActiveTab('Tickets A3')} />
          <NavItem icon={<Ticket size={18} />} label="Administrador de tickets" active={activeTab === 'Administrador de tickets'} onClick={() => setActiveTab('Administrador de tickets')} />
          <NavItem icon={<Terminal size={18} />} label="Comandos OS" active={activeTab === 'Comandos OS'} onClick={() => setActiveTab('Comandos OS')} />
          <NavItem icon={<Box size={18} />} label="Biblioteca" active={activeTab === 'Biblioteca'} onClick={() => setActiveTab('Biblioteca')} />
          <NavItem icon={<Search size={18} />} label="Debugger" active={activeTab === 'Debugger'} onClick={() => setActiveTab('Debugger')} />
          <NavItem icon={<Brain size={18} />} label="Modelos de IA" active={activeTab === 'Modelos de IA'} onClick={() => setActiveTab('Modelos de IA')} />
          <NavItem icon={<Settings size={18} />} label="Configuración" active={activeTab === 'Configuración'} onClick={() => setActiveTab('Configuración')} />
        </nav>

        <div className="pt-6 border-t border-white/5 mt-auto">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-6 flex items-center gap-3 overflow-hidden">
             <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center font-black text-sky-400 border border-sky-500/20">
                {selectedCompany?.businessName ? String(selectedCompany.businessName).charAt(0) : 'S'}
             </div>
             <div className="truncate">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">CLIENTE</span>
                <span className="text-xs font-black text-white truncate block">{selectedCompany?.businessName || 'PICE SaaS'}</span>
             </div>
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all font-bold text-xs uppercase"
          >
            <LogOut size={18} /> SALIR
          </button>
        </div>
      </aside>

      <main className="flex-1 pl-64 overflow-y-auto">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-20">
           <div className="flex items-center gap-6">
              <CompanySelector companies={companies} selected={selectedCompany} onSelect={handleCompanySelect} show={showCompanyMenu} setShow={setShowCompanyMenu} />
              <ChannelSelector channels={channels} selected={selectedChannel} onSelect={(ch: any) => { setSelectedChannel(ch); setShowChannelMenu(false); }} show={showChannelMenu} setShow={setShowChannelMenu} />
           </div>
           
           <div className="flex items-center gap-6">
             <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="block text-sm font-black text-white uppercase tracking-tight">{user.name}</span>
                  <span className="block text-[10px] font-bold text-sky-500 uppercase tracking-widest leading-none">ID: {user.id}</span>
                </div>
                <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-sky-500/20 border border-white/20 uppercase italic">
                  {user?.name ? String(user.name).charAt(0) : 'U'}
                </div>
             </div>
           </div>
        </header>

        {renderContent()}
      </main>

      <AnimatePresence>
        {showSummaryModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-lg flex items-center justify-center p-10"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass w-full max-w-xl p-12 rounded-[3rem] border border-white/20 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSummaryModal(null)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all"
              >
                <LogOut size={24} className="rotate-90" />
              </button>

              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 border border-sky-500/20">
                  <Brain size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Resumen de Inteligencia</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Análisis de los últimos 50 mensajes por Llama 3</p>
                </div>
              </div>

              <div className="p-8 bg-black/40 rounded-[2rem] border border-sky-500/10 text-sm font-bold text-slate-300 leading-relaxed italic border-l-4 border-l-sky-500">
                {showSummaryModal}
              </div>

              <button 
                onClick={() => setShowSummaryModal(null)}
                className="mt-10 w-full py-4 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:scale-[1.02] transition-all"
              >
                ENTENDIDO
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SetupCopilot 
        activeTab={activeTab} 
        selectedChannel={selectedChannel} 
        currentConfig={
          activeTab === 'Flujos IA' ? selectedFlow :
          activeTab === 'Botones A1' ? configs?.a1 :
          activeTab === 'Tickets A3' ? configs?.a3 :
          activeTab === 'Identidad & Misión' ? structuredKnowledge?.identity :
          null
        }
        onApplyAction={async (actionObj: any) => {
          console.log("[Copilot Action]", actionObj);
          
          let payloadToSave = { ...actionObj, instance: selectedChannel?.instanceName };
          let skipFetch = false;

          if (actionObj.action === 'save_config') {
            if (actionObj.type === 'flow') {
              // La IA genera un flow completo — normalizar nodos y navegar al editor
              const generatedFlow = actionObj.config;
              if (!generatedFlow.name) generatedFlow.name = `flujo_copilot_${Date.now()}`;
              
              // Normalizar: la IA manda data.label pero el renderer usa node.name
              if (generatedFlow.nodes) {
                generatedFlow.nodes = generatedFlow.nodes.map((n: any, index: number) => {
                  const defaultX = index * 320 + 50;
                  const defaultY = 200;
                  const pos = n.position && typeof n.position.x === 'number' && typeof n.position.y === 'number'
                    ? n.position
                    : { x: defaultX, y: defaultY };
                  return {
                    ...n,
                    name: n.name || n.data?.label || n.type || 'Nodo',
                    description: n.description || n.data?.label || '',
                    position: pos,
                    data: {
                      ...n.data,
                      label: n.name || n.data?.label || n.type || 'Nodo'
                    }
                  };
                });
              }
              
              // Agregar al array de flows para que aparezca en el selector
              setFlows((prev: any[]) => {
                const exists = prev.find(f => f.name === generatedFlow.name);
                if (exists) {
                  return prev.map(f => f.name === generatedFlow.name ? { ...f, content: generatedFlow } : f);
                }
                return [...prev, { name: generatedFlow.name, content: generatedFlow }];
              });
              
              setSelectedFlow(generatedFlow);
              setActiveTab('Flujos IA');
              skipFetch = true;

              // Guardar de manera persistente como archivo .flu en el repositorio de flujos de Express
              (async () => {
                try {
                  const token = localStorage.getItem('PICE SaaS_token');
                  const apiHost = window.location.hostname;
                  await axios.post(`http://${apiHost}:4000/api/flows/save`, {
                    name: generatedFlow.name,
                    flow: generatedFlow,
                    companyId: selectedCompany?.id
                  }, { headers: { Authorization: `Bearer ${token}` } });
                  
                  // Volver a listar los flujos desde el backend para confirmar y actualizar el selector
                  const resFlows = await axios.get(`http://${apiHost}:4000/api/flows`, {
                    params: { companyId: selectedCompany?.id },
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  setFlows(resFlows.data);
                  console.log("[Copilot Flow Save] Guardado exitoso del .flu en repositorio:", generatedFlow.name);
                } catch (e: any) {
                  console.error("[Copilot Flow Save] Error guardando flujo .flu:", e.message || e);
                }
              })();

            } else if (actionObj.type === 'a1') {
              // Normalizar: la IA puede mandar `menuOptions`, `opciones_menu`, o `options`
              let opciones = actionObj.config.opciones_menu 
                || actionObj.config.menuOptions 
                || actionObj.config.options 
                || [];
              // Normalizar claves de cada opción: trigger->numero, referencia->respuesta, nombre OK
              opciones = opciones.map((o: any, idx: number) => ({
                numero: o.numero ?? o.trigger ?? String(idx + 1),
                nombre: o.nombre ?? o.name ?? `Opción ${idx + 1}`,
                respuesta: o.respuesta ?? o.referencia ?? o.response ?? ''
              }));
              const newA1 = { ...(configs?.a1 || {}), ...actionObj.config, opciones_menu: opciones };
              // Limpiar claves alternativas
              delete newA1.menuOptions; delete newA1.options;
              setConfigs((prev: any) => ({ ...prev, a1: newA1 }));
              payloadToSave.config = newA1;
              skipFetch = true; // NO fetchData — evita resetear la UI
            } else if (actionObj.type === 'a3') {
              // Normalizar templates de A3
              let templates = actionObj.config.templates || actionObj.config.fields || [];
              templates = templates.map((t: any) => ({
                nombre: t.nombre ?? t.name ?? t.field ?? 'Campo',
                tipo: t.tipo ?? t.type ?? 'Texto'
              }));
              const instrucciones = actionObj.config.instrucciones_ia ?? actionObj.config.instructions ?? configs?.a3?.instrucciones_ia ?? '';
              const newA3 = { ...(configs?.a3 || {}), templates, instrucciones_ia: instrucciones };
              setConfigs((prev: any) => ({ ...prev, a3: newA3 }));
              payloadToSave.config = newA3;
              skipFetch = true;
            }
          } else if (actionObj.action === 'save_knowledge') {
            if (actionObj.type === 'identity') {
              setStructuredKnowledge((prev: any) => ({ ...prev, identity: actionObj.data }));
            }
          }
          
          // Guardar en backend con un pequeño delay para que el state se asiente
          setTimeout(async () => {
             await handleAction(payloadToSave.action, payloadToSave);
             // Solo refrescar si no era una acción local de config (evita resetear UI)
             if (!skipFetch) {
               fetchData();
             }
          }, 150);

        }} 
      />
    </div>
  );
}

function ModuleCard({ title, icon, content, bgcolor }: { title: string, icon: any, content: any, bgcolor: string }) {
  const colors:any = { sky: 'border-sky-500/20 bg-sky-500/10', purple: 'border-purple-500/20 bg-purple-500/10', amber: 'border-amber-500/20 bg-amber-500/10' };
  return (
    <div className="glass p-8 rounded-[2.5rem] border border-white/10 relative group">
       <div className={`p-3 rounded-xl border mb-6 inline-flex ${colors[bgcolor]}`}>{icon}</div>
       <h3 className="font-black text-white uppercase tracking-widest text-[10px] mb-6 underline decoration-sky-500">{title}</h3>
       {content}
    </div>
  );
}

function SystemView({ status, onAction, instance }: any) {
    const [stressCount, setStressCount] = useState(50);
    const cpuUsage = status?.cpu || 0;
    const queueSize = status?.queue_size || 0;

    useEffect(() => {
        const interval = setInterval(() => {
            onAction('get_system_status'); // Forzar actualización de hardware
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const runStressTest = () => {
        if (!instance) return alert("Selecciona una instancia activa primero.");
        onAction('run_stress_test', { conversations: stressCount, instance });
        alert(`🚀 Prueba de Stress Iniciada: ${stressCount} conversaciones encoladas.`);
    };

    return (
        <div className="p-10 space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Análisis y Stress Test</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <Activity size={12} className="text-cyan-400" /> Monitoreo de Hardware en Tiempo Real
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Métricas Principales */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400">
                                <Cpu size={24} />
                            </div>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${cpuUsage > 80 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                                {cpuUsage > 90 ? 'CRITICAL' : cpuUsage > 70 ? 'WARNING' : 'HEALTHY'}
                            </span>
                        </div>
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-1">Carga de Procesador</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white italic">{cpuUsage}%</span>
                        </div>
                        <div className="mt-6 h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${cpuUsage}%` }}
                                className={`h-full ${cpuUsage > 80 ? 'bg-red-500' : 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]'}`}
                            />
                        </div>
                    </div>

                    <div className="glass p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
                                <Layers size={24} />
                            </div>
                        </div>
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-1">Cola de Procesamiento IA</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white italic">{queueSize}</span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tareas</span>
                        </div>
                        <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase leading-tight italic">
                            Latencia estimada: <span className="text-purple-400">{(queueSize * 3.5).toFixed(1)}s</span>
                        </p>
                    </div>

                    {/* Stress Test Control */}
                    <div className="md:col-span-2 glass p-8 rounded-[2.5rem] border border-red-500/20 bg-red-500/[0.02] relative overflow-hidden">
                        <div className="flex flex-col gap-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Simulador de Stress</h4>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Inyección de conversaciones masivas al núcleo</p>
                                </div>
                                <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
                                    <span className="text-xs font-black text-white px-3">{stressCount}</span>
                                    <input 
                                        type="range" min="10" max="1000" step="10" 
                                        value={stressCount} 
                                        onChange={(e) => setStressCount(parseInt(e.target.value))}
                                        className="w-32 accent-red-500 h-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button 
                                    onClick={runStressTest}
                                    className="py-6 bg-gradient-to-br from-red-600 to-rose-900 text-white rounded-[2rem] font-black uppercase text-xs shadow-xl shadow-red-500/10 hover:scale-105 transition-all flex items-center justify-center gap-4"
                                >
                                    <Zap size={20} className="animate-bounce" /> EJECUTAR PRUEBA DE SATURACIÓN
                                </button>
                                <button 
                                    onClick={async () => {
                                        if(confirm("¿Estás seguro de reiniciar el sistema? Se borrarán TODOS los chats y logs de simulación.")) {
                                            await onAction('delete_all_chats', { companyId: 1 });
                                            alert("Sistema reiniciado con éxito.");
                                            window.location.reload();
                                        }
                                    }}
                                    className="py-6 bg-white/5 text-rose-500 border border-white/10 rounded-[2rem] font-black uppercase text-xs hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-4"
                                >
                                    <Trash2 size={20} /> REINICIAR SISTEMA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Hardware Lateral */}
                <div className="glass-card p-10 border border-white/5 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 flex flex-col gap-8 rounded-[2.5rem]">
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-cyan-400 shadow-xl border border-white/5">
                            <ShieldCheck size={32} />
                        </div>
                        <h4 className="text-2xl font-black text-white uppercase italic leading-[0.9] tracking-tighter">Hardware<br/>Monitoring</h4>
                        <p className="text-[11px] font-bold text-white/30 leading-relaxed uppercase">
                            Estado en tiempo real de los servicios vinculados al core.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { name: 'Nucleo IA', status: 'Online', icon: <Cpu size={14}/>, color: 'text-green-500' },
                            { name: 'Queue Manager', status: 'Active', icon: <Layers size={14}/>, color: 'text-cyan-500' },
                            { name: 'Ollama Server', status: status.cpu > 0 ? 'Busy' : 'Idle', icon: <Zap size={14}/>, color: 'text-purple-500' },
                            { name: 'Evolution API', status: 'Connected', icon: <RefreshCw size={14}/>, color: 'text-blue-500' },
                        ].map(srv => (
                            <div key={srv.name} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`${srv.color} opacity-40`}>{srv.icon}</div>
                                    <span className="text-[10px] font-black text-white/60 uppercase">{srv.name}</span>
                                </div>
                                <span className={`text-[8px] font-black px-2 py-1 rounded-lg bg-black/40 ${srv.color}`}>{srv.status}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle size={14} className="text-yellow-500"/>
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">SLA Cumplimiento: 99.8%</span>
                        </div>
                        <p className="text-[8px] font-bold text-white/20 uppercase leading-tight italic">
                            * Los picos de latencia pueden ocurrir durante pruebas de stress masivas (&gt;500 concurrentes).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FlowNode({ label, color, active = false }: { label: string, color: string, active?: boolean }) {
  const colors:any = { sky: 'border-sky-500 text-sky-400', purple: 'border-purple-500 text-purple-400', amber: 'border-amber-500 text-amber-400', red: 'border-red-500 text-red-400' };
  return (
    <div className={`px-6 py-4 rounded-2xl border-2 bg-slate-900/80 backdrop-blur-md font-black text-[10px] uppercase tracking-widest shadow-2xl relative ${colors[color]} ${active ? 'scale-110 ring-4 ring-purple-500/20' : ''}`}>
       {label}
       {active && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>}
    </div>
  );
}

function ToggleItem({ label, description, active }: { label: string, description: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
      <div>
        <span className="text-xs font-black text-white uppercase block">{label}</span>
        <span className="text-[10px] font-bold text-slate-500 block">{description}</span>
      </div>
      <div className={`w-10 h-5 rounded-full relative transition-all ${active ? 'bg-sky-500' : 'bg-slate-700'}`}>
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`}></div>
      </div>
    </div>
  );
}

function InputGroup({ label, value, placeholder, type = "text", onChange }: { label: string, value?: string, placeholder?: string, type?: string, onChange?: (v: string) => void }) {
  return (
    <div>
       <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-2">{label}</label>
       <input 
        type={type}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-sky-500 outline-none transition-all text-white" 
        value={value} 
        placeholder={placeholder} 
       />
    </div>
  );
}

function CompanySelector({ companies, selected, onSelect, show, setShow }: any) {
  return (
    <div className="relative">
      <button onClick={() => setShow(!show)} className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl hover:bg-white/10 transition-all">
        <Building size={18} className="text-sky-400" />
        <div className="text-left"><span className="text-sm font-black text-white">{selected?.businessName || 'Empresa'}</span></div>
        <ChevronDown size={14} />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-2 w-64 glass border border-white/10 rounded-2xl py-2 z-50 overflow-hidden shadow-2xl">
            {companies.map((c:any) => (
              <button key={c.id} onClick={() => onSelect(c)} className="w-full px-5 py-3 hover:bg-sky-500/10 text-left text-xs font-bold uppercase transition-all">{c.businessName}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChannelSelector({ channels, selected, onSelect, show, setShow }: any) {
  const getIcon = (platform: string) => {
    switch(platform?.toLowerCase()) {
      case 'whatsapp': return <Radio size={14} className="text-green-400" />;
      case 'telegram': return <Send size={14} className="text-sky-400" />;
      case 'instagram': return <Camera size={14} className="text-pink-400" />;
      case 'linkedin': return <Globe size={14} className="text-blue-500" />;
      default: return <Radio size={14} className="text-purple-400" />;
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setShow(!show)} className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl hover:bg-white/10 transition-all">
        {selected ? getIcon(selected.platform) : <Zap size={18} className="text-purple-400" />}
        <div className="text-left"><span className="text-sm font-black text-white">{selected?.botName || 'Todos los Canales'}</span></div>
        <ChevronDown size={14} />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-2 w-64 glass border border-white/10 rounded-2xl py-2 z-50 overflow-hidden shadow-2xl">
            <button 
              onClick={() => onSelect(null)} 
              className="w-full px-5 py-3 hover:bg-white/5 text-left text-xs font-black uppercase transition-all flex items-center gap-3 text-sky-400"
            >
              <Zap size={14} /> TODOS LOS CANALES
            </button>
            <div className="h-px bg-white/5 mx-4 my-1"></div>
            {channels.map((ch:any) => (
              <button key={ch.id} onClick={() => onSelect(ch)} className="w-full px-5 py-3 hover:bg-purple-500/10 text-left text-xs font-bold uppercase transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getIcon(ch.platform)}
                  {ch.botName}
                </div>
                <span className={`w-1.5 h-1.5 rounded-full ${ch.status === 'connected' || ch.status === 'open' ? 'bg-green-500' : ch.status === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick, badge }: { icon: any, label: string, active?: boolean, onClick?: () => void, badge?: number }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest relative group ${
      active ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40 italic' : 'text-slate-500 hover:text-white hover:bg-white/5'
    }`}>
      <span className={`${active ? 'text-white' : 'group-hover:text-sky-400'}`}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge ? (
        <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full absolute right-4 animate-pulse shadow-lg shadow-red-500/40">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function StatCard({ label, value, growth, icon }: { label: string, value: string, growth: string, icon: any }) {
  return (
    <div className="glass p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-all border border-white/5">{icon}</div>
        <span className="text-green-400 text-[10px] font-black bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20">{growth}</span>
      </div>
      <span className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</span>
      <span className="text-3xl font-black text-white italic">{value}</span>
    </div>
  );
}

function TableRow({ name, canal, status, time }: { name: string, canal: string, status: string, time: string }) {
  return (
    <tr className="hover:bg-white/[0.02] transition-all">
      <td className="px-8 py-5 text-sm font-black text-white uppercase">{name}</td>
      <td className="px-8 py-5 text-xs font-bold text-slate-400 uppercase italic">{canal}</td>
      <td className="px-8 py-5">
        <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border ${status === 'bot_handling' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
          {status}
        </span>
      </td>
      <td className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase">{time}</td>
    </tr>
  );
}
