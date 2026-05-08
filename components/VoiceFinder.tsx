/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { getNextApiKey } from '../apiKeyManager';
import { Sparkles, Loader2, X, ArrowRight, Wand2, Languages } from 'lucide-react';
import { Voice, AiRecommendation } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';
import { Language, translations } from '../translations';

interface VoiceFinderProps {
  voices: Voice[];
  onRecommendation: (rec: AiRecommendation | null) => void;
  onClose: () => void;
  language: Language;
}

const VoiceFinder: React.FC<VoiceFinderProps> = ({ voices, onRecommendation, onClose, language }) => {
  const t = translations[language];
  const [query, setQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(language === 'vi' ? 'vi' : 'en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap implementation
  useEffect(() => {
    textAreaRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      if (!modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const examples = language === 'vi' ? [
    { label: "Nam giọng Trầm", text: "Một giọng nam trầm ấm, chuyên nghiệp cho bài thuyết trình doanh nghiệp." },
    { label: "Nữ giọng Trẻ", text: "Một giọng nữ trẻ trung, năng động và vui vẻ cho quảng cáo sản phẩm mới." }
  ] : [
    { label: "Irish male", text: "A high pitch male with a strong Irish accent." },
    { label: "Singaporean female", text: "An energetic Singaporean female with a strong Singlish accent." }
  ];

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const apiKey = getNextApiKey();
      if (!apiKey) {
        setError(language === 'vi'
          ? 'Chưa cấu hình API key. Vui lòng vào Cài đặt để thêm key.'
          : 'No API key configured. Please open Settings to add your API keys.');
        setLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const simplifiedVoices = voices.map(v => ({
        name: v.name,
        gender: v.analysis.gender,
        pitch: v.analysis.pitch,
        characteristics: v.analysis.characteristics,
      }));

      const languageName = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name || 'English';

      const prompt = `
        You are an expert voice casting director for the Gemini Native Audio Generation TTS model.
        
        Available Voices Data:
        ${JSON.stringify(simplifiedVoices)}

        User Request: "${query}" (The user may have provided this in ${language === 'vi' ? 'Vietnamese' : 'English'})
        Target Language for Transcript: ${languageName} (${selectedLanguage})

        IMPORTANT: any voice can do any accent by simply prompting for it in the director's note.

        Task:
        1. Select the top 3 voices from the available list that best match the user's request.
        2. Create a detailed System Instruction that defines the persona/character using the following structure:

        # AUDIO PROFILE: [Character Name]
        ## "[Archetype/Role]"
        
        ## THE SCENE: [Location/Setting]
        [Describe the physical environment, mood, and vibe. Explain what is happening around the character.]
        
        ### DIRECTOR'S NOTES
        Style: [Describe the tone, dynamics, and emotional delivery. Use industry terms like "vocal smile" if appropriate.]
        Pace: [Describe the overall tempo and variation.]
        Accent: [Be specific, e.g., "British English accent" or "Vietnamese accent".]
        
        ### SAMPLE CONTEXT
        [Gives the model a contextual starting point so the actor enters the scene naturally.]

        #### TRANSCRIPT
        [Write a 2-3 sentence transcript in ${languageName} that aligns with the persona and scene. Use audio tags in square brackets like [whispers], [shouting], [excitedly], [sighs], [laughs] to guide the delivery. IMPORTANT: Use English for the audio tags even if the transcript is in ${languageName}.]

        3. Return the recommended voices, the full system instruction (including the transcript), and just the transcript text separately for the preview.

        Guidelines for the prompt:
        - Audio Profile: Give the character a name.
        - Scene: Establish the "vibe" and environmental context.
        - Director's Notes: Focus on Style, Pacing, and Accent. Don't overspecify.
        - Transcript: Ensure it correlates to the directions. Use English audio tags even if the transcript is another language.
        - sampleText: This MUST be the exact same transcript as in the #### TRANSCRIPT section, including all audio tags in square brackets.
        - Language: ALL sections (Audio Profile, Scene, Director's Notes, Sample Context) MUST be in English EXCEPT for the TRANSCRIPT which MUST be in ${languageName}.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedVoices: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of exactly 3 voice names"
              },
              systemInstruction: {
                type: Type.STRING,
                description: "System prompt. Formatted as Markdown with newlines."
              },
              sampleText: {
                type: Type.STRING,
                description: "Sample text"
              }
            }
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      if (result.recommendedVoices && result.recommendedVoices.length > 0) {
        onRecommendation({
          voiceNames: result.recommendedVoices,
          systemInstruction: result.systemInstruction,
          sampleText: result.sampleText
        });
      } else {
        setError(language === 'vi' ? "Không tìm thấy giọng nói phù hợp." : "No matching voices found.");
      }

    } catch (err) {
      console.error("AI Error:", err);
      setError(language === 'vi' ? "Phân tích thất bại. Vui lòng thử lại." : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="casting-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div ref={modalRef} className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden animate-slide-up ring-1 ring-zinc-900/5">
        
        {/* Decorative Header Background */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-50/50 to-white/0 dark:from-indigo-900/30 dark:to-zinc-900/0 pointer-events-none"></div>

        <div className="relative p-8 sm:p-10">
          <div className="flex justify-between items-start mb-8">
             <div className="space-y-3 flex-1 mr-4">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                    <Wand2 size={20} />
                    <span className="text-sm font-bold tracking-wider uppercase">{t.aiCastingTitle}</span>
                </div>
                <h2 id="casting-title" className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-zinc-900 dark:text-white">{language === 'vi' ? "Mô tả nhân vật của bạn." : "Describe your character."}</h2>
                <p className="text-lg text-zinc-500 dark:text-zinc-400 font-light">{language === 'vi' ? "Gemini sẽ phân tích thư viện và tìm người phù hợp nhất." : "Gemini will analyze the library and find the perfect match."}</p>
             </div>
             <button 
               onClick={onClose}
               className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
               aria-label="Close"
             >
               <X size={20} />
             </button>
          </div>

          <div className="relative group">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                <div className="flex-1 relative w-full">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
                        <Languages size={18} />
                    </div>
                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-300 dark:focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer"
                        disabled={loading}
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {language === 'vi' ? (lang.name === 'English' ? 'Tiếng Anh' : lang.name === 'Vietnamese' ? 'Tiếng Việt' : lang.name) : lang.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
                        <ArrowRight size={14} className="rotate-90" />
                    </div>
                </div>
                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest sm:whitespace-nowrap">
                    {language === 'vi' ? 'Ngôn ngữ kịch bản' : 'Transcript Language'}
                </div>
            </div>

            <textarea
              ref={textAreaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.aiCastingPlaceholder}
              className="w-full h-32 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 text-xl font-sans text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-600 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-300 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-zinc-900 resize-none transition-all leading-relaxed"
              disabled={loading}
            />

            {/* Examples */}
            <div className="flex flex-wrap items-center gap-2 mt-3 px-1">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                    {language === 'vi' ? 'Gợi ý:' : 'Try:'}
                </span>
                {examples.map((ex) => (
                    <button
                        key={ex.label}
                        onClick={() => {
                            setQuery(ex.text);
                            textAreaRef.current?.focus();
                        }}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                    >
                        {ex.label}
                    </button>
                ))}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-4">
              <span className="text-zinc-400 dark:text-zinc-500 text-sm font-medium flex items-center gap-2">
                  {error ? (
                    <span className="text-red-500 dark:text-red-400 flex items-center gap-1"><X size={14}/> {error}</span>
                  ) : (
                    <>Powered by <span className="text-indigo-500 dark:text-indigo-400">Gemini 3 Flash Preview</span></>
                  )}
              </span>
              
              <button
                onClick={handleAnalyze}
                disabled={loading || !query.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 pl-6 pr-6 py-3 bg-zinc-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-full transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-indigo-500/25 dark:shadow-indigo-900/25"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                <span>{loading ? t.analyzingRequest : t.findMyVoice}</span>
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        {loading && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-800">
                <div className="h-full bg-indigo-600 dark:bg-indigo-500 animate-google-colors"></div>
            </div>
        )}

      </div>
    </div>
  );
};

export default VoiceFinder;