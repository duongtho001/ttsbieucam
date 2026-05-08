/**
 * SRT Studio Panel — Upload SRT, dịch, tạo audio từng đoạn
 */
import React, { useState, useRef } from 'react';
import { Upload, Globe, Play, Download, Loader2, Trash2, CheckCircle, AlertCircle, Languages, Volume2 } from 'lucide-react';
import { parseSrt, SrtEntry, entriesToSrt, downloadText } from '../srtParser';
import { GoogleGenAI, Modality } from '@google/genai';
import { getNextApiKey, getNextApiKeyExcluding } from '../apiKeyManager';
import { buildTTSPrompt } from '../promptBuilder';
import { VN_VOICES } from '../vnVoices';
import { VOICE_DATA, SUPPORTED_LANGUAGES } from '../constants';

// WAV helpers
function b64d(b:string){const s=atob(b),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a}
function toWav(p:Uint8Array){const b=new ArrayBuffer(44+p.length),v=new DataView(b),w=(o:number,s:string)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+p.length,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,24000,true);v.setUint32(28,48000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,p.length,true);new Uint8Array(b).set(p,44);return new Blob([b],{type:'audio/wav'})}

interface SrtSegment extends SrtEntry {
  translated?: string;
  audioBlob?: Blob;
  audioUrl?: string;
  status: 'idle' | 'translating' | 'generating' | 'done' | 'error';
  error?: string;
}

interface Props {
  voiceName: string;
  voiceMode: 'international' | 'vietnamese';
  lang: string;
}

export default function SrtPanel({ voiceName, voiceMode, lang }: Props) {
  const [segments, setSegments] = useState<SrtSegment[]>([]);
  const [fileName, setFileName] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [translating, setTranslating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  // Upload SRT/TXT
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      let entries: SrtEntry[];
      if (file.name.endsWith('.srt')) {
        entries = parseSrt(content);
      } else {
        // TXT: split by double newline or line
        const lines = content.split(/\n\s*\n/).filter(l => l.trim());
        entries = lines.map((text, i) => ({
          index: i + 1,
          startTime: '00:00:00,000',
          endTime: '00:00:00,000',
          startMs: 0, endMs: 0,
          text: text.trim(),
        }));
      }
      setSegments(entries.map(e => ({ ...e, status: 'idle' })));
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  // Translate all segments
  const translateAll = async () => {
    const apiKey = getNextApiKey();
    if (!apiKey) { alert('Chưa có API key!'); return; }
    setTranslating(true);
    const langName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      setSegments(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'translating' } : s));
      try {
        const ai = new GoogleGenAI({ apiKey });
        const res = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `Translate this text to ${langName}. Return ONLY the translated text, nothing else:\n\n${seg.text}`,
        });
        const translated = res.text?.trim() || seg.text;
        setSegments(prev => prev.map((s, idx) => idx === i ? { ...s, translated, status: 'idle' } : s));
      } catch (err: any) {
        setSegments(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'error', error: err.message } : s));
      }
    }
    setTranslating(false);
  };

  // Generate audio for one segment
  const generateOne = async (index: number): Promise<boolean> => {
    const seg = segments[index];
    const textToSpeak = seg.translated || seg.text;
    let apiKey = getNextApiKey();
    if (!apiKey) return false;

    setSegments(prev => prev.map((s, i) => i === index ? { ...s, status: 'generating' } : s));

    // Build voice config
    let geminiVoice = 'Kore';
    if (voiceMode === 'vietnamese') {
      const vn = VN_VOICES.find(v => v.name === voiceName);
      if (vn) geminiVoice = vn.geminiVoice;
    } else {
      const intl = VOICE_DATA.find(v => v.name === voiceName);
      if (intl) geminiVoice = intl.name;
    }

    const prompt = buildTTSPrompt({ voiceMode, voiceName, geminiVoice, lang: seg.translated ? targetLang : lang, text: textToSpeak });

    const maxRetries = 3;
    const excludeKeys: string[] = [];
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-tts',
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: geminiVoice } } },
          },
        });
        const part = res.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData?.data) {
          const pcm = b64d(part.inlineData.data);
          const blob = toWav(pcm);
          const url = URL.createObjectURL(blob);
          setSegments(prev => prev.map((s, i) => i === index ? { ...s, audioBlob: blob, audioUrl: url, status: 'done' } : s));
          return true;
        }
        throw new Error('Không nhận được audio');
      } catch (err: any) {
        if (err.message?.includes('429') || err.message?.includes('quota')) {
          excludeKeys.push(apiKey);
          apiKey = getNextApiKeyExcluding(excludeKeys) || apiKey;
          continue;
        }
        setSegments(prev => prev.map((s, i) => i === index ? { ...s, status: 'error', error: err.message } : s));
        return false;
      }
    }
    return false;
  };

  // Generate all
  const generateAll = async () => {
    setGenerating(true);
    const total = segments.filter(s => s.status !== 'done').length;
    setProgress({ done: 0, total });
    let done = 0;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].status === 'done') continue;
      await generateOne(i);
      done++;
      setProgress({ done, total });
    }
    setGenerating(false);
  };

  // Download one
  const downloadOne = (seg: SrtSegment) => {
    if (!seg.audioBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(seg.audioBlob);
    a.download = `segment_${seg.index}.wav`;
    a.click();
  };

  // Download all as zip (simple: download each)
  const downloadAll = () => {
    segments.forEach(seg => { if (seg.audioBlob) downloadOne(seg); });
  };

  // Download translated SRT
  const downloadTranslatedSrt = () => {
    const translated = segments.map(s => ({
      ...s,
      text: s.translated || s.text,
    }));
    downloadText(entriesToSrt(translated), fileName.replace('.srt', `_${targetLang}.srt`));
  };

  const doneCount = segments.filter(s => s.status === 'done').length;
  const hasTranslated = segments.some(s => s.translated);

  if (segments.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{background:'rgba(96,165,250,0.12)'}}>
          <Upload size={28} style={{color:'#60a5fa'}}/>
        </div>
        <h3 className="text-sm font-bold text-white mb-2">Tải file SRT hoặc TXT</h3>
        <p className="text-xs mb-4" style={{color:'var(--text-muted)'}}>
          Upload file phụ đề .srt hoặc .txt để tạo giọng đọc từng đoạn.<br/>
          Hỗ trợ dịch sang ngôn ngữ khác trước khi tạo audio.
        </p>
        <label className="btn-file-upload cursor-pointer" style={{fontSize:14,padding:'10px 24px'}}>
          <Upload size={16}/> Chọn file SRT/TXT
          <input ref={fileRef} type="file" accept=".srt,.txt" onChange={handleUpload} className="hidden"/>
        </label>
      </div>
    );
  }

  return (
    <div className="glass-panel flex flex-col overflow-hidden" style={{maxHeight:'100%'}}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b flex-wrap gap-2" style={{borderColor:'var(--border)'}}>
        <div className="flex items-center gap-2">
          <Upload size={14} style={{color:'#60a5fa'}}/>
          <span className="text-xs font-bold text-white">{fileName}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:'rgba(96,165,250,0.15)',color:'#60a5fa'}}>{segments.length} đoạn</span>
          {doneCount > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{background:'rgba(52,211,153,0.15)',color:'#34d399'}}>✓ {doneCount} audio</span>}
        </div>
        <div className="flex items-center gap-2">
          <label className="btn-file-upload cursor-pointer" style={{fontSize:11,padding:'4px 10px'}}>
            <Upload size={10}/> Đổi file
            <input type="file" accept=".srt,.txt" onChange={handleUpload} className="hidden"/>
          </label>
          <button onClick={()=>{setSegments([]);setFileName('');}} className="text-[10px] px-2 py-1 rounded-lg" style={{color:'#f87171',background:'rgba(239,68,68,0.1)'}}>
            <Trash2 size={10} style={{display:'inline',marginRight:3}}/>Xóa
          </button>
        </div>
      </div>

      {/* Translation bar */}
      <div className="px-4 py-2 flex items-center gap-2 flex-wrap border-b" style={{borderColor:'var(--border)',background:'rgba(255,255,255,0.02)'}}>
        <Languages size={13} style={{color:'#f472b6'}}/>
        <span className="text-[10px] font-semibold" style={{color:'var(--text-muted)'}}>Dịch sang:</span>
        <select value={targetLang} onChange={e=>setTargetLang(e.target.value)}
          className="text-[11px] px-2 py-1 rounded-lg" style={{background:'rgba(255,255,255,0.08)',border:'1px solid var(--border)',color:'var(--text-primary)',outline:'none'}}>
          {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
        <button onClick={translateAll} disabled={translating} className="text-[11px] px-3 py-1 rounded-lg font-semibold flex items-center gap-1"
          style={{background:'rgba(244,114,182,0.12)',border:'1px solid rgba(244,114,182,0.25)',color:'#f472b6'}}>
          {translating ? <Loader2 size={11} className="animate-spin"/> : <Globe size={11}/>}
          {translating ? 'Đang dịch...' : '🌐 Dịch tất cả'}
        </button>
        {hasTranslated && (
          <button onClick={downloadTranslatedSrt} className="text-[11px] px-3 py-1 rounded-lg font-semibold flex items-center gap-1"
            style={{background:'rgba(52,211,153,0.12)',border:'1px solid rgba(52,211,153,0.25)',color:'#34d399'}}>
            <Download size={11}/> Tải SRT đã dịch
          </button>
        )}
      </div>

      {/* Generate bar */}
      <div className="px-4 py-2 flex items-center gap-2 flex-wrap border-b" style={{borderColor:'var(--border)',background:'rgba(255,255,255,0.02)'}}>
        <button onClick={generateAll} disabled={generating} className="text-[11px] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
          style={{background:'linear-gradient(135deg,#7c3aed,#6366f1)',color:'white',border:'none'}}>
          {generating ? <Loader2 size={12} className="animate-spin"/> : <Volume2 size={12}/>}
          {generating ? `Đang tạo ${progress.done}/${progress.total}...` : `🎙️ Tạo audio tất cả (${segments.length} đoạn)`}
        </button>
        {doneCount > 0 && (
          <button onClick={downloadAll} className="text-[11px] px-3 py-1 rounded-lg font-semibold flex items-center gap-1"
            style={{background:'rgba(52,211,153,0.12)',border:'1px solid rgba(52,211,153,0.25)',color:'#34d399'}}>
            <Download size={11}/> Tải {doneCount} audio
          </button>
        )}
      </div>

      {/* Segments list */}
      <div className="flex-1 overflow-y-auto custom-scroll">
        {segments.map((seg, i) => (
          <div key={seg.index} className="px-4 py-2.5 border-b flex items-start gap-3 hover:bg-white/[0.02] transition-colors" style={{borderColor:'rgba(255,255,255,0.04)'}}>
            {/* Index */}
            <span className="text-[10px] font-bold mt-1 shrink-0 w-6 text-center rounded" style={{color:'var(--text-muted)',background:'rgba(255,255,255,0.05)',padding:'2px 0'}}>{seg.index}</span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-relaxed" style={{color:'var(--text-primary)'}}>{seg.text}</p>
              {seg.translated && (
                <p className="text-xs leading-relaxed mt-1" style={{color:'#60a5fa'}}>
                  → {seg.translated}
                </p>
              )}
              {seg.error && <p className="text-[10px] mt-1" style={{color:'#f87171'}}>⚠ {seg.error}</p>}
            </div>

            {/* Status & actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {seg.status === 'translating' && <Loader2 size={13} className="animate-spin" style={{color:'#f472b6'}}/>}
              {seg.status === 'generating' && <Loader2 size={13} className="animate-spin" style={{color:'#a78bfa'}}/>}
              {seg.status === 'done' && <CheckCircle size={13} style={{color:'#34d399'}}/>}
              {seg.status === 'error' && <AlertCircle size={13} style={{color:'#f87171'}}/>}

              {seg.audioUrl && (
                <>
                  <button onClick={()=>{const a=new Audio(seg.audioUrl);a.play()}} className="p-1.5 rounded-lg hover:bg-white/10" title="Nghe">
                    <Play size={12} style={{color:'#a78bfa'}}/>
                  </button>
                  <button onClick={()=>downloadOne(seg)} className="p-1.5 rounded-lg hover:bg-white/10" title="Tải">
                    <Download size={12} style={{color:'#34d399'}}/>
                  </button>
                </>
              )}

              {seg.status === 'idle' && !seg.audioUrl && (
                <button onClick={()=>generateOne(i)} className="p-1.5 rounded-lg hover:bg-white/10" title="Tạo audio">
                  <Volume2 size={12} style={{color:'var(--text-muted)'}}/>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
