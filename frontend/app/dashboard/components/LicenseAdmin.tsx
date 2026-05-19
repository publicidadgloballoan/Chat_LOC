'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface License {
  id: number;
  token: string;
  company_name: string;
  email: string;
  status: 'active' | 'pending' | 'blocked' | 'suspended';
  subscription_end: string;
  grace_end: string;
  plan: string;
  created_at: string;
  warning_sent: number;
}

interface NewLicResult {
  token: string;
  totp_secret: string;
  totp_uri: string;
  company: string;
  subscription_end: string;
  grace_end: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  active:    { bg: 'rgba(34,197,94,0.15)',  text: '#22c55e', label: '✅ ACTIVA' },
  pending:   { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: '⏳ PENDIENTE' },
  blocked:   { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444', label: '⛔ BLOQUEADA' },
  suspended: { bg: 'rgba(107,114,128,0.15)',text: '#6b7280', label: '🔒 SUSPENDIDA' },
};

export default function LicenseAdmin({ apiHost, token }: { apiHost: string; token: string | null }) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [serverDown, setServerDown] = useState(false);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ company_name: '', email: '', months: '1' });
  const [creating, setCreating] = useState(false);
  const [newResult, setNewResult] = useState<NewLicResult | null>(null);

  // Renew modal
  const [renewTarget, setRenewTarget] = useState<License | null>(null);
  const [renewMonths, setRenewMonths] = useState('1');
  
  // USB modal
  const [usbTarget, setUsbTarget] = useState<License | null>(null);
  const [usbDays, setUsbDays] = useState('365');
  const [usbCustomMode, setUsbCustomMode] = useState(false);
  
  const [actionLoading, setActionLoading] = useState('');

  const headers = { Authorization: `Bearer ${token}` };
  const base = `http://${apiHost}:4000/api/admin/licenses`;

  const load = useCallback(async () => {
    setLoading(true); setError(''); setServerDown(false);
    try {
      const r = await axios.get(base, { headers });
      setLicenses(r.data);
    } catch (e: any) {
      if (e.response?.status === 503) setServerDown(true);
      else setError(e.response?.data?.error || 'Error al cargar');
    } finally { setLoading(false); }
  }, [base, token]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.company_name) return;
    setCreating(true);
    try {
      const r = await axios.post(`${base}/create`, form, { headers });
      setNewResult(r.data);
      setForm({ company_name: '', email: '', months: '1' });
      load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al crear');
    } finally { setCreating(false); }
  };

  const handleRenew = async () => {
    if (!renewTarget) return;
    setActionLoading(renewTarget.token);
    try {
      await axios.post(`${base}/renew/${encodeURIComponent(renewTarget.token)}`, { months: parseInt(renewMonths) }, { headers });
      setRenewTarget(null);
      load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al renovar');
    } finally {
      setActionLoading('');
    }
  };

  const handleRevoke = async (lic: License) => {
    if (!confirm(`¿Bloquear licencia de "${lic.company_name}"? El cliente perderá acceso.`)) return;
    setActionLoading(lic.token);
    try {
      await axios.post(`${base}/revoke/${encodeURIComponent(lic.token)}`, {}, { headers });
      load();
    } catch (e: any) { setError(e.response?.data?.error || 'Error'); }
    finally { setActionLoading(''); }
  };

  const handleGenerateDat = async () => {
    if (!usbTarget) return;
    const finalDays = usbCustomMode ? parseInt(usbDays) : parseInt(usbDays);
    if (isNaN(finalDays) || finalDays <= 0) return alert('Días inválidos');

    setActionLoading(usbTarget.token);
    try {
      const response = await axios.post(`http://${apiHost}:7000/api/generate_dat`, {
        license_token: usbTarget.token,
        valid_days: finalDays
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `saas_ia_key_${usbTarget.company_name.replace(/ /g, '_')}.dat`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setUsbTarget(null);
    } catch (e: any) {
      alert('Error al generar .dat: ' + (e.response?.data?.error || e.message));
    } finally {
      setActionLoading('');
    }
  };

  const daysLeft = (end: string) => {
    const d = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);
    return d;
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

  // ─── QR display (using URI in an image) ───────────────────
  const qrUrl = newResult
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(newResult.totp_uri)}`
    : '';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 900, margin: 0 }}>🔑 Licencias SaaS</h2>
          <p style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>
            {licenses.length} licencias · Solo acceso superadmin
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} style={btnStyle('#334155', '#94a3b8')}>🔄 Actualizar</button>
          <button onClick={() => { setShowCreate(true); setNewResult(null); }} style={btnStyle('#6366f1', '#fff')}>
            ＋ Nueva Licencia
          </button>
        </div>
      </div>

      {/* ─── SERVER DOWN ALERT ─── */}
      {serverDown && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '14px 20px', marginBottom: 16, color: '#fca5a5', fontSize: 13 }}>
          ⚠️ <strong>Servidor de licencias offline.</strong> Iniciá el servidor con:<br />
          <code style={{ background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: 6, fontSize: 12, display: 'inline-block', marginTop: 6 }}>
            cd license_server &amp;&amp; python license_server.py
          </code>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 14, color: '#fca5a5', fontSize: 12 }}>
          ⛔ {error}
        </div>
      )}

      {/* ─── STATS ROW ─── */}
      {!loading && !serverDown && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total', val: licenses.length, color: '#6366f1' },
            { label: 'Activas', val: licenses.filter(l => l.status === 'active').length, color: '#22c55e' },
            { label: 'Bloqueadas', val: licenses.filter(l => l.status === 'blocked').length, color: '#ef4444' },
            { label: 'Por vencer (7d)', val: licenses.filter(l => l.status === 'active' && daysLeft(l.subscription_end) <= 7 && daysLeft(l.subscription_end) > 0).length, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ─── TABLE ─── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>⏳ Cargando licencias...</div>
      ) : !serverDown && (
        <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Token', 'Empresa', 'Email', 'Estado', 'Vence', 'Días', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', color: '#475569', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', textAlign: 'left', letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {licenses.map((lic, i) => {
                const sc = STATUS_COLORS[lic.status] || STATUS_COLORS.blocked;
                const days = daysLeft(lic.subscription_end);
                const isLoading = actionLoading === lic.token;
                return (
                  <tr key={lic.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#818cf8', fontSize: 11 }}>
                      {lic.token.substring(0, 16)}...
                      <button onClick={() => navigator.clipboard.writeText(lic.token)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', marginLeft: 4, fontSize: 12 }}
                        title="Copiar token completo">📋</button>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#f1f5f9', fontWeight: 700 }}>{lic.company_name}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 11 }}>{lic.email || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 11 }}>{fmtDate(lic.subscription_end)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: days <= 0 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#22c55e', fontWeight: 900, fontSize: 14 }}>
                        {days <= 0 ? 'VENCIDA' : days}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setUsbTarget(lic); setUsbDays('365'); setUsbCustomMode(false); }}
                          disabled={isLoading}
                          style={btnSm('#f59e0b')}>USB</button>
                        <button onClick={() => { setRenewTarget(lic); setRenewMonths('1'); }}
                          disabled={isLoading}
                          style={btnSm('#22c55e')}>Renovar</button>
                        {lic.status !== 'blocked' && (
                          <button onClick={() => handleRevoke(lic)} disabled={isLoading}
                            style={btnSm('#ef4444')}>Bloquear</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {licenses.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#334155', fontStyle: 'italic' }}>
                  Sin licencias creadas aún. Creá la primera.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── MODAL: CREAR LICENCIA ─── */}
      {showCreate && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 18, margin: 0 }}>➕ Nueva Licencia</h3>
              <button onClick={() => { setShowCreate(false); setNewResult(null); }} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            {!newResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Nombre de la empresa *" value={form.company_name}
                  onChange={v => setForm(f => ({ ...f, company_name: v }))} placeholder="Acme Corp S.A." />
                <Field label="Email del cliente" value={form.email} type="email"
                  onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="cliente@empresa.com" />
                <div>
                  <label style={labelStyle}>Meses de suscripción</label>
                  <select value={form.months} onChange={e => setForm(f => ({ ...f, months: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    {[1, 3, 6, 12].map(m => <option key={m} value={m}>{m} {m === 1 ? 'mes' : 'meses'}</option>)}
                  </select>
                </div>
                <button onClick={handleCreate} disabled={creating || !form.company_name}
                  style={{ ...btnStyle('#6366f1', '#fff'), marginTop: 10, padding: '14px', fontSize: 13, justifyContent: 'center', opacity: creating ? 0.7 : 1 }}>
                  {creating ? '⏳ Creando...' : '🚀 Crear Licencia'}
                </button>
              </div>
            ) : (
              // ─── RESULTADO ───
              <div>
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ color: '#86efac', fontWeight: 700, marginBottom: 8 }}>✅ Licencia creada para <strong>{newResult.company}</strong></div>
                  <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#a5b4fc', letterSpacing: 2, marginBottom: 8 }}>{newResult.token}</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>Vence: {fmtDate(newResult.subscription_end)} · Gracia: {fmtDate(newResult.grace_end)}</div>
                </div>

                {/* QR Code */}
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <p style={{ color: '#64748b', fontSize: 11, marginBottom: 10 }}>📱 El cliente escanea este QR con Google Authenticator:</p>
                  <img src={qrUrl} alt="QR Google Auth" style={{ borderRadius: 12, border: '3px solid rgba(99,102,241,0.4)', width: 180, height: 180 }} />
                </div>

                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px dashed rgba(99,102,241,0.3)', borderRadius: 10, padding: 14, fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>
                  <strong style={{ color: '#818cf8' }}>📋 Instrucciones para el cliente:</strong><br />
                  1. Instalar Google Authenticator<br />
                  2. Escanear el QR de arriba<br />
                  3. Guardar el token: <code style={{ color: '#a5b4fc' }}>{newResult.token}</code><br />
                  4. Al registrar empresa: ingresar token + código de 6 dígitos
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => navigator.clipboard.writeText(newResult.token)}
                    style={btnStyle('#334155', '#94a3b8')}>📋 Copiar Token</button>
                  <button onClick={() => { setShowCreate(false); setNewResult(null); }}
                    style={{ ...btnStyle('#22c55e', '#fff'), flex: 1, justifyContent: 'center' }}>✔ Listo</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL: RENOVAR ─── */}
      {renewTarget && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: 400 }}>
            <h3 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 16, marginBottom: 16 }}>🔄 Renovar Licencia</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
              <strong style={{ color: '#f1f5f9' }}>{renewTarget.company_name}</strong><br />
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#818cf8' }}>{renewTarget.token}</span>
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Meses a agregar</label>
              <select value={renewMonths} onChange={e => setRenewMonths(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {[1, 3, 6, 12].map(m => <option key={m} value={m}>{m} {m === 1 ? 'mes' : 'meses'}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setRenewTarget(null)} style={btnStyle('#334155', '#94a3b8')}>Cancelar</button>
              <button onClick={handleRenew} style={{ ...btnStyle('#22c55e', '#fff'), flex: 1, justifyContent: 'center' }}>
                ✅ Confirmar Renovación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: GENERAR USB ─── */}
      {usbTarget && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 18, margin: 0 }}>💾 Generar Llave USB</h3>
              <button onClick={() => setUsbTarget(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>
              Configuración de validez para:<br />
              <strong style={{ color: '#f1f5f9' }}>{usbTarget.company_name}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Tiempo de validez</label>
                <select 
                  value={usbCustomMode ? 'custom' : usbDays} 
                  onChange={e => {
                    if (e.target.value === 'custom') {
                      setUsbCustomMode(true);
                    } else {
                      setUsbCustomMode(false);
                      setUsbDays(e.target.value);
                    }
                  }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="30">30 Días (Demo)</option>
                  <option value="90">90 Días (Trimestral)</option>
                  <option value="365">365 Días (Anual)</option>
                  <option value="custom">Ingresar días manualmente...</option>
                </select>
              </div>

              {usbCustomMode && (
                <div style={{ animation: 'fadeIn 0.2s ease' }}>
                  <label style={labelStyle}>Días de validez</label>
                  <input 
                    type="number" 
                    value={usbDays}
                    onChange={e => setUsbDays(e.target.value)}
                    placeholder="Ej: 40"
                    style={inputStyle}
                    autoFocus
                  />
                  <p style={{ color: '#64748b', fontSize: 10, marginTop: 4 }}>
                    Ingrese el número exacto de días que la llave será válida.
                  </p>
                </div>
              )}

              <button 
                onClick={handleGenerateDat} 
                disabled={!!actionLoading}
                style={{ 
                  ...btnStyle('#f59e0b', '#fff'), 
                  marginTop: 10, 
                  padding: '14px', 
                  fontSize: 13, 
                  justifyContent: 'center',
                  opacity: actionLoading ? 0.7 : 1
                }}
              >
                {actionLoading ? '⏳ Generando...' : '💾 Generar y Descargar .dat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle}
        onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
    </div>
  );
}


const labelStyle: React.CSSProperties = { display: 'block', color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', fontFamily: 'inherit' };
const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
const modalStyle: React.CSSProperties = { background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' };

function btnStyle(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'opacity 0.2s' };
}
function btnSm(color: string): React.CSSProperties {
  return { background: `${color}18`, color, border: `1px solid ${color}44`, borderRadius: 6, padding: '5px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer' };
}
