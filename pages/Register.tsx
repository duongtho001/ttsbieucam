import React, { useState } from 'react';
import { navigate } from '../router';
import { useAuth } from '../authContext';
import { registerUser } from '../supabase';
import { Mic, Mail, Phone, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function Register() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const user = await registerUser(email, phone, password);
      setSuccess(true);
      setTimeout(() => { login(user); navigate('/studio'); }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><Mic size={20} color="white" /></div>
          <span>Voice Studio</span>
        </div>
        <h1 className="auth-title">Đăng ký miễn phí</h1>
        <p className="auth-subtitle">Không cần thẻ ngân hàng. Không giới hạn thời gian.</p>
        {error && <div className="auth-error"><AlertCircle size={14}/><span>{error}</span></div>}
        {success && <div className="auth-success"><CheckCircle size={14}/><span>Đăng ký thành công! Đang chuyển hướng...</span></div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email <span className="required">*</span></label>
            <div className="input-wrap">
              <Mail size={15} className="input-icon"/>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@gmail.com" required/>
            </div>
          </div>
          <div className="auth-field">
            <label>Số điện thoại</label>
            <div className="input-wrap">
              <Phone size={15} className="input-icon"/>
              <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0934415387"/>
            </div>
          </div>
          <div className="auth-field">
            <label>Mật khẩu <span className="required">*</span></label>
            <div className="input-wrap">
              <Lock size={15} className="input-icon"/>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" required minLength={6}/>
            </div>
          </div>
          <button type="submit" disabled={loading||success} className="btn-auth-submit">
            {loading?<Loader2 size={16} className="animate-spin"/>:null}
            {loading?'Đang đăng ký...':'🎙️ Tạo tài khoản miễn phí'}
          </button>
        </form>
        <p className="auth-switch">Đã có tài khoản? <button onClick={()=>navigate('/login')} className="auth-link">Đăng nhập</button></p>
        <button onClick={()=>navigate('/')} className="auth-back">← Về trang chủ</button>
      </div>
    </div>
  );
}
