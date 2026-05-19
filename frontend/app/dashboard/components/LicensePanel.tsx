'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface LicenseStatus {
  status: 'active' | 'blocked' | 'offline' | 'no_license' | 'loading';
  company_name?: string;
  days_remaining?: number;
  subscription_end?: string;
  token_preview?: string;
  warning?: string | null;
  message?: string;
}

interface NewCompanyForm {
  businessName: string;
  taxId: string;
  email: string;
  phones: string;
  website: string;
  licenseToken: string;
  totpCode: string;
}

interface LicensePanelProps {
  apiHost: string;
  token: string | null;
  companyId?: number;
  onCompanyCreated?: () => void;
}

export default function LicensePanel({ apiHost, token, companyId, onCompanyCreated }: LicensePanelProps) {
  const [licStatus, setLicStatus] = useState<LicenseStatus>({ status: 'loading' });
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [form, setForm] = useState<NewCompanyForm>({
    businessName: '', taxId: '', email: '', phones: '', website: '',
    licenseToken: '', totpCode: ''
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showImportDat, setShowImportDat] = useState(false);
  const [datContent, setDatContent] = useState('');
  const [datError, setDatError] = useState('');
  const [datPreview, setDatPreview] = useState<any>(null);
  const [activationLog, setActivationLog] = useState<string[]>([]);

  const fetchLicenseStatus = useCallback(async () => {
    try {
      const targetUrl = `http://${apiHost}:4000/api/license/status`;
      setVerifying(true);
      
      const r = await axios.get(targetUrl, {
        params: { companyId },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLicStatus(r.data);
    } catch (e: any) {
      setLicStatus({ status: 'offline', warning: 'Error de conexión: ' + e.message });
    } finally {
      setVerifying(false);
    }
  }, [token, apiHost, companyId]);

  useEffect(() => {
    fetchLicenseStatus();
    const interval = setInterval(fetchLicenseStatus, 60 * 60 * 1000); // Cada hora
    return () => clearInterval(interval);
  }, [fetchLicenseStatus, companyId]);

  const handleCreateCompany = async () => {
    if (!form.businessName || !form.taxId || !form.licenseToken || !form.totpCode) {
      setCreateError('Completar: Empresa, CUIT, Token de Licencia y Código TOTP');
      return;
    }
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');
    setActivationLog(['📡 Iniciando registro de empresa...', `🏢 Empresa: ${form.businessName}`]);
    
    try {
      setActivationLog(prev => [...prev, '⏳ Validando licencia y TOTP con el servidor central...']);
      const r = await axios.post(`http://${apiHost}:4000/api/admin/companies`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivationLog(prev => [...prev, '✅ Licencia validada correctamente.', '🚀 Creando registro en base de datos local...']);
      setCreateSuccess(`✅ Empresa "${r.data.company.businessName}" creada exitosamente.`);
      setForm({ businessName: '', taxId: '', email: '', phones: '', website: '', licenseToken: '', totpCode: '' });
      onCompanyCreated?.();
      setActivationLog(prev => [...prev, '🏁 Proceso completado con éxito.']);
      setTimeout(() => { setShowCreateCompany(false); setCreateSuccess(''); setActivationLog([]); }, 3000);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error de conexión con el backend';
      const details = err.response?.data?.details || err.message;
      setCreateError(msg);
      setActivationLog(prev => [...prev, `❌ ERROR: ${msg}`, `🔍 Detalle: ${details}`]);
    } finally {
      setCreating(false);
    }
  };

  // ─── Colores según estado ────────────────────────────────────────
  const statusConfig = {
    active:     { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   label: 'ACTIVA',     icon: '✅' },
    blocked:    { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   label: 'BLOQUEADA',  icon: '⛔' },
    offline:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  label: 'OFFLINE',    icon: '📡' },
    no_license: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', label: 'SIN LICENCIA', icon: '🔒' },
    loading:    { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', label: 'VERIFICANDO...', icon: '⏳' },
  };
  const cfg = statusConfig[licStatus.status] || statusConfig.loading;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── BANNER DE ADVERTENCIA (si hay warning) ── */}
      {licStatus.warning && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.15))',
          border: '1px solid rgba(245,158,11,0.4)',
          borderRadius: 12,
          padding: '12px 20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'pulse 2s infinite'
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13 }}>ALERTA DE SUSCRIPCIÓN</div>
            <div style={{ color: '#fed7aa', fontSize: 12, marginTop: 2 }}>{licStatus.warning}</div>
          </div>
        </div>
      )}

      {/* ── TARJETA DE ESTADO ── */}
      <div style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{cfg.icon}</span>
              <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                Licencia PICE SaaS
              </span>
              <span style={{
                background: cfg.color,
                color: '#000',
                fontSize: 9,
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: 20,
                letterSpacing: 1
              }}>{cfg.label}</span>
            </div>
            <div style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700 }}>
              {licStatus.company_name || 'Sin empresa'}
            </div>
            {licStatus.token_preview && (
              <div style={{ color: '#64748b', fontSize: 11, marginTop: 4, fontFamily: 'monospace' }}>
                Token: {licStatus.token_preview}
              </div>
            )}
          </div>

          {/* Días restantes */}
          {licStatus.days_remaining !== undefined && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 36,
                fontWeight: 900,
                color: licStatus.days_remaining <= 7 ? '#ef4444' :
                       licStatus.days_remaining <= 15 ? '#f59e0b' : '#22c55e',
                lineHeight: 1
              }}>
                {licStatus.days_remaining}
              </div>
              <div style={{ color: '#64748b', fontSize: 10, fontWeight: 600 }}>DÍAS RESTANTES</div>
            </div>
          )}
        </div>

        {/* Fecha de vencimiento */}
        {licStatus.subscription_end && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <div style={{ color: '#475569', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Vence</div>
                <div style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                  {new Date(licStatus.subscription_end).toLocaleDateString('es-AR', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <div style={{ color: '#475569', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Gracia</div>
                <div style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 700, marginTop: 2 }}>5 días adicionales</div>
              </div>
            </div>

            {/* Barra de progreso */}
            {licStatus.days_remaining !== undefined && (
              <div style={{ marginTop: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 99, height: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, (licStatus.days_remaining / 30) * 100))}%`,
                    background: licStatus.days_remaining <= 7 ? '#ef4444' :
                                licStatus.days_remaining <= 15 ? '#f59e0b' : '#22c55e',
                    borderRadius: 99,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ACCIONES ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => { setShowCreateCompany(!showCreateCompany); setShowAdminPanel(false); }}
          style={{
            background: showCreateCompany ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: 10,
            color: '#a5b4fc',
            padding: '10px 16px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s'
          }}
        >
          🏢 Nueva Empresa
        </button>

        <button
          onClick={fetchLicenseStatus}
          disabled={verifying}
          style={{
            background: verifying ? 'rgba(99,102,241,0.2)' : 'rgba(30,41,59,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            color: verifying ? '#a5b4fc' : '#64748b',
            padding: '10px 16px',
            fontSize: 12,
            fontWeight: 700,
            cursor: verifying ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s'
          }}
        >
          {verifying ? (<><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>&#8635;</span> Verificando...</>) : '🔄 Verificar (v3)'}
        </button>

        <button
          onClick={() => { setShowImportDat(!showImportDat); setDatError(''); }}
          style={{
            background: showImportDat ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 10,
            color: '#fbbf24',
            padding: '10px 16px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          📂 Importar .dat
        </button>

        {licStatus.status === 'blocked' || licStatus.status === 'no_license' && (
          <a
            href="mailto:soporte@saasia.com?subject=Renovación de Licencia"
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: 10,
              color: '#fca5a5',
              padding: '10px 16px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            📧 Renovar Licencia
          </a>
        )}
      </div>

      {/* ── IMPORTAR DESDE .DAT ── */}
      {showImportDat && (
        <div style={{
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>📂 Pegá el contenido del archivo .dat</div>
          <textarea
            rows={5}
            value={datContent}
            onChange={e => {
              const val = e.target.value;
              setDatContent(val);
              try {
                if (!val.trim()) {
                  setDatPreview(null);
                  setDatError('');
                  return;
                }
                const parsed = JSON.parse(val);
                if (!parsed.license_token) throw new Error('No se encontró license_token');
                
                let daysLeft = 0;
                if (parsed.valid_until) {
                  const end = new Date(parsed.valid_until);
                  const now = new Date();
                  daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));
                }
                
                setDatPreview({
                  company: parsed.company_name || 'Sin nombre',
                  days: daysLeft,
                  valid_until: parsed.valid_until,
                  token: parsed.license_token
                });
                setDatError('');
              } catch (e: any) {
                setDatPreview(null);
                setDatError('Esperando JSON válido... (' + e.message + ')');
              }
            }}
            placeholder={'{ "license_token": "SIA-XXXX...", "company_name": "...", "valid_until": "..." }'}
            style={{
              width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#f1f5f9', padding: '10px 12px', fontSize: 12,
              fontFamily: 'monospace', outline: 'none', resize: 'vertical', boxSizing: 'border-box'
            }}
          />
          {datPreview && (
            <div style={{
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 8, padding: '10px 14px', marginTop: 10, color: '#86efac', fontSize: 12
            }}>
              <div style={{ fontWeight: 800, marginBottom: 4 }}>✅ Licencia Detectada</div>
              <div>Empresa: <b>{datPreview.company}</b></div>
              <div>Tiempo Restante: <b>{datPreview.days > 0 ? `${datPreview.days} días` : 'Vencida'}</b> (hasta {new Date(datPreview.valid_until).toLocaleDateString()})</div>
            </div>
          )}
          {datError && !datPreview && datContent.trim() && <div style={{ color: '#fca5a5', fontSize: 12, marginTop: 8 }}>⛔ {datError}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
            <button
              disabled={!datPreview}
              onClick={() => {
                if (datPreview) {
                  setForm(f => ({ ...f, licenseToken: datPreview.token, businessName: datPreview.company }));
                  setShowCreateCompany(true);
                  setShowImportDat(false);
                  setDatContent('');
                  setDatError('');
                  setDatPreview(null);
                }
              }}
              style={{
                background: datPreview ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(245,158,11,0.3)',
                border: 'none', borderRadius: 8, color: datPreview ? '#fff' : 'rgba(255,255,255,0.5)',
                padding: '10px 20px', fontSize: 12, fontWeight: 800, cursor: datPreview ? 'pointer' : 'not-allowed'
              }}
            >
              Aplicar Valores Iniciales →
            </button>
          </div>
        </div>
      )}

      {/* ── FORMULARIO: NUEVA EMPRESA ── */}
      {showCreateCompany && (
        <div style={{
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 20,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ color: '#a5b4fc', fontWeight: 800, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            🏢 Registrar Nueva Empresa
            <span style={{
              background: 'rgba(99,102,241,0.2)',
              color: '#818cf8',
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 99,
              fontWeight: 600
            }}>Requiere Licencia</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField
              label="Nombre de la Empresa *"
              value={form.businessName}
              onChange={v => setForm(f => ({ ...f, businessName: v }))}
              placeholder="Mi Empresa S.A."
            />
            <InputField
              label="CUIT *"
              value={form.taxId}
              onChange={v => setForm(f => ({ ...f, taxId: v }))}
              placeholder="20-12345678-9"
            />
            <InputField
              label="Email"
              value={form.email}
              onChange={v => setForm(f => ({ ...f, email: v }))}
              placeholder="contacto@empresa.com"
              type="email"
            />
            <InputField
              label="Teléfono"
              value={form.phones}
              onChange={v => setForm(f => ({ ...f, phones: v }))}
              placeholder="+54 11 1234-5678"
            />
          </div>

          {/* Separador de licencia */}
          <div style={{
            margin: '16px 0',
            padding: '14px',
            background: 'rgba(99,102,241,0.08)',
            border: '1px dashed rgba(99,102,241,0.3)',
            borderRadius: 10
          }}>
            <div style={{ color: '#818cf8', fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
              🔐 Activación de Licencia
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <InputField
                label="Token de Licencia *"
                value={form.licenseToken}
                onChange={v => setForm(f => ({ ...f, licenseToken: v.toUpperCase() }))}
                placeholder="SIA-XXXX-XXXX-XXXX-XXXX"
                mono
              />
              <InputField
                label="Código Google Auth *"
                value={form.totpCode}
                onChange={v => setForm(f => ({ ...f, totpCode: v.replace(/\D/g, '').substring(0, 6) }))}
                placeholder="123456"
                mono
              />
            </div>
            <div style={{ color: '#475569', fontSize: 10, marginTop: 8 }}>
              El token y el QR de Google Authenticator son proporcionados por el proveedor del sistema.
            </div>
          </div>

          {createError && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#fca5a5',
              fontSize: 12,
              marginBottom: 12
            }}>⛔ {createError}</div>
          )}

          {createSuccess && (
            <div style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#86efac',
              fontSize: 12,
              marginBottom: 12
            }}>{createSuccess}</div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setShowCreateCompany(false); setCreateError(''); setCreateSuccess(''); setActivationLog([]); }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#64748b',
                padding: '10px 20px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >Cancelar</button>
            <button
              onClick={handleCreateCompany}
              disabled={creating}
              style={{
                background: creating ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                padding: '10px 24px',
                fontSize: 12,
                fontWeight: 800,
                cursor: creating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s'
              }}
            >
              {creating ? (
                <><span style={{ animation: 'spin 1s linear infinite' }}>⟳</span> Procesando...</>
              ) : (
                <>🚀 Crear Empresa</>
              )}
            </button>
          </div>

          {/* ── LOG DE ACTIVACIÓN ── */}
          {activationLog.length > 0 && (
            <div style={{
              marginTop: 20,
              padding: '12px 16px',
              background: '#020617',
              border: '1px solid #1e293b',
              borderRadius: 10,
              fontFamily: 'monospace',
              fontSize: 11
            }}>
              <div style={{ color: '#64748b', marginBottom: 8, fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>SISTEMA DE ACTIVACIÓN V3 - LOG</div>
              {activationLog.map((line, i) => (
                <div key={i} style={{ 
                  color: line.startsWith('❌') ? '#fca5a5' : line.startsWith('✅') ? '#86efac' : '#94a3b8',
                  marginBottom: 4,
                  animation: 'fadeIn 0.2s ease'
                }}>
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text', mono = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; mono?: boolean;
}) {
  return (
    <div>
      <label style={{ display: 'block', color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'rgba(15,23,42,0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          color: '#f1f5f9',
          padding: '10px 12px',
          fontSize: mono ? 13 : 13,
          fontFamily: mono ? 'monospace' : 'inherit',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s'
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
    </div>
  );
}
