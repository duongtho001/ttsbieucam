import React, { useState, useEffect } from 'react';
import { navigate } from '../router';
import { getSupabaseConfig, saveSupabaseConfig, testConnection, getAllUsers, SETUP_SQL, SupabaseConfig } from '../supabase';
import { Settings, Database, Users, Copy, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

const ADMIN_PASS = 'admin2025'; // Đổi mật khẩu tại đây

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [cfg, setCfg] = useState<SupabaseConfig>({ url: '', anonKey: '' });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'config' | 'users' | 'sql'>('config');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = getSupabaseConfig();
    if (saved) setCfg(saved);
  }, []);

  if (!authed) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">🔐 Admin Panel</h1>
          <form onSubmit={e => { e.preventDefault(); if (pass === ADMIN_PASS) setAuthed(true); }} className="auth-form">
            <div className="auth-field">
              <label>Mật khẩu Admin</label>
              <div className="input-wrap">
                <Settings size={15} className="input-icon"/>
                <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" required/>
              </div>
            </div>
            <button type="submit" className="btn-auth-submit">Truy cập</button>
          </form>
          <button onClick={()=>navigate('/studio')} className="auth-back">← Về Studio</button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    saveSupabaseConfig(cfg);
    alert('Đã lưu cấu hình Supabase!');
  };

  const handleTest = async () => {
    setTesting(true); setTestResult(null);
    saveSupabaseConfig(cfg);
    const ok = await testConnection();
    setTestResult(ok);
    setTesting(false);
  };

  const handleLoadUsers = async () => {
    try { setUsers(await getAllUsers()); } catch (e: any) { alert(e.message); }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="flex items-center gap-3">
          <button onClick={()=>navigate('/studio')} className="admin-back-btn"><ArrowLeft size={16}/>Studio</button>
          <h1 className="admin-title">Admin Panel</h1>
        </div>
        <div className="admin-tabs">
          {(['config','users','sql'] as const).map(t => (
            <button key={t} onClick={()=>setTab(t)} className={`admin-tab ${tab===t?'active':''}`}>
              {t==='config'?'⚙️ Cấu hình':t==='users'?'👥 Users':'📋 SQL'}
            </button>
          ))}
        </div>
      </header>

      <div className="admin-content">
        {tab === 'config' && (
          <div className="admin-card">
            <h2 className="admin-card-title"><Database size={18}/>Cấu hình Supabase</h2>
            <div className="admin-field">
              <label>Supabase URL</label>
              <input value={cfg.url} onChange={e=>setCfg({...cfg,url:e.target.value})} placeholder="https://xxx.supabase.co" className="admin-input"/>
            </div>
            <div className="admin-field">
              <label>Anon Key</label>
              <input value={cfg.anonKey} onChange={e=>setCfg({...cfg,anonKey:e.target.value})} placeholder="eyJ..." className="admin-input" type="password"/>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} className="btn-admin-save">💾 Lưu</button>
              <button onClick={handleTest} disabled={testing} className="btn-admin-test">
                {testing?<Loader2 size={14} className="animate-spin"/>:null} Test kết nối
              </button>
              {testResult===true && <span className="flex items-center gap-1 text-green-400 text-sm"><CheckCircle size={14}/>Kết nối thành công!</span>}
              {testResult===false && <span className="flex items-center gap-1 text-red-400 text-sm"><XCircle size={14}/>Kết nối thất bại!</span>}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="admin-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="admin-card-title"><Users size={18}/>Danh sách Users ({users.length})</h2>
              <button onClick={handleLoadUsers} className="btn-admin-save">Tải dữ liệu</button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>#</th><th>Email</th><th>SĐT</th><th>Ngày tạo</th></tr></thead>
                <tbody>
                  {users.map((u,i) => (
                    <tr key={u.id}>
                      <td>{i+1}</td>
                      <td>{u.email}</td>
                      <td>{u.phone||'—'}</td>
                      <td>{new Date(u.created_at).toLocaleString('vi')}</td>
                    </tr>
                  ))}
                  {users.length===0 && <tr><td colSpan={4} className="text-center" style={{color:'var(--text-muted)'}}>Chưa có dữ liệu. Nhấn "Tải dữ liệu".</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'sql' && (
          <div className="admin-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="admin-card-title">📋 SQL Setup</h2>
              <button onClick={copySQL} className="btn-admin-save">
                {copied?<><CheckCircle size={14}/>Đã copy!</>:<><Copy size={14}/>Copy SQL</>}
              </button>
            </div>
            <p className="text-sm mb-3" style={{color:'var(--text-muted)'}}>Chạy SQL này trong Supabase SQL Editor để tạo bảng users:</p>
            <pre className="admin-sql">{SETUP_SQL}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
