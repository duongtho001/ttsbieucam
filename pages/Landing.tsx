/**
 * Landing Page — Trang chủ giới thiệu TTS Voice Studio
 */
import React from 'react';
import { navigate } from '../router';
import { useAuth } from '../authContext';
import { Mic, Sparkles, Upload, Globe, Zap, Users, ChevronRight, MessageCircle } from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="flex items-center gap-3">
          <div className="logo-icon">
            <Mic size={18} color="white" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{color:'var(--text-primary)'}}>Voice Studio</span>
        </div>
        <nav className="flex items-center gap-3">
          {user ? (
            <button onClick={() => navigate('/studio')} className="btn-primary-sm">
              Vào Studio →
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn-ghost-sm">Đăng nhập</button>
              <button onClick={() => navigate('/register')} className="btn-primary-sm">Đăng ký miễn phí</button>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-badge">🎙️ Powered by Gemini AI</div>
        <h1 className="hero-title">
          Tạo giọng đọc chuyên nghiệp<br />
          <span className="gradient-text">Miễn phí — Không giới hạn</span>
        </h1>
        <p className="hero-desc">
          AI tự động phân tích văn bản, chọn giọng phù hợp và thêm biểu cảm tự nhiên.<br />
          Không cần kinh nghiệm. Không tốn một đồng nào.
        </p>
        <div className="hero-actions">
          <button onClick={() => navigate('/register')} className="btn-cta">
            <Sparkles size={18} /> Bắt đầu miễn phí
          </button>
          <button onClick={() => navigate('/login')} className="btn-cta-ghost">
            Đã có tài khoản? Đăng nhập
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2 className="section-title">Tính năng nổi bật</h2>
        <div className="features-grid">
          {[
            {
              icon: <Sparkles size={24} />,
              color: '#34d399',
              title: 'AI Diễn cảm',
              desc: 'AI tự phân tích cảm xúc văn bản và thêm biểu cảm tự nhiên. Bạn chỉ cần dán text.',
            },
            {
              icon: <Mic size={24} />,
              color: '#a78bfa',
              title: '30+ Giọng Việt Nam',
              desc: 'Từ giọng miền Bắc, miền Nam đến nhân vật đặc sắc như Đạo Sĩ, Tướng quân, Ca nương...',
            },
            {
              icon: <Upload size={24} />,
              color: '#60a5fa',
              title: 'Upload SRT',
              desc: 'Tải file phụ đề .srt lên, tạo giọng đọc tự động theo từng đoạn. Hỗ trợ dịch đa ngôn ngữ.',
            },
            {
              icon: <Globe size={24} />,
              color: '#f472b6',
              title: 'Đa ngôn ngữ',
              desc: 'Hỗ trợ tiếng Việt, Anh, Nhật, Hàn, Trung và 40+ ngôn ngữ khác.',
            },
            {
              icon: <Zap size={24} />,
              color: '#fbbf24',
              title: 'Không giới hạn',
              desc: 'Thêm nhiều API key để tăng lượt dùng. Hệ thống tự xoay vòng key thông minh.',
            },
            {
              icon: <Users size={24} />,
              color: '#f87171',
              title: 'Lưu Profile giọng',
              desc: 'Lưu phong cách giọng đọc ưa thích. Dùng lại cho nhiều đoạn khác nhau.',
            },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon" style={{ color: f.color, background: f.color + '18' }}>
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <h2>Sẵn sàng tạo giọng nói đầu tiên?</h2>
        <p>Đăng ký miễn phí ngay — Không cần thẻ ngân hàng</p>
        <button onClick={() => navigate('/register')} className="btn-cta">
          Tạo tài khoản miễn phí <ChevronRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="flex items-center gap-3">
          <div className="logo-icon" style={{ width: 28, height: 28 }}>
            <Mic size={14} color="white" />
          </div>
          <span className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>Voice Studio</span>
        </div>
        <div className="footer-contact">
          <MessageCircle size={16} />
          <span>Liên hệ Zalo:</span>
          <a href="https://zalo.me/0934415387" target="_blank" rel="noreferrer" className="footer-zalo">
            Đường Thọ — 0934415387
          </a>
        </div>
        <p className="footer-copy">© 2025 Voice Studio. Powered by GoVeoAi.</p>
      </footer>
    </div>
  );
}
