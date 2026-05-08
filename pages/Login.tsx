/**
 * Login Page
 */
import React, { useState } from 'react';
import { navigate } from '../router';
import { useAuth } from '../authContext';
import { loginUser } from '../supabase';
import { Mic, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true); setError(null);
    try {
      const user = await loginUser(email, password);
      login(user);
      navigate('/studio');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon"><Mic size={20} color="white" /></div>
          <span>Voice Studio</span>
        </div>

        <h1 className="auth-title">Đăng nhập</h1>
        <p className="auth-subtitle">Chào mừng trở lại! Tiếp tục tạo giọng nói.</p>

        {error && (
          <div className="auth-error">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email</label>
            <div className="input-wrap">
              <Mail size={15} className="input-icon" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@gmail.com" required
              />
            </div>
          </div>
          <div className="auth-field">
            <label>Mật khẩu</label>
            <div className="input-wrap">
              <Lock size={15} className="input-icon" />
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-auth-submit">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="auth-switch">
          Chưa có tài khoản?{' '}
          <button onClick={() => navigate('/register')} className="auth-link">
            Đăng ký miễn phí
          </button>
        </p>
        <button onClick={() => navigate('/')} className="auth-back">← Về trang chủ</button>
      </div>
    </div>
  );
}
