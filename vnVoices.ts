/**
 * Vietnamese Voice Personas
 * Mapped to Gemini TTS built-in voices with Vietnamese style descriptions
 */

export interface VnVoice {
  name: string;
  gender: 'Nữ' | 'Nam';
  region?: string;
  geminiVoice: string;       // actual Gemini voice name
  description: string;
  systemHint: string;         // system prompt hint for persona
}

export const VN_VOICES: VnVoice[] = [
  // ========== GIỌNG NỮ ==========
  { name: 'Mai Linh (Miền Bắc)', gender: 'Nữ', region: 'Bắc', geminiVoice: 'Zephyr',
    description: 'Giọng nữ miền Bắc trong trẻo, dịu dàng, phát âm chuẩn.',
    systemHint: 'Speak with a clear, gentle Northern Vietnamese female voice. Articulate and warm.' },
  { name: 'Thảo Vy (Miền Nam)', gender: 'Nữ', region: 'Nam', geminiVoice: 'Kore',
    description: 'Giọng nữ miền Nam ngọt ngào, thân thiện, tự nhiên.',
    systemHint: 'Speak with a sweet, friendly Southern Vietnamese female voice. Natural and approachable.' },
  { name: 'Nữ Tướng Trưng Vương', gender: 'Nữ', geminiVoice: 'Aoede',
    description: 'Giọng uy nghiêm, mạnh mẽ, đầy khí phách nữ tướng.',
    systemHint: 'Speak with authority and strength like a legendary Vietnamese warrior queen. Commanding and powerful.' },
  { name: 'Mẫu Nghi Thiên Hạ', gender: 'Nữ', geminiVoice: 'Leda',
    description: 'Giọng quý phái, đoan trang, mẫu mực hoàng hậu.',
    systemHint: 'Speak with royal elegance and grace like a Vietnamese empress. Refined and dignified.' },
  { name: 'Tiên Nữ Giáng Trần', gender: 'Nữ', geminiVoice: 'Achernar',
    description: 'Giọng thanh thoát, nhẹ nhàng, êm ái như tiên giáng trần.',
    systemHint: 'Speak with ethereal, gentle, airy tones like a celestial fairy descending to earth. Soft and dreamy.' },
  { name: 'Nữ Sĩ Cung Đình', gender: 'Nữ', geminiVoice: 'Erinome',
    description: 'Giọng trau chuốt, thanh lịch, uyên bác kiểu nữ sĩ.',
    systemHint: 'Speak with intellectual elegance and refined articulation like a court poetess. Sophisticated and cultured.' },
  { name: 'Cô Tấm (Kể chuyện)', gender: 'Nữ', geminiVoice: 'Callirrhoe',
    description: 'Giọng hiền hậu, nhẹ nhàng, lôi cuốn khi kể chuyện cổ tích.',
    systemHint: 'Speak with gentle kindness, perfect for storytelling Vietnamese fairy tales. Warm and captivating.' },
  { name: 'Bà Kể Chuyện Xưa', gender: 'Nữ', geminiVoice: 'Gacrux',
    description: 'Giọng trầm ấm, từ tốn, đậm chất bà nội kể chuyện.',
    systemHint: 'Speak with a warm, mature, grandmother-like voice telling old stories. Slow, soothing, nostalgic.' },
  { name: 'Công Chúa Kiều Sa', gender: 'Nữ', geminiVoice: 'Despina',
    description: 'Giọng trong sáng, tươi vui, trẻ trung kiểu công chúa.',
    systemHint: 'Speak with a bright, cheerful, youthful princess-like voice. Playful and charming.' },
  { name: 'Thôn Nữ Dân Dã', gender: 'Nữ', geminiVoice: 'Vindemiatrix',
    description: 'Giọng mộc mạc, chất phác, chân thành miền quê.',
    systemHint: 'Speak with a simple, sincere, down-to-earth rural Vietnamese girl voice. Honest and natural.' },
  { name: 'Ca Nương Phố Cổ', gender: 'Nữ', geminiVoice: 'Sulafat',
    description: 'Giọng ngân nga, trầm bổng, mượt mà ca nương.',
    systemHint: 'Speak with a melodious, singing quality like a traditional Vietnamese songstress. Musical and smooth.' },
  { name: 'Nữ Hiệp Giang Hồ', gender: 'Nữ', geminiVoice: 'Laomedeia',
    description: 'Giọng dứt khoát, lanh lợi, đầy nghĩa khí giang hồ.',
    systemHint: 'Speak with a decisive, sharp, spirited voice like a female martial arts heroine. Bold and adventurous.' },

  // ========== GIỌNG NAM ==========
  { name: 'Minh Quang (Miền Bắc)', gender: 'Nam', region: 'Bắc', geminiVoice: 'Puck',
    description: 'Giọng nam miền Bắc rõ ràng, trẻ trung, năng động.',
    systemHint: 'Speak with a clear, youthful, energetic Northern Vietnamese male voice.' },
  { name: 'Hoàng Dũng (Miền Nam)', gender: 'Nam', region: 'Nam', geminiVoice: 'Fenrir',
    description: 'Giọng nam miền Nam ấm áp, thân thiện, phóng khoáng.',
    systemHint: 'Speak with a warm, friendly, easygoing Southern Vietnamese male voice.' },
  { name: 'Bảo Long (Miền Bắc)', gender: 'Nam', region: 'Bắc', geminiVoice: 'Orus',
    description: 'Giọng nam trầm vừa, chuyên nghiệp, phát thanh viên.',
    systemHint: 'Speak with a professional, broadcast-quality Northern Vietnamese male voice. Clear and authoritative.' },
  { name: 'Lão Tướng Bạch Đằng', gender: 'Nam', geminiVoice: 'Charon',
    description: 'Giọng trầm hùng, uy nghiêm, oai phong tướng lĩnh.',
    systemHint: 'Speak with a deep, commanding, majestic military general voice. Powerful and dignified.' },
  { name: 'Hào Kiệt Lam Sơn', gender: 'Nam', geminiVoice: 'Achird',
    description: 'Giọng trầm, hào hùng, vang vọng như hùng trắng trận.',
    systemHint: 'Speak with a heroic, resonant, battle-ready voice like a Vietnamese warrior hero. Inspiring and brave.' },
  { name: 'Quân Vương Thăng Long', gender: 'Nam', geminiVoice: 'Iapetus',
    description: 'Giọng uy nghi, trầm ổn, đầy uy quyền của vương.',
    systemHint: 'Speak with regal authority and gravitas like a Vietnamese emperor. Calm, powerful, commanding.' },
  { name: 'Sử Gia Đại Việt', gender: 'Nam', geminiVoice: 'Sadaltager',
    description: 'Giọng từ tốn, uyên bác, chậm rãi kể lịch sử.',
    systemHint: 'Speak with scholarly wisdom, slowly and thoughtfully like a Vietnamese historian. Erudite and patient.' },
  { name: 'Tiểu Tướng Tiên Phong', gender: 'Nam', geminiVoice: 'Alnilam',
    description: 'Giọng trẻ, sắc bén, nhiệt huyết thanh niên xung trận.',
    systemHint: 'Speak with youthful energy and sharpness like a young vanguard commander. Enthusiastic and bold.' },
  { name: 'Đạo Sĩ Ẩn Danh', gender: 'Nam', geminiVoice: 'Zubenelgenubi',
    description: 'Giọng trầm sâu, bí ẩn, thâm trầm đạo sĩ ẩn dật.',
    systemHint: 'Speak with deep, mysterious, contemplative tones like a reclusive sage. Low, wise, enigmatic.' },
  { name: 'Thuyết Khách Mưu Sĩ', gender: 'Nam', geminiVoice: 'Algieba',
    description: 'Giọng mượt mà, thuyết phục, trôi chảy kiểu quân sư.',
    systemHint: 'Speak with smooth persuasion and flowing eloquence like a cunning strategist. Convincing and articulate.' },
  { name: 'Vũ Tướng Hổ Ba Lửa', gender: 'Nam', geminiVoice: 'Enceladus',
    description: 'Giọng mạnh mẽ, đầy năng lượng, bùng cháy nhiệt huyết.',
    systemHint: 'Speak with fierce energy and burning passion like a fiery warrior general. Intense and powerful.' },
  { name: 'Thư Sinh Nhà Nho', gender: 'Nam', geminiVoice: 'Rasalgethi',
    description: 'Giọng thanh nhã, nhẹ nhàng, lễ phép kiểu thư sinh.',
    systemHint: 'Speak with refined gentleness and courtesy like a young Confucian scholar. Polite and cultured.' },
  { name: 'Ngự Tiều Canh Mục', gender: 'Nam', geminiVoice: 'Umbriel',
    description: 'Giọng mộc mạc, bình dị, đời thường ngư tiều.',
    systemHint: 'Speak with simple, down-to-earth, everyday tones like a humble fisherman-woodcutter. Natural and rustic.' },
];
