/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Key, Save, CheckCircle, AlertTriangle, RotateCcw, Info, Eye, EyeOff, Plus } from 'lucide-react';
import { saveApiKeys, loadApiKeysRaw, getKeyStats, parseKeys } from '../apiKeyManager';
import { Language } from '../translations';

interface SettingsModalProps {
  onClose: () => void;
  language: Language;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, language }) => {
  const [rawKeys, setRawKeys] = useState(loadApiKeysRaw());
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const stats = getKeyStats();
  const parsedKeys = parseKeys(rawKeys);

  const isVi = language === 'vi';

  // Focus trap
  useEffect(() => {
    textareaRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        (e.shiftKey ? last : first).focus();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = () => {
    saveApiKeys(rawKeys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAddPlaceholder = () => {
    const current = rawKeys.trimEnd();
    setRawKeys(current ? current + '\n' : '');
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          textareaRef.current.value.length,
          textareaRef.current.value.length
        );
      }
    }, 50);
  };

  // Mask key for display
  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••••••' + key.slice(-4);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-900/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden animate-slide-up ring-1 ring-zinc-900/10 dark:ring-zinc-700"
      >
        {/* Header gradient */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-violet-50/60 to-white/0 dark:from-violet-900/20 dark:to-zinc-900/0 pointer-events-none" />

        <div className="relative p-7 sm:p-9">
          {/* Title row */}
          <div className="flex items-start justify-between mb-7">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-1">
                <Key size={18} />
                <span className="text-xs font-bold tracking-widest uppercase">
                  {isVi ? 'Cài đặt' : 'Settings'}
                </span>
              </div>
              <h2 id="settings-title" className="text-2xl font-serif font-medium text-zinc-900 dark:text-white">
                {isVi ? 'Quản lý API Keys' : 'API Key Management'}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {isVi
                  ? 'Nhập mỗi API key trên một dòng. Hệ thống tự động xoay vòng.'
                  : 'Enter one API key per line. The system rotates them automatically.'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              parsedKeys.length > 0
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            }`}>
              {parsedKeys.length > 0
                ? <CheckCircle size={12} />
                : <AlertTriangle size={12} />}
              {parsedKeys.length > 0
                ? `${parsedKeys.length} ${isVi ? 'key đã cấu hình' : 'keys configured'}`
                : (isVi ? 'Chưa có key nào' : 'No keys configured')}
            </div>

            {parsedKeys.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                <RotateCcw size={12} />
                {isVi ? `Xoay vòng: key #${stats.currentIndex + 1}` : `Rotating: key #${stats.currentIndex + 1}`}
              </div>
            )}
          </div>

          {/* Textarea */}
          <div className="relative mb-3">
            <div className="absolute right-3 top-3 flex gap-2 z-10">
              <button
                onClick={() => setShowKeys(!showKeys)}
                className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                title={isVi ? (showKeys ? 'Ẩn keys' : 'Hiện keys') : (showKeys ? 'Hide keys' : 'Show keys')}
              >
                {showKeys ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={showKeys ? rawKeys : parsedKeys.map(maskKey).join('\n')}
              onChange={(e) => {
                if (showKeys) setRawKeys(e.target.value);
              }}
              readOnly={!showKeys}
              spellCheck={false}
              placeholder={
                isVi
                  ? 'AIzaSy...\nAIzaSy...\nAIzaSy...'
                  : 'AIzaSy...\nAIzaSy...\nAIzaSy...'
              }
              className={`w-full h-44 font-mono text-xs leading-6 bg-zinc-50 dark:bg-zinc-800 border rounded-xl p-4 pr-12 text-zinc-800 dark:text-zinc-100 placeholder-zinc-300 dark:placeholder-zinc-600 resize-none transition-all outline-none focus:ring-2 ${
                showKeys
                  ? 'border-violet-300 dark:border-violet-700 focus:ring-violet-100 dark:focus:ring-violet-900/30'
                  : 'border-zinc-200 dark:border-zinc-700 cursor-not-allowed opacity-80'
              }`}
            />
          </div>

          {/* Key list preview (when hidden) */}
          {!showKeys && parsedKeys.length > 0 && (
            <div className="mb-4 space-y-1.5">
              {parsedKeys.map((key, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                    i === stats.currentIndex
                      ? 'bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300'
                      : 'bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                    i === stats.currentIndex
                      ? 'bg-violet-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="truncate flex-1">{maskKey(key)}</span>
                  {i === stats.currentIndex && (
                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-violet-500 dark:text-violet-400 flex items-center gap-1">
                      <RotateCcw size={9} />
                      {isVi ? 'Đang dùng' : 'Active'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info note */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900 mb-5 text-xs text-blue-700 dark:text-blue-300">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>
              {isVi
                ? 'Mỗi lần tạo giọng nói sẽ dùng key tiếp theo trong danh sách. Keys được lưu trong trình duyệt của bạn.'
                : 'Each voice generation uses the next key in the list. Keys are saved in your browser\'s local storage.'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddPlaceholder}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              title={isVi ? 'Thêm key mới' : 'Add new key'}
            >
              <Plus size={15} />
              {isVi ? 'Thêm key' : 'Add key'}
            </button>

            <button
              onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-md transform active:scale-95 ${
                saved
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-zinc-900 dark:bg-violet-600 hover:bg-violet-600 dark:hover:bg-violet-500 text-white hover:shadow-violet-500/25'
              }`}
            >
              {saved ? <CheckCircle size={16} /> : <Save size={16} />}
              {saved
                ? (isVi ? 'Đã lưu!' : 'Saved!')
                : (isVi ? 'Lưu cài đặt' : 'Save Settings')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
