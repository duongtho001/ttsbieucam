# 🎭 TTS Voice Studio — AI Diễn Cảm

> Công cụ chuyển văn bản thành giọng nói chuyên nghiệp với AI tự động phân tích cảm xúc, tuyển giọng phù hợp, và tạo audio biểu cảm sống động.

![Voice Studio](https://img.shields.io/badge/Gemini-TTS-8b5cf6?style=for-the-badge&logo=google&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=for-the-badge&logo=vite&logoColor=white)

---

## ✨ Tính năng nổi bật

### 🎭 AI Diễn Cảm — Trí tuệ nhân tạo đạo diễn giọng nói
- AI **tự động phân tích** nội dung văn bản
- **Tự chọn giọng** phù hợp nhất từ thư viện 30+ giọng
- Tạo **Audio Profile** chuyên nghiệp (bối cảnh, phong cách, nhịp độ)
- Chèn **biểu cảm ngầm** — người dùng chỉ thấy text thuần, AI xử lý phía sau

### 🇻🇳 25+ Giọng Việt Nam bản sắc
| Giọng nữ | Giọng nam |
|-----------|-----------|
| Mai Linh (Miền Bắc) | Minh Quang (Miền Bắc) |
| Thảo Vy (Miền Nam) | Hoàng Dũng (Miền Nam) |
| Nữ Tướng Trưng Vương | Lão Tướng Bạch Đằng |
| Cô Tấm (Kể chuyện) | Đạo Sĩ Ẩn Danh |
| Ca Nương Phố Cổ | Sử Gia Đại Việt |
| ...và nhiều hơn | ...và nhiều hơn |

### 🌍 Giọng Quốc Tế
Zephyr, Puck, Charon, Kore, Fenrir, Aoede... — tất cả giọng Gemini TTS chính thức.

### 💾 Lưu & Tải Profile
- Lưu Audio Profile để **đồng bộ giọng** qua nhiều phiên
- Tải profile cũ → nhập text mới → tạo audio cùng phong cách

### ⚡ Tính năng khác
- 🔄 **Xoay vòng API Key** — thêm nhiều key để tăng lượt dùng
- 🔁 **Auto-retry** — key hết quota tự chuyển key tiếp theo
- 🎚️ Điều chỉnh **tốc độ** và **cao độ** giọng đọc
- 📥 **Tải WAV** — download audio về máy
- 📜 **Lịch sử** — xem lại và phát lại các audio đã tạo

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu
- [Node.js](https://nodejs.org/) phiên bản 18+
- API Key từ [Google AI Studio](https://aistudio.google.com/apikey)

### Bước 1: Clone dự án
```bash
git clone https://github.com/duongtho001/ttsbieucam.git
cd ttsbieucam
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Chạy ứng dụng
```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:3000`

---

## 📖 Hướng dẫn sử dụng

### Bước 1: Thêm API Key

1. Nhấn nút **"🔑 API Keys"** góc trên phải
2. Truy cập [Google AI Studio](https://aistudio.google.com/apikey) để tạo key miễn phí
3. Dán key vào ô textarea (mỗi key một dòng)
4. Nhấn **"Lưu"**

> 💡 **Mẹo:** Thêm nhiều key để tăng lượt dùng. Mỗi key free có 10 lượt TTS/ngày. 5 key = 50 lượt!

### Bước 2: Nhập văn bản

Dán hoặc gõ văn bản cần đọc vào ô soạn thảo.

### Bước 3: Dùng AI Diễn Cảm (tùy chọn)

Nhấn nút **"🎭 AI Diễn cảm"** để AI tự động:
- ✅ Phân tích nội dung và cảm xúc
- ✅ Chọn giọng đọc phù hợp nhất
- ✅ Tạo Audio Profile (bối cảnh, phong cách)
- ✅ Thêm biểu cảm ngầm (không hiển thị trên giao diện)

Sau khi phân tích xong, nút đổi thành **"✅ Đã phân tích"** và Audio Profile hiện phía trên.

> Bạn vẫn có thể **đổi giọng khác** sau khi AI phân tích. AI chỉ gợi ý, bạn quyết định!

### Bước 4: Chọn giọng đọc

- Tab **🇻🇳 Giọng VN** — 25+ persona Việt Nam đặc sắc
- Tab **🌍 Quốc tế** — giọng Gemini gốc
- Lọc theo **Nữ/Nam** để tìm nhanh

### Bước 5: Tạo giọng nói

Nhấn **"🔊 Tạo giọng nói"** → audio phát tự động!

### Bước 6: Tải xuống

Nhấn **"📥 Tải WAV"** để download file âm thanh.

---

## 💾 Đồng bộ giọng (Lưu Profile)

Khi tìm được giọng đọc ưng ý, bạn có thể lưu lại để dùng cho text khác:

### Lưu Profile
1. Sau khi AI phân tích → Audio Profile hiện lên
2. Nhấn nút **"💾 Lưu"** trên panel Audio Profile
3. Nhập tên (VD: "MC Thời sự", "Kể chuyện ma")
4. ✅ Profile đã lưu!

### Tải Profile đã lưu
1. Nhấn **"📂 Giọng đã lưu (N)"** trên toolbar
2. Chọn profile từ danh sách
3. Nhập text mới → Nhấn **"Tạo giọng nói"**
4. Audio sẽ có **cùng phong cách** với lần trước!

---

## ⚙️ Điều chỉnh nâng cao

| Tùy chọn | Mô tả | Phạm vi |
|-----------|--------|---------|
| **Tốc độ** | Nhanh/chậm giọng đọc | 0.5x → 2.0x |
| **Cao độ** | Trầm/cao giọng | -10 → +10 semitones |
| **Ngôn ngữ** | Ngôn ngữ phát âm | Vietnamese, English, ... |

---

## 🔑 Quản lý API Key

### Tạo key miễn phí
1. Vào [Google AI Studio](https://aistudio.google.com/apikey)
2. Nhấn **"Create API Key"**
3. Copy key

### Thêm nhiều key
Mỗi key free tier có giới hạn:
- **10 lượt/ngày** cho model TTS
- Hệ thống **tự xoay vòng** — key hết quota tự chuyển key tiếp

| Số key | Lượt TTS/ngày |
|--------|---------------|
| 1 key | 10 lượt |
| 5 key | 50 lượt |
| 10 key | 100 lượt |
| 20 key | 200 lượt |

---

## 🏗️ Công nghệ sử dụng

- **Frontend:** React 18 + TypeScript + Vite
- **AI Models:** 
  - `gemini-3-flash-preview` — Phân tích cảm xúc & tuyển giọng
  - `gemini-3.1-flash-tts-preview` — Tạo giọng nói TTS
- **Styling:** Vanilla CSS + Glassmorphism design
- **Audio:** Web Audio API (24kHz PCM → WAV)
- **Storage:** localStorage (API keys, profiles, history)

---

## 📝 License

MIT License — Sử dụng tự do cho mục đích cá nhân và thương mại.

---

**Made with 💜 by GoVeoAi Team**
