/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Play, Pause, Trash2, Clock, Volume2 } from 'lucide-react';
import { Generation } from '../types';
import { Language, translations } from '../translations';

interface HistorySidebarProps {
  generations: Generation[];
  onClear: () => void;
  onRemove: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ generations, onClear, onRemove, isOpen, onClose, language }) => {
  const t = translations[language];
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const decodeBase64 = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setPlayingId(null);
  };

  const playAudio = async (generation: Generation) => {
    if (playingId === generation.id) {
      stopAudio();
      return;
    }

    stopAudio();
    setPlayingId(generation.id);

    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const rawBytes = decodeBase64(generation.audioData);
      const audioBuffer = await decodeAudioData(rawBytes, audioContextRef.current);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setPlayingId(null);
      
      sourceNodeRef.current = source;
      source.start();
    } catch (err) {
      console.error("Playback error:", err);
      setPlayingId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl z-[80] flex flex-col border-l border-zinc-200 dark:border-zinc-800"
          >
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
                  <History size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{t.historyTitle}</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{language === 'vi' ? 'Chỉ áp dụng cho phiên này' : 'Session generations only'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {generations.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-zinc-100 dark:border-zinc-800">
                    <Volume2 size={32} className="text-zinc-200 dark:text-zinc-700" />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-1">{t.noHistory}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{language === 'vi' ? 'Giọng nói bạn tạo sẽ xuất hiện ở đây.' : 'Your generated audio will appear here.'}</p>
                </div>
              ) : (
                generations.slice().reverse().map((gen) => (
                  <div
                    key={gen.id}
                    className="group bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 transition-all hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            {gen.voiceName}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(gen.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 italic">
                          "{gen.text}"
                        </p>
                      </div>
                      <button
                        onClick={() => onRemove(gen.id)}
                        className="p-1.5 text-zinc-300 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        title={t.remove}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => playAudio(gen)}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                        playingId === gen.id
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                          : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {playingId === gen.id ? (
                        <>
                          <Pause size={14} fill="currentColor" />
                          <span>{t.stopPreview}</span>
                        </>
                      ) : (
                        <>
                          <Play size={14} fill="currentColor" />
                          <span>{language === 'vi' ? 'Nghe lại' : 'Listen Again'}</span>
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>

            {generations.length > 0 && (
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={onClear}
                  className="w-full py-2.5 text-xs font-bold text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors uppercase tracking-widest"
                >
                  {t.clearHistory}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistorySidebar;
