/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'vi';

export interface Translations {
  appName: string;
  aiCasting: string;
  searchPlaceholder: string;
  allGenders: string;
  allPitches: string;
  carouselView: string;
  gridView: string;
  history: string;
  lightMode: string;
  darkMode: string;
  noVoicesFound: string;
  adjustFilters: string;
  openAiCasting: string;
  aiCastingTitle: string;
  aiCastingDescription: string;
  aiCastingPlaceholder: string;
  findMyVoice: string;
  analyzingRequest: string;
  historyTitle: string;
  clearHistory: string;
  noHistory: string;
  download: string;
  remove: string;
  close: string;
  gender: string;
  pitch: string;
  characteristics: string;
  previewVoice: string;
  stopPreview: string;
  recommendations: string;
  recommendedText: string;
  generateSpeech: string;
  generating: string;
  textToSpeech: string;
  inputPlaceholder: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "Gemini Voice Library",
    aiCasting: "AI Casting Director",
    searchPlaceholder: "Search...",
    allGenders: "All Genders",
    allPitches: "All Pitches",
    carouselView: "Carousel View",
    gridView: "Grid View",
    history: "History",
    lightMode: "Switch to Light Mode",
    darkMode: "Switch to Dark Mode",
    noVoicesFound: "No voices found",
    adjustFilters: "Try adjusting your filters or use AI Match.",
    openAiCasting: "Open AI Casting",
    aiCastingTitle: "AI Casting Director",
    aiCastingDescription: "Describe the voice you're looking for (e.g., 'A warm, mature female voice for a meditation app').",
    aiCastingPlaceholder: "I need a voice that sounds...",
    findMyVoice: "Find My Voice",
    analyzingRequest: "Analyzing your request...",
    historyTitle: "Generation History",
    clearHistory: "Clear All",
    noHistory: "No voice generations yet",
    download: "Download",
    remove: "Remove",
    close: "Close",
    gender: "Gender",
    pitch: "Pitch",
    characteristics: "Characteristics",
    previewVoice: "Preview Voice",
    stopPreview: "Stop",
    recommendations: "AI Recommendations",
    recommendedText: "Based on your request, here are the best matches from our library:",
    generateSpeech: "Generate Speech",
    generating: "Generating...",
    textToSpeech: "Text to Speech",
    inputPlaceholder: "Enter text to speak..."
  },
  vi: {
    appName: "Thư viện Giọng nói Gemini",
    aiCasting: "Đạo diễn Tuyển giọng AI",
    searchPlaceholder: "Tìm kiếm...",
    allGenders: "Tất cả Giới tính",
    allPitches: "Tất cả Cao độ",
    carouselView: "Chế độ Băng chuyền",
    gridView: "Chế độ Lưới",
    history: "Lịch sử",
    lightMode: "Chuyển sang Chế độ Sáng",
    darkMode: "Chuyển sang Chế độ Tối",
    noVoicesFound: "Không tìm thấy giọng nói",
    adjustFilters: "Hãy thử thay đổi bộ lọc hoặc sử dụng AI Match.",
    openAiCasting: "Mở Tuyển giọng AI",
    aiCastingTitle: "Đạo diễn Tuyển giọng AI",
    aiCastingDescription: "Mô tả giọng nói bạn đang tìm kiếm (ví dụ: 'Một giọng nữ ấm áp, trưởng thành cho ứng dụng thiền').",
    aiCastingPlaceholder: "Tôi cần một giọng nói nghe như...",
    findMyVoice: "Tìm giọng của tôi",
    analyzingRequest: "Đang phân tích yêu cầu...",
    historyTitle: "Lịch sử Tạo",
    clearHistory: "Xóa tất cả",
    noHistory: "Chưa có bản tạo giọng nói nào",
    download: "Tải xuống",
    remove: "Xóa",
    close: "Đóng",
    gender: "Giới tính",
    pitch: "Cao độ",
    characteristics: "Đặc điểm",
    previewVoice: "Nghe thử",
    stopPreview: "Dừng",
    recommendations: "Đề xuất từ AI",
    recommendedText: "Dựa trên yêu cầu của bạn, đây là những lựa chọn phù hợp nhất:",
    generateSpeech: "Tạo Lời nói",
    generating: "Đang tạo...",
    textToSpeech: "Chuyển văn bản thành lời nói",
    inputPlaceholder: "Nhập nội dung cần nói..."
  }
};
