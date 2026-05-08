/**
 * Landing Page — AIDA Marketing Conversion Page v2
 * Enhancements: Marquee ticker, Pricing cards, Spotlight hover, polished layout
 */
import React, { useState } from 'react';
import { navigate } from '../router';
import { useAuth } from '../authContext';
import {
  Mic, Sparkles, Upload, Globe, ChevronRight, MessageCircle,
  Film, BookOpen, ShoppingCart, Radio, Volume2,
  DollarSign, Check, X as XIcon, ChevronDown, Star,
  ArrowRight, Headphones, FileText, Zap, Shield, Infinity, Crown
} from 'lucide-react';

/* ─── Data ─── */
const DEMO_VOICES = [
  { id:'review', label:'🎬 Review Phim', voice:'Thảo Vy (Miền Nam)', desc:'Giọng nữ miền Nam ngọt ngào, lôi cuốn — phù hợp review phim, kể chuyện.', color:'#f472b6', bg:'#fdf2f8', sample:'Bộ phim này thực sự đã khiến tôi bất ngờ từ đầu đến cuối. Diễn xuất quá xuất sắc, cốt truyện twist không thể đoán trước được.' },
  { id:'story', label:'👻 Kể Chuyện Ma', voice:'Cố Tướng Trung Vương', desc:'Giọng uy nghiêm, mạnh mẽ — đặc biệt phù hợp kể chuyện kinh dị, lịch sử.', color:'#8b5cf6', bg:'#f5f3ff', sample:'Đêm đó, trong căn nhà hoang cũ kỹ, tiếng bước chân vang lên từ tầng trên. Nhưng... không ai ở đó cả.' },
  { id:'news', label:'📰 Tin Tức / MC', voice:'Mai Linh (Miền Bắc)', desc:'Giọng nữ miền Bắc trong trẻo, dịu dàng — chuẩn MC tin tức, podcast.', color:'#2563eb', bg:'#eff6ff', sample:'Theo ghi nhận của phóng viên, thị trường công nghệ AI đang có bước phát triển vượt bậc trong năm 2025.' },
  { id:'sell', label:'🛒 Bán Hàng TikTok', voice:'Mẫu Nghị Thanh Hạ', desc:'Giọng quý phái, đoan trang — gây ấn tượng mạnh cho video quảng cáo.', color:'#059669', bg:'#ecfdf5', sample:'Chỉ còn 24 tiếng nữa thôi! Bộ serum này đang giảm 50% — đây là mức giá chưa từng có. Đặt hàng ngay!' },
];

const COMPARE_DATA = [
  { feat:'Giá sử dụng', us:'Miễn phí trọn đời', them:'150K - 500K/tháng' },
  { feat:'Giới hạn ký tự', us:'Không giới hạn (xoay key)', them:'3,000 - 10,000 chữ/tháng' },
  { feat:'AI Diễn cảm tự động', us:'Có — AI tự thêm biểu cảm', them:'Không hoặc trả thêm phí' },
  { feat:'Batch SRT/Phụ đề', us:'Upload SRT → dịch + lồng tiếng', them:'Không hỗ trợ' },
  { feat:'Số lượng giọng VN', us:'30+ giọng đặc sắc', them:'5-10 giọng cơ bản' },
  { feat:'Đa ngôn ngữ', us:'40+ ngôn ngữ', them:'2-5 ngôn ngữ' },
];

const FAQ_DATA = [
  { q:'Tool này có thật sự miễn phí không?', a:'Có. Voice Studio là công cụ miễn phí. Bạn chỉ cần sử dụng API Key của Google Gemini (cũng miễn phí). Không cần trả bất kỳ khoản phí nào.' },
  { q:'API Key lấy ở đâu?', a:'Truy cập aistudio.google.com/apikey → Đăng nhập Google → Nhấn "Create API Key" → Copy key và dán vào tool. Chỉ mất 10 giây.' },
  { q:'Có sợ dính bản quyền YouTube không?', a:'Không. Giọng AI được tạo bởi Google Gemini là giọng tổng hợp, không thuộc quyền sở hữu của ai. Bạn hoàn toàn có thể sử dụng cho mục đích thương mại.' },
  { q:'Tại sao cần nhiều API Key?', a:'Mỗi API Key miễn phí có giới hạn quota. Bằng cách thêm nhiều key, hệ thống sẽ tự xoay vòng khi 1 key hết quota → bạn sử dụng không giới hạn.' },
  { q:'Có hỗ trợ file dài như audiobook không?', a:'Có. Bạn có thể upload file SRT hoặc TXT dài. Hệ thống sẽ tự chia nhỏ và tạo giọng đọc cho từng đoạn một cách tự động.' },
];

const TICKER_ITEMS = [
  '🔥 15,000+ file âm thanh đã tạo',
  '⭐ 30+ giọng Việt Nam độc quyền',
  '🌍 Hỗ trợ 40+ ngôn ngữ',
  '💰 Hoàn toàn miễn phí — 0đ',
  '🚀 AI diễn cảm tự động',
  '📄 Batch xử lý SRT tự động',
];

export default function Landing() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number|null>(null);

  const goStudio = () => navigate(user ? '/studio' : '/register');

  return (
    <div className="landing-page">
      {/* ===== HEADER ===== */}
      <header className="landing-header">
        <div className="flex items-center gap-3">
          <div className="logo-icon"><Mic size={18} color="white" /></div>
          <span className="font-bold text-lg tracking-tight" style={{color:'var(--text-primary)'}}>Voice Studio</span>
        </div>
        <nav className="flex items-center gap-3">
          {user ? (
            <button onClick={() => navigate('/studio')} className="btn-primary-sm">Vào Studio →</button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn-ghost-sm">Đăng nhập</button>
              <button onClick={() => navigate('/register')} className="btn-primary-sm">Dùng thử miễn phí</button>
            </>
          )}
        </nav>
      </header>

      {/* ===== S1: HERO ===== */}
      <section className="hero-section">
        <div className="hero-badge">🔥 Hơn 15,000 file âm thanh đã được tạo</div>
        <h1 className="hero-title">
          Biến Văn Bản Thành<br/>
          <span className="gradient-text">Giọng Đọc Triệu View</span>
        </h1>
        <p className="hero-desc">
          Giọng AI siêu thực, tự động thêm biểu cảm, ngắt nghỉ chuẩn xác.<br/>
          Không giới hạn ký tự. <strong>Hoàn toàn miễn phí trọn đời.</strong>
        </p>
        <div className="hero-actions">
          <button onClick={goStudio} className="btn-cta">
            <Sparkles size={18}/> Tạo Giọng Nói Ngay
          </button>
          <button onClick={() => { document.getElementById('demo-voices')?.scrollIntoView({behavior:'smooth'}); }} className="btn-cta-ghost">
            <Headphones size={16}/> Nghe thử giọng đọc
          </button>
        </div>
        <p className="hero-trust">
          <Check size={14}/> Không cần thẻ Visa &nbsp;·&nbsp; <Check size={14}/> Không spam &nbsp;·&nbsp; <Check size={14}/> Bắt đầu trong 30 giây
        </p>
      </section>

      {/* ===== MARQUEE TICKER ===== */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t,i) => (
            <span key={i} className="ticker-item">{t}</span>
          ))}
        </div>
      </div>

      {/* ===== S2: DEMO VOICES ===== */}
      <section className="demo-section" id="demo-voices">
        <h2 className="section-title">🎧 Nghe thử — Chọn giọng bạn cần</h2>
        <p className="section-subtitle">Nhấn "Thử giọng này" để trải nghiệm trực tiếp trong Studio. Đây chỉ là 4 trong 30+ giọng có sẵn.</p>
        <div className="demo-grid">
          {DEMO_VOICES.map(d => (
            <div key={d.id} className="demo-card spotlight-card">
              <div className="demo-card-head">
                <span className="demo-label" style={{background:d.bg, color:d.color}}>{d.label}</span>
              </div>
              <h3 className="demo-voice-name">{d.voice}</h3>
              <p className="demo-voice-desc">{d.desc}</p>
              <div className="demo-sample-box">
                <Volume2 size={14} style={{color:d.color, flexShrink:0, marginTop:2}}/>
                <p className="demo-sample-text">"{d.sample}"</p>
              </div>
              <button onClick={goStudio} className="demo-try-btn" style={{background:d.color}}>
                Thử giọng này →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ===== S3: COMPARE TABLE ===== */}
      <section className="compare-section">
        <h2 className="section-title">💰 Tại sao chọn Voice Studio?</h2>
        <p className="section-subtitle">So sánh trực tiếp với các dịch vụ TTS trả phí trên thị trường.</p>
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Tính năng</th>
                <th className="col-us"><div className="col-us-label"><Star size={14}/> Voice Studio</div></th>
                <th className="col-them">Tool TTS khác</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_DATA.map((r,i) => (
                <tr key={i}>
                  <td className="feat-name">{r.feat}</td>
                  <td className="col-us"><Check size={14} style={{color:'#059669', marginRight:6, flexShrink:0}}/>{r.us}</td>
                  <td className="col-them"><XIcon size={14} style={{color:'#dc2626', marginRight:6, flexShrink:0}}/>{r.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== S4: PRICING (Psychological trick — Free looks premium) ===== */}
      <section className="pricing-section">
        <h2 className="section-title">🏷️ Bảng giá</h2>
        <p className="section-subtitle">Một gói duy nhất. Tất cả tính năng. Hoàn toàn miễn phí.</p>
        <div className="pricing-grid">
          {/* Free Plan */}
          <div className="pricing-card">
            <div className="pricing-header">
              <span className="pricing-plan-name">Starter</span>
              <div className="pricing-price"><span className="pricing-amount">0đ</span><span className="pricing-period">/tháng</span></div>
            </div>
            <ul className="pricing-features">
              <li><Check size={14}/> 30+ giọng Việt Nam</li>
              <li><Check size={14}/> Upload SRT / TXT</li>
              <li><Check size={14}/> 40+ ngôn ngữ</li>
              <li><Check size={14}/> 1 API Key</li>
              <li className="muted"><XIcon size={14}/> AI Diễn cảm tự động</li>
              <li className="muted"><XIcon size={14}/> Xoay vòng Key</li>
            </ul>
            <button onClick={goStudio} className="pricing-btn-outline">Bắt đầu miễn phí</button>
          </div>
          {/* Pro Plan (recommended) */}
          <div className="pricing-card pricing-card-pro">
            <div className="pricing-badge-hot">🔥 PHỔ BIẾN NHẤT</div>
            <div className="pricing-header">
              <span className="pricing-plan-name">Pro</span>
              <div className="pricing-price"><span className="pricing-amount pricing-free">0đ</span><span className="pricing-period">/mãi mãi</span></div>
              <p className="pricing-note">Chỉ cần thêm nhiều API Key</p>
            </div>
            <ul className="pricing-features">
              <li><Check size={14}/> Tất cả tính năng Starter</li>
              <li><Check size={14}/> <strong>AI Diễn cảm tự động</strong></li>
              <li><Check size={14}/> <strong>Xoay vòng Key không giới hạn</strong></li>
              <li><Check size={14}/> Lưu Profile giọng yêu thích</li>
              <li><Check size={14}/> Dịch phụ đề đa ngôn ngữ</li>
              <li><Check size={14}/> Batch tạo audio hàng loạt</li>
            </ul>
            <button onClick={goStudio} className="pricing-btn-primary">Dùng Pro miễn phí →</button>
          </div>
        </div>
      </section>

      {/* ===== S5: TARGET AUDIENCE ===== */}
      <section className="audience-section">
        <h2 className="section-title">🎯 Dành cho ai?</h2>
        <div className="audience-grid">
          {[
            { icon:<Film size={28}/>, color:'#f472b6', bg:'#fdf2f8', title:'TikToker / YouTuber', desc:'Làm video review phim, kể chuyện, tin tức nhanh. Không cần thu âm, không cần phòng cách âm.' },
            { icon:<ShoppingCart size={28}/>, color:'#059669', bg:'#ecfdf5', title:'Marketer / Agency', desc:'Tạo video ads Facebook/TikTok hàng loạt. A/B test nhiều giọng khác nhau trong 5 phút.' },
            { icon:<BookOpen size={28}/>, color:'#2563eb', bg:'#eff6ff', title:'Audiobook Creator', desc:'Chuyển hàng ngàn trang sách thành sách nói. Upload SRT, hệ thống chạy tự động.' },
            { icon:<Radio size={28}/>, color:'#8b5cf6', bg:'#f5f3ff', title:'Podcaster / MC', desc:'Tạo intro, outro, hoặc toàn bộ podcast. Chọn giọng MC chuyên nghiệp chuẩn VTV.' },
          ].map((a,i) => (
            <div key={i} className="audience-card spotlight-card">
              <div className="audience-icon" style={{background:a.bg, color:a.color}}>{a.icon}</div>
              <h3 className="audience-title">{a.title}</h3>
              <p className="audience-desc">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== S6: SOCIAL PROOF STATS ===== */}
      <section className="proof-section">
        <div className="proof-stats">
          {[
            { num:'15,000+', label:'File âm thanh đã tạo', icon:<Headphones size={20}/> },
            { num:'30+', label:'Giọng Việt Nam độc quyền', icon:<Mic size={20}/> },
            { num:'40+', label:'Ngôn ngữ hỗ trợ', icon:<Globe size={20}/> },
            { num:'0đ', label:'Chi phí sử dụng', icon:<DollarSign size={20}/> },
          ].map((s,i) => (
            <div key={i} className="proof-stat-card">
              <div className="proof-stat-icon">{s.icon}</div>
              <div className="proof-stat-num">{s.num}</div>
              <div className="proof-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== S7: FAQ ===== */}
      <section className="faq-section">
        <h2 className="section-title">❓ Câu hỏi thường gặp</h2>
        <div className="faq-list">
          {FAQ_DATA.map((f,i) => (
            <div key={i} className={`faq-item ${openFaq===i?'open':''}`}>
              <button className="faq-question" onClick={() => setOpenFaq(openFaq===i ? null : i)}>
                <span>{f.q}</span>
                <ChevronDown size={16} className={`faq-chevron ${openFaq===i?'rotated':''}`}/>
              </button>
              {openFaq===i && <div className="faq-answer">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="cta-banner">
        <h2>Bắt đầu làm chủ công nghệ AI Voice</h2>
        <p>Tạo tài khoản ngay — Hoàn toàn miễn phí, không cần thẻ ngân hàng.</p>
        <button onClick={goStudio} className="btn-cta">
          Tạo Giọng Nói Ngay <ArrowRight size={18}/>
        </button>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="flex items-center gap-3">
          <div className="logo-icon" style={{ width: 28, height: 28 }}><Mic size={14} color="white" /></div>
          <span className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>Voice Studio</span>
        </div>
        <div className="footer-contact">
          <MessageCircle size={16}/>
          <span>Liên hệ Zalo:</span>
          <a href="https://zalo.me/0934415387" target="_blank" rel="noreferrer" className="footer-zalo">Đường Thọ — 0934415387</a>
        </div>
        <p className="footer-copy">© 2025 Voice Studio. Powered by GoVeoAi.</p>
      </footer>
    </div>
  );
}
