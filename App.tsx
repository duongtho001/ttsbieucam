import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from './authContext';
import { navigate } from './router';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, Settings, Play, Square, Download, Loader2, History, Trash2, ChevronDown, Volume2, AlertCircle, Clock, X, Sparkles, Gauge, Music, Save, FolderOpen, Upload, Menu, HelpCircle, BookOpen, Key, FileText, Palette, Globe } from 'lucide-react';
import { parseSrt } from './srtParser';
import { VOICE_DATA, SUPPORTED_LANGUAGES } from './constants';
import { VN_VOICES, VnVoice } from './vnVoices';
import { Generation } from './types';
import { getNextApiKey, getNextApiKeyExcluding, loadApiKeys } from './apiKeyManager';
import SettingsModal from './components/SettingsModal';
import AudioVisualizer from './components/AudioVisualizer';
import { buildTTSPrompt } from './promptBuilder';
import { getVoiceCatalogText } from './voiceCatalog';
import { SavedProfile, loadSavedProfiles, saveProfile, deleteProfile } from './profileManager';
import SrtPanel from './components/SrtPanel';

const TAGS = ['excitedly','whispers','shouting','sighs','laughs','gasp','amazed','curious','sarcastic','serious','panicked','cheerfully','sadly'];

function b64d(b:string){const s=atob(b),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a}
function toWav(p:Uint8Array){const b=new ArrayBuffer(44+p.length),v=new DataView(b),w=(o:number,s:string)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+p.length,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,24000,true);v.setUint32(28,48000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,p.length,true);new Uint8Array(b).set(p,44);return new Blob([b],{type:'audio/wav'})}

type VoiceMode = 'international' | 'vietnamese';

const App: React.FC = () => {
  const auth = useAuth();
  const user = auth?.user || null;
  const logout = auth?.logout || (() => {});
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [keyCount, setKeyCount] = useState(()=>loadApiKeys().length);
  const [studioTab, setStudioTab] = useState<'text'|'srt'>('text');
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('vietnamese');
  const [voice, setVoice] = useState(VN_VOICES[0].name);
  const [tLang, setTLang] = useState('vi');
  const [text, setText] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [lastAudio, setLastAudio] = useState<string|null>(null);
  const [gens, setGens] = useState<Generation[]>([]);
  const [gFilter, setGFilter] = useState('All');
  const [audioProfile, setAudioProfile] = useState<string>('');
  const [taggedText, setTaggedText] = useState<string>('');  // AI emotion tags — hidden from user
  const [showProfile, setShowProfile] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>(()=>loadSavedProfiles());
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const tRef = useRef<HTMLTextAreaElement>(null);
  const ctxRef = useRef<AudioContext|null>(null);
  const srcRef = useRef<AudioBufferSourceNode|null>(null);

  const insertTag = (tag:string) => {
    const el=tRef.current;if(!el)return;
    const s=el.selectionStart,e=el.selectionEnd;
    setText(text.slice(0,s)+`[${tag}] `+text.slice(e));
    setTimeout(()=>{el.focus();const p=s+tag.length+3;el.setSelectionRange(p,p)},0);
  };

  const stop = useCallback(()=>{try{srcRef.current?.stop()}catch{}srcRef.current=null;setPlaying(false)},[]);

  const getVoiceConfig = ():{geminiVoice:string, sysHint:string} => {
    if(voiceMode==='vietnamese'){
      const vn = VN_VOICES.find(v=>v.name===voice);
      return vn ? {geminiVoice:vn.geminiVoice, sysHint:vn.systemHint} : {geminiVoice:'Puck',sysHint:''};
    }
    return {geminiVoice:voice, sysHint:''};
  };

  // AI Đạo diễn — Phân tích text + Chọn giọng + Tạo Audio Profile
  const analyzeEmotion = async () => {
    if(!text.trim())return;
    const key=getNextApiKey();
    if(!key){setError('Chưa có API key — mở Cài đặt.');return}
    setAnalyzing(true);setError(null);
    try {
      const ai=new GoogleGenAI({apiKey:key});
      const ln = SUPPORTED_LANGUAGES.find(l=>l.code===tLang)?.name||'Vietnamese';
      const catalog = getVoiceCatalogText();

      const promptLines = [
        'You are an expert voice casting director for the Gemini Native Audio TTS model.',
        '',
        'TASK: Read the text below, browse the VOICE LIBRARY, and:',
        '1. Pick the BEST matching voice from the library',
        '2. Create a complete AUDIO PROFILE for TTS generation',
        '',
        catalog,
        '',
        '=== TARGET TEXT ===',
        'Language: ' + ln,
        text,
        '',
        '=== OUTPUT FORMAT ===',
        'Return EXACTLY this structure (nothing else):',
        '',
        'RECOMMENDED_VOICE: [exact voice name from library, e.g. "Đạo Sĩ Ẩn Danh" or "Charon"]',
        'VOICE_MODE: [vietnamese or international]',
        '',
        '# AUDIO PROFILE: [Character Name]',
        '## "[Archetype/Role]"',
        '',
        '## THE SCENE: [Location/Setting]',
        '[Describe environment, mood, vibe. 2-3 sentences.]',
        '',
        "### DIRECTOR'S NOTES",
        'Style: [Tone, dynamics, emotional delivery instructions]',
        'Pace: [Tempo and variation]',
        'Accent: [Be specific]',
        '',
        '### SAMPLE CONTEXT',
        '[1-2 sentences of context for the voice actor]',
        '',
        '#### TRANSCRIPT',
        '[Original text WITH emotion tags inserted: [whispers], [excitedly], [sighs], [laughs], [shouting], [gasp], [amazed], [curious], [sarcastic], [serious], [panicked], [cheerfully], [sadly], [low voice], [softly], [pauses]. Tags in English, text in ' + ln + '.]',
        '',
        'RULES:',
        '- RECOMMENDED_VOICE must be an EXACT name from the voice library above',
        '- ALL sections in English EXCEPT TRANSCRIPT in ' + ln,
        '- Do NOT change original text content, only ADD emotion tags',
        '- Choose voice that best matches the text mood, gender, and style',
      ];

      const r=await ai.models.generateContent({
        model:'gemini-3-flash-preview',
        contents: promptLines.join(String.fromCharCode(10)),
        config:{responseMimeType:'text/plain'}
      });
      const result = r.text?.trim();
      console.log('[AI Director] Raw result:', result);

      if(result) {
        // Extract recommended voice
        const voiceMatch = result.match(/RECOMMENDED_VOICE:\s*(.+)/i);
        const modeMatch = result.match(/VOICE_MODE:\s*(vietnamese|international)/i);
        const recommendedVoice = voiceMatch ? voiceMatch[1].trim().replace(/^["']|["']$/g, '') : null;
        const recommendedMode = modeMatch ? modeMatch[1].trim() as 'vietnamese' | 'international' : null;

        console.log('[AI Director] Recommended voice:', recommendedVoice);
        console.log('[AI Director] Recommended mode:', recommendedMode);

        // Auto-select the recommended voice
        if (recommendedVoice) {
          const vnMatch = VN_VOICES.find(v => v.name === recommendedVoice);
          const intlMatch = VOICE_DATA.find(v => v.name === recommendedVoice);

          if (vnMatch) {
            setVoiceMode('vietnamese');
            setVoice(vnMatch.name);
          } else if (intlMatch) {
            setVoiceMode('international');
            setVoice(intlMatch.name);
          }
        } else if (recommendedMode) {
          setVoiceMode(recommendedMode);
        }

        // Extract Audio Profile (everything after VOICE_MODE line)
        const profileStart = result.search(/^#\s*AUDIO PROFILE/m);
        if (profileStart !== -1) {
          const fullProfile = result.substring(profileStart);
          const splitIdx = fullProfile.search(/####\s*TRANSCRIPT/i);
          if (splitIdx !== -1) {
            const profileHeader = fullProfile.substring(0, splitIdx).trim();
            const transcriptSection = fullProfile.substring(splitIdx);
            const taggedText = transcriptSection.replace(/####\s*TRANSCRIPT\s*/i, '').trim();
            console.log('[AI Diễn cảm] Profile:', profileHeader);
            console.log('[AI Diễn cảm] Tagged text (hidden):', taggedText);
            setAudioProfile(profileHeader);
            setTaggedText(taggedText);  // Store tags invisibly — user text stays clean
            setShowProfile(true);
          }
        }
      }
    } catch(e:any){setError(e.message)} finally{setAnalyzing(false)}
  };

  const generate = async () => {
    if(!text.trim())return;
    stop();setGenerating(true);setError(null);

    const ln=SUPPORTED_LANGUAGES.find(l=>l.code===tLang)?.name||'Vietnamese';
    const {geminiVoice,sysHint}=getVoiceConfig();

    const { fullText, mode: promptMode } = buildTTSPrompt({
      audioProfile,
      voiceMode,
      voiceName: voice,
      sysHint,
      speed,
      pitch,
      language: ln,
      text: audioProfile ? taggedText || text : text,  // Use hidden tagged text when AI profile is active
    });
    console.log('[TTS] Mode:', promptMode);
    console.log('[TTS] Full text to send:');
    console.log(fullText);

    // Auto-retry with key rotation on 429
    const failedKeys: string[] = [];
    const maxKeys = loadApiKeys().length;

    for (let attempt = 0; attempt < maxKeys; attempt++) {
      const key = attempt === 0 ? getNextApiKey() : getNextApiKeyExcluding(failedKeys);
      if (!key) break;

      try {
        console.log('[TTS] Attempt ' + (attempt+1) + ' with key ...' + key.slice(-6));
        const ai = new GoogleGenAI({apiKey: key});
        const r = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: { parts: [{ text: fullText }] },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: geminiVoice } } },
          }
        });
        const d = r.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!d) throw new Error('Không nhận được audio');

        // Success!
        setLastAudio(d);
        const displayName = voiceMode==='vietnamese' ? voice : geminiVoice;
        setGens(p=>[...p,{id:crypto.randomUUID(),text,voiceName:displayName,audioData:d,timestamp:Date.now()}]);

        if(!ctxRef.current||ctxRef.current.state==='closed') ctxRef.current=new AudioContext({sampleRate:24000});
        else if(ctxRef.current.state==='suspended') await ctxRef.current.resume();
        const raw=b64d(d),i16=new Int16Array(raw.buffer),buf=ctxRef.current.createBuffer(1,i16.length,24000),ch=buf.getChannelData(0);
        for(let x=0;x<i16.length;x++) ch[x]=i16[x]/32768;
        const src=ctxRef.current.createBufferSource();
        src.buffer=buf;src.playbackRate.value=speed;src.connect(ctxRef.current.destination);src.start();
        srcRef.current=src;setPlaying(true);src.onended=()=>setPlaying(false);
        setGenerating(false);
        return; // Done!
      } catch(e: any) {
        const msg = e.message || '';
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
          console.warn('[TTS] Key ...' + key.slice(-6) + ' hit quota, trying next...');
          failedKeys.push(key);
          continue; // Try next key
        }
        // Non-quota error — stop
        setError(msg);
        setGenerating(false);
        return;
      }
    }

    // All keys exhausted
    setError('Tất cả API key đã hết quota. Thêm key mới hoặc đợi reset (thường 1 phút).');
    setGenerating(false);
  };

  const dl=(data:string,name:string)=>{const u=URL.createObjectURL(toWav(b64d(data)));const a=document.createElement('a');a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)};

  const intlVoices = VOICE_DATA.filter(v=>gFilter==='All'||v.analysis.gender===gFilter);
  const vnVoices = VN_VOICES.filter(v=>gFilter==='All'||(gFilter==='Female'?v.gender==='Nữ':v.gender==='Nam'));
  const selVn = VN_VOICES.find(v=>v.name===voice);
  const selIntl = VOICE_DATA.find(v=>v.name===voice);
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{background:'var(--bg-primary)'}}>
      <div className="ambient-glow"/>

      {/* Header */}
      <header className="studio-header relative z-50 flex items-center justify-between px-5 h-14 border-b" style={{borderColor:'var(--border)',background:'#ffffff'}}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'var(--accent)'}}>
            <Mic size={15} color="white"/>
          </div>
          <span className="logo-text text-sm font-bold tracking-tight" style={{color:'var(--text-primary)'}}>Voice Studio</span>
        </div>
        <div className="header-btns flex items-center gap-2">
          <button onClick={()=>setShowGuide(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{background:'transparent',border:'1px solid var(--border)',color:'var(--text-secondary)'}}>
            <HelpCircle size={13}/><span>Hướng dẫn</span>
          </button>
          <button onClick={()=>setShowHistory(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{background:gens.length?'var(--accent-light)':'transparent',border:`1px solid ${gens.length?'rgba(124,58,237,0.2)':'var(--border)'}`,color:gens.length?'var(--accent)':'var(--text-secondary)'}}>
            <History size={13}/><span>Lịch sử</span>
            {gens.length>0&&<span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{background:'var(--accent)',color:'white'}}>{gens.length}</span>}
          </button>
          <button onClick={()=>setShowSettings(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative" style={{background:keyCount?'var(--accent-light)':'#fef3c7',border:`1px solid ${keyCount?'rgba(124,58,237,0.2)':'#fcd34d'}`,color:keyCount?'var(--accent)':'#b45309'}}>
            <Settings size={13}/><span>API Keys</span>
            {!keyCount&&<span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{background:'#f59e0b',animation:'barBounce 1s infinite'}}/>}
          </button>
          {user && (
            <>
              <button onClick={()=>navigate('/admin')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{background:'transparent',border:'1px solid var(--border)',color:'var(--text-muted)'}}>
                <Settings size={13}/><span>Admin</span>
              </button>
              <button onClick={()=>{logout();navigate('/')}} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626'}}>
                <span>Đăng xuất</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="studio-main relative z-10 flex-1 flex overflow-hidden">

        {/* Mobile sidebar toggle */}
        <div className="mobile-sidebar-toggle" onClick={()=>setSidebarOpen(!sidebarOpen)}>
          <Menu size={14} style={{display:'inline',marginRight:6,verticalAlign:'middle'}}/>
          {sidebarOpen ? '▲ Ẩn giọng đọc' : '▼ Chọn giọng đọc'}
        </div>

        {/* LEFT PANEL */}
        <aside className={`studio-sidebar w-[300px] shrink-0 border-r flex flex-col overflow-hidden ${sidebarOpen?'expanded':'collapsed'}`} style={{borderColor:'var(--border)',background:'var(--bg-secondary)'}}>
          {/* Voice Mode Toggle */}
          <div className="p-4 border-b" style={{borderColor:'var(--border)'}}>
            <div className="flex gap-1 mb-3 p-1 rounded-xl" style={{background:'#f5f5f5'}}>
              <button onClick={()=>{setVoiceMode('vietnamese');setVoice(VN_VOICES[0].name)}} className={`pill-btn flex-1 ${voiceMode==='vietnamese'?'active':''}`}>🇻🇳 Giọng VN</button>
              <button onClick={()=>{setVoiceMode('international');setVoice(VOICE_DATA[0].name)}} className={`pill-btn flex-1 ${voiceMode==='international'?'active':''}`}>🌍 Quốc tế</button>
            </div>
            <div className="flex gap-1 mb-2">
              {['All','Female','Male'].map(g=>(
                <button key={g} onClick={()=>setGFilter(g)} className={`pill-btn flex-1 ${gFilter===g?'active':''}`} style={{fontSize:'10px',padding:'4px 8px'}}>
                  {g==='All'?'Tất cả':g==='Female'?'Nữ':'Nam'}
                </button>
              ))}
            </div>
            {/* Mobile voice dropdown — shown only on mobile via CSS */}
            <div className="mobile-voice-select">
              <select value={voice} onChange={e=>setVoice(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-xs font-medium text-gray-900 appearance-none cursor-pointer outline-none"
                style={{background:'#f5f5f5',border:'1px solid var(--border)'}}>
                {voiceMode==='vietnamese'
                  ? vnVoices.map(v=><option key={v.name} value={v.name} style={{background:'#ffffff'}}>{v.name} — {v.gender}</option>)
                  : intlVoices.map(v=><option key={v.name} value={v.name} style={{background:'#18181b'}}>{v.name} — {v.analysis.gender}</option>)
                }
              </select>
            </div>
          </div>

          {/* Voice List — hidden on mobile, shown on desktop */}
          <div className="desktop-voice-list flex-1 overflow-y-auto custom-scroll p-3 space-y-1">
            {voiceMode==='vietnamese' ? vnVoices.map(v=>(
              <div key={v.name} onClick={()=>setVoice(v.name)} className={`voice-card ${voice===v.name?'active':''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold text-gray-900">{v.name}</span>
                  <span className="text-[10px]" style={{color:'var(--text-muted)'}}>{v.gender}</span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{color:'var(--text-secondary)'}}>{v.description}</p>
              </div>
            )) : intlVoices.map(v=>(
              <div key={v.name} onClick={()=>setVoice(v.name)} className={`voice-card ${voice===v.name?'active':''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold text-gray-900">{v.name}</span>
                  <span className="text-[10px]" style={{color:'var(--text-muted)'}}>{v.analysis.gender}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {v.analysis.characteristics.slice(0,3).map(c=>(
                    <span key={c} className="text-[9px] px-1.5 py-0.5 rounded" style={{background:'rgba(255,255,255,0.05)',color:'var(--text-secondary)'}}>{c}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Language + Speed + Pitch — hidden on mobile */}
          <div className="sidebar-settings-extra p-4 border-t space-y-3" style={{borderColor:'var(--border)'}}>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] block mb-1.5" style={{color:'var(--text-muted)'}}>Ngôn ngữ phát âm</label>
              <div className="relative">
                <select value={tLang} onChange={e=>setTLang(e.target.value)} className="w-full rounded-lg px-3 py-2 text-xs font-medium text-gray-900 appearance-none cursor-pointer pr-8 outline-none" style={{background:'#f5f5f5',border:'1px solid var(--border)'}}>
                  {SUPPORTED_LANGUAGES.map(l=><option key={l.code} value={l.code} style={{background:'#18181b'}}>{l.name}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'var(--text-muted)'}}/>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] flex items-center gap-1" style={{color:'var(--text-muted)'}}><Gauge size={10}/>Tốc độ</label>
                <span className="text-[11px] font-semibold" style={{color:'var(--accent-bright)'}}>{speed.toFixed(1)}x</span>
              </div>
              <input type="range" min="0.5" max="2.0" step="0.1" value={speed} onChange={e=>setSpeed(+e.target.value)}
                className="w-full h-1 rounded-full appearance-none cursor-pointer" style={{background:`linear-gradient(to right, var(--accent) 0%, var(--accent) ${(speed-0.5)/1.5*100}%, rgba(255,255,255,0.1) ${(speed-0.5)/1.5*100}%)`}}/>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] flex items-center gap-1" style={{color:'var(--text-muted)'}}><Music size={10}/>Cao độ</label>
                <span className="text-[11px] font-semibold" style={{color:'var(--accent-bright)'}}>{pitch>0?'+':''}{pitch} st</span>
              </div>
              <input type="range" min="-6" max="6" step="1" value={pitch} onChange={e=>setPitch(+e.target.value)}
                className="w-full h-1 rounded-full appearance-none cursor-pointer" style={{background:`linear-gradient(to right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.1) ${(pitch+6)/12*100}%, var(--accent) ${(pitch+6)/12*100}%)`}}/>
            </div>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <section className="studio-right flex-1 flex flex-col overflow-hidden p-5 gap-4">
          {/* Tab Toggle: Text vs SRT */}
          <div className="flex gap-1 p-1 rounded-xl shrink-0" style={{background:'#f5f5f5'}}>
            <button onClick={()=>setStudioTab('text')} className={`pill-btn flex-1 ${studioTab==='text'?'active':''}`}>✏️ Văn bản</button>
            <button onClick={()=>setStudioTab('srt')} className={`pill-btn flex-1 ${studioTab==='srt'?'active':''}`}>📄 SRT / File</button>
          </div>

          {studioTab === 'srt' ? (
            <SrtPanel voiceName={voice} voiceMode={voiceMode} lang={tLang}/>
          ) : (
          <>
          {/* Voice badge */}
          <div className="flex items-center gap-3 glass-panel px-4 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:'var(--accent-light)'}}>
              <Volume2 size={14} style={{color:'var(--accent-bright)'}}/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">{voice}</div>
              <div className="text-[11px] truncate" style={{color:'var(--text-secondary)'}}>
                {voiceMode==='vietnamese'&&selVn ? selVn.description : selIntl ? `${selIntl.analysis.gender} · ${selIntl.pitch}` : ''}
              </div>
            </div>
            {voiceMode==='vietnamese'&&selVn&&(
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shrink-0" style={{background:'#ecfdf5',color:'#059669',border:'1px solid #a7f3d0'}}>VN</span>
            )}
          </div>

          {/* Audio Profile Panel — compact, no raw text shown */}
          {audioProfile && (
            <div className="glass-panel overflow-hidden" style={{borderColor:'rgba(16,185,129,0.2)'}}>
              <div className="w-full px-4 py-2.5 flex items-center justify-between" style={{background:'rgba(16,185,129,0.06)'}}>
                <div className="flex items-center gap-2">
                  <Sparkles size={13} style={{color:'#34d399'}}/>
                  <span className="text-[11px] font-bold" style={{color:'#34d399'}}>✅ Phong cách giọng đã sẵn sàng</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{background:'rgba(16,185,129,0.15)',color:'#6ee7b7'}}>
                    {audioProfile.match(/# AUDIO PROFILE:\s*(.+)/)?.[1] || 'AI Generated'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e)=>{
                    e.stopPropagation();
                    const charName = audioProfile.match(/# AUDIO PROFILE:\s*(.+)/)?.[1] || 'Profile';
                    const defaultName = charName + ' — ' + voice;
                    const name = prompt('Tên profile:', defaultName);
                    if (!name) return;
                    const p: SavedProfile = {
                      id: crypto.randomUUID(),
                      name,
                      audioProfile,
                      voiceMode,
                      voiceName: voice,
                      geminiVoice: getVoiceConfig().geminiVoice,
                      createdAt: Date.now()
                    };
                    saveProfile(p);
                    setSavedProfiles(loadSavedProfiles());
                    setError(null);
                    const btn = e.currentTarget;
                    btn.textContent = '✅ Đã lưu!';
                    setTimeout(() => { btn.innerHTML = ''; }, 1500);
                  }} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-colors" style={{color:'#34d399',background:'rgba(16,185,129,0.1)'}} title="Lưu profile để dùng lại"><Save size={10}/>Lưu</button>
                  <button onClick={()=>{setAudioProfile('');setTaggedText('');setShowProfile(false)}} className="text-[10px] px-2 py-0.5 rounded hover:bg-red-500/20 transition-colors" style={{color:'var(--text-muted)'}}>Xóa</button>
                </div>
              </div>
            </div>
          )}

          {/* Text Editor */}
          <div className="glass-panel flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b" style={{borderColor:'var(--border)'}}>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{color:'var(--text-muted)'}}>Nội dung văn bản</span>
              <span className="text-[10px] font-medium" style={{color:'var(--text-muted)'}}>{text.length} ký tự</span>
            </div>

            {/* AI Diễn cảm + Load Profile */}
            <div className="px-4 py-2 flex flex-wrap gap-1.5 items-center border-b" style={{borderColor:'var(--border)'}}>
              <button onClick={analyzeEmotion} disabled={analyzing||!text.trim()} className="emotion-chip" style={{background: audioProfile ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.12)',borderColor: audioProfile ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.3)',color:'#34d399',fontSize:'12px',padding:'5px 14px'}}>
                {analyzing?<Loader2 size={12} className="animate-spin"/>:<Sparkles size={12}/>}
                {analyzing?'Đang phân tích...': audioProfile ? '✅ Đã phân tích' : '🎭 AI Diễn cảm'}
              </button>
              {/* Load Saved Profile */}
              <div className="relative">
                <button onClick={()=>setShowLoadMenu(!showLoadMenu)} className="emotion-chip" style={{background:'rgba(139,92,246,0.12)',borderColor:'rgba(139,92,246,0.3)',color:'#a78bfa'}} disabled={savedProfiles.length===0}>
                  <FolderOpen size={11}/>{savedProfiles.length>0 ? '📂 Giọng đã lưu ('+savedProfiles.length+')' : '📂 Chưa có'}
                </button>
                {showLoadMenu && savedProfiles.length>0 && (
                  <div className="absolute top-full left-0 mt-1 w-80 max-h-72 overflow-y-auto custom-scroll rounded-xl z-50" style={{background:'#ffffff',border:'1px solid var(--border)',boxShadow:'0 8px 32px rgba(0,0,0,0.12)'}}>
                    <div className="px-3 py-2 border-b" style={{borderColor:'var(--border)'}}>
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{color:'var(--text-muted)'}}>Chọn profile → nhập text mới → tạo cùng giọng</span>
                    </div>
                    {savedProfiles.map(p=>(
                      <div key={p.id} className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 cursor-pointer border-b group" style={{borderColor:'var(--border)'}} onClick={()=>{setAudioProfile(p.audioProfile);setVoiceMode(p.voiceMode as VoiceMode);setVoice(p.voiceName);setShowProfile(true);setShowLoadMenu(false)}}>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-gray-900 truncate">{p.name}</div>
                          <div className="flex gap-2 mt-0.5">
                            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{background:'var(--accent-light)',color:'var(--accent)'}}>{p.voiceName}</span>
                            <span className="text-[9px]" style={{color:'var(--text-muted)'}}>{new Date(p.createdAt).toLocaleString('vi')}</span>
                          </div>
                        </div>
                        <button onClick={(e)=>{e.stopPropagation();deleteProfile(p.id);setSavedProfiles(loadSavedProfiles())}} className="p-1.5 rounded hover:bg-red-500/20 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{color:'var(--text-muted)'}}><Trash2 size={11}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
              {/* Upload SRT/TXT */}
              <div className="file-upload-wrap">
                <span className="btn-file-upload"><Upload size={11}/>📄 Tải SRT/TXT</span>
                <input ref={fileInputRef} type="file" accept=".srt,.txt" onChange={(e)=>{
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const content = ev.target?.result as string;
                    if (file.name.endsWith('.srt')) {
                      const entries = parseSrt(content);
                      setText(entries.map(e => e.text).join('\n\n'));
                    } else {
                      setText(content);
                    }
                    if (audioProfile) setTaggedText('');
                  };
                  reader.readAsText(file, 'utf-8');
                  e.target.value = '';
                }}/>
              </div>

            <textarea ref={tRef} value={text} onChange={e=>{setText(e.target.value);if(audioProfile){setTaggedText('')}}} className="text-editor flex-1 custom-scroll"
              placeholder={'Dán văn bản vào đây...\n\n1. Nhấn "🎭 AI Diễn cảm" để AI tự phân tích giọng\n2. Chọn giọng hoặc để AI tự chọn\n3. Nhấn "Tạo giọng nói"'}
            />

            {/* Actions */}
            <div className="px-4 pb-4 flex items-center gap-3">
              {playing?(
                <button onClick={stop} className="btn-generate" style={{background:'#3f3f46',boxShadow:'none'}}><Square size={15} className="fill-current"/>Dừng</button>
              ):(
                <button onClick={generate} disabled={generating||!text.trim()} className="btn-generate">
                  {generating?<><Loader2 size={16} className="animate-spin"/>Đang tạo...</>:<><Volume2 size={16}/>Tạo giọng nói</>}
                </button>
              )}
              {lastAudio&&<button onClick={()=>dl(lastAudio,`voice_${Date.now()}.wav`)} className="p-3 rounded-xl transition-all hover:scale-105" style={{background:'rgba(255,255,255,0.05)',border:'1px solid var(--border)',color:'var(--text-secondary)'}} title="Tải WAV"><Download size={16}/></button>}
              {lastAudio&&<button onClick={()=>{
                // Generate SRT from text
                const sentences = text.split(/(?<=[.!?。？！\n])\s*/).filter(s=>s.trim());
                if (!sentences.length) return;
                // Get audio duration
                const audio = new Audio(lastAudio);
                audio.addEventListener('loadedmetadata', ()=>{
                  const totalDur = audio.duration || 10;
                  const totalChars = sentences.reduce((a,s)=>a+s.length, 0);
                  let currentTime = 0;
                  const srtLines = sentences.map((s, i) => {
                    const dur = (s.length / totalChars) * totalDur;
                    const start = currentTime;
                    const end = currentTime + dur;
                    currentTime = end;
                    const fmt = (t: number) => {
                      const h = Math.floor(t/3600);
                      const m = Math.floor((t%3600)/60);
                      const sec = Math.floor(t%60);
                      const ms = Math.round((t%1)*1000);
                      return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
                    };
                    return `${i+1}\n${fmt(start)} --> ${fmt(end)}\n${s.trim()}`;
                  });
                  const blob = new Blob([srtLines.join('\n\n')], {type:'text/plain;charset=utf-8'});
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `voice_${Date.now()}.srt`;
                  a.click();
                });
                audio.load();
              }} className="p-3 rounded-xl transition-all hover:scale-105" style={{background:'rgba(96,165,250,0.08)',border:'1px solid rgba(96,165,250,0.2)',color:'#60a5fa'}} title="Tải SRT"><span style={{fontSize:10,fontWeight:700}}>SRT</span></button>}
            </div>
          </div>

          {/* Player */}
          <div className={`player-area ${playing?'playing':''}`}>
            {error?<div className="h-full flex items-center justify-center gap-2 text-sm" style={{color:'#f87171'}}><AlertCircle size={16}/>{error}</div>
              :<AudioVisualizer isPlaying={playing} color="#a78bfa"/>}
            <div className="glow-line"/>
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{color:'var(--text-muted)'}}>{playing?'Đang phát...':lastAudio?'Sẵn sàng':'Chờ tạo âm thanh...'}</span>
              {playing&&<div className="flex gap-[3px] items-end">{[0,1,2].map(i=><div key={i} className="playing-bar" style={{animationDelay:`${i*0.15}s`}}/>)}</div>}
            </div>
          </div>
          </>
          )}
        </section>
      </main>

      {/* History */}
      {showHistory&&(
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 animate-fade-in" style={{background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)'}} onClick={()=>setShowHistory(false)}/>
          <div className="ml-auto w-full max-w-md flex flex-col animate-slide-in relative" style={{background:'#ffffff',borderLeft:'1px solid var(--border)'}}>
            <div className="p-5 flex items-center justify-between border-b" style={{borderColor:'var(--border)'}}>
              <h2 className="font-bold text-gray-900 text-sm">Lịch sử ({gens.length})</h2>
              <button onClick={()=>setShowHistory(false)} className="p-2 rounded-lg" style={{color:'var(--text-muted)'}}><X size={16}/></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
              {gens.length===0?<div className="h-full flex items-center justify-center text-sm" style={{color:'var(--text-muted)'}}>Chưa có bản ghi</div>
              :gens.slice().reverse().map(g=>(
                <div key={g.id} className="glass-panel p-3 space-y-2">
                  <div className="flex items-center gap-2 text-[10px]" style={{color:'var(--text-muted)'}}>
                    <span className="font-bold" style={{color:'var(--accent-bright)'}}>{g.voiceName}</span>
                    <Clock size={10}/>{new Date(g.timestamp).toLocaleTimeString()}
                  </div>
                  <p className="text-sm italic line-clamp-2" style={{color:'var(--text-secondary)'}}>{g.text}</p>
                  <div className="flex gap-2">
                    <button onClick={async()=>{
                      if(!ctxRef.current||ctxRef.current.state==='closed')ctxRef.current=new AudioContext({sampleRate:24000});
                      stop();const raw=b64d(g.audioData),i16=new Int16Array(raw.buffer),buf=ctxRef.current.createBuffer(1,i16.length,24000),ch=buf.getChannelData(0);
                      for(let x=0;x<i16.length;x++)ch[x]=i16[x]/32768;
                      const src=ctxRef.current.createBufferSource();src.buffer=buf;src.connect(ctxRef.current.destination);src.start();
                      srcRef.current=src;setPlaying(true);src.onended=()=>setPlaying(false);
                    }} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium" style={{background:'rgba(255,255,255,0.05)',color:'var(--text-secondary)',border:'1px solid var(--border)'}}>
                      <Play size={11} className="fill-current"/>Nghe
                    </button>
                    <button onClick={()=>dl(g.audioData,`${g.voiceName}_${g.id.slice(0,6)}.wav`)} className="p-1.5 rounded-lg" style={{background:'rgba(255,255,255,0.05)',color:'var(--text-muted)',border:'1px solid var(--border)'}}><Download size={12}/></button>
                    <button onClick={()=>setGens(p=>p.filter(x=>x.id!==g.id))} className="p-1.5 rounded-lg hover:text-red-400" style={{background:'rgba(255,255,255,0.05)',color:'var(--text-muted)',border:'1px solid var(--border)'}}><Trash2 size={12}/></button>
                  </div>
                </div>
              ))}
            </div>
            {gens.length>0&&<div className="p-4 border-t" style={{borderColor:'var(--border)'}}><button onClick={()=>setGens([])} className="w-full text-xs font-semibold uppercase tracking-widest py-2 hover:text-red-400 transition-colors" style={{color:'var(--text-muted)'}}>Xóa tất cả</button></div>}
          </div>
        </div>
      )}

      {showSettings&&<SettingsModal onClose={()=>{setShowSettings(false);setKeyCount(loadApiKeys().length)}} language="vi"/>}

      {/* User Guide Modal */}
      {showGuide&&(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 animate-fade-in" style={{background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)'}} onClick={()=>setShowGuide(false)}/>
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl animate-fade-in" style={{background:'#ffffff',border:'1px solid var(--border)',boxShadow:'0 24px 48px rgba(0,0,0,0.15)'}}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{borderColor:'var(--border)'}}>
              <div className="flex items-center gap-2">
                <BookOpen size={18} style={{color:'var(--accent)'}}/>
                <h2 className="text-base font-bold" style={{color:'var(--text-primary)'}}>Hướng dẫn sử dụng Voice Studio</h2>
              </div>
              <button onClick={()=>setShowGuide(false)} className="p-2 rounded-lg hover:bg-gray-100 transition"><X size={16} style={{color:'var(--text-muted)'}}/></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scroll px-6 py-5 space-y-6">

              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:'#fef3c7'}}><Key size={16} style={{color:'#b45309'}}/></div>
                <div>
                  <h3 className="text-sm font-bold mb-1" style={{color:'var(--text-primary)'}}>Bước 1: Thêm API Key</h3>
                  <p className="text-xs leading-relaxed" style={{color:'var(--text-secondary)'}}>
                    Nhấn nút <b>"API Keys"</b> ở góc trên bên phải → Dán Google Gemini API key của bạn vào.
                    Bạn có thể thêm <b>nhiều key</b> để hệ thống tự xoay vòng, tránh giới hạn quota.
                  </p>
                  <p className="text-[11px] mt-1.5 px-2 py-1 rounded-lg inline-block" style={{background:'#eff6ff',color:'#1d4ed8'}}>
                    💡 Lấy key miễn phí tại: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{textDecoration:'underline'}}>aistudio.google.com/apikey</a>
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:'var(--accent-light)'}}><Mic size={16} style={{color:'var(--accent)'}}/></div>
                <div>
                  <h3 className="text-sm font-bold mb-1" style={{color:'var(--text-primary)'}}>Bước 2: Chọn giọng đọc</h3>
                  <p className="text-xs leading-relaxed" style={{color:'var(--text-secondary)'}}>
                    Thanh bên trái có 2 chế độ:<br/>
                    • <b>🇻🇳 Giọng VN</b> — 30+ giọng Việt Nam (miền Bắc, Nam, nhân vật đặc sắc)<br/>
                    • <b>🌍 Quốc tế</b> — Giọng tiếng Anh, đa ngôn ngữ<br/>
                    Lọc theo <b>Nam / Nữ</b> để tìm nhanh hơn.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:'#ecfdf5'}}><FileText size={16} style={{color:'#059669'}}/></div>
                <div>
                  <h3 className="text-sm font-bold mb-1" style={{color:'var(--text-primary)'}}>Bước 3: Nhập văn bản</h3>
                  <p className="text-xs leading-relaxed" style={{color:'var(--text-secondary)'}}>
                    Tab <b>"✏️ Văn bản"</b>: Dán hoặc nhập nội dung muốn đọc → Nhấn <b>"🎙 Tạo giọng nói"</b>.<br/>
                    Sau khi tạo xong, nhấn <b>⬇ tải WAV</b> hoặc <b>SRT</b> (phụ đề tự tạo kèm audio).
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:'#fdf2f8'}}><Sparkles size={16} style={{color:'#db2777'}}/></div>
                <div>
                  <h3 className="text-sm font-bold mb-1" style={{color:'var(--text-primary)'}}>Bước 4: AI Diễn cảm (nâng cao)</h3>
                  <p className="text-xs leading-relaxed" style={{color:'var(--text-secondary)'}}>
                    Nhấn nút <b>"🎭 AI Diễn cảm"</b> để AI tự phân tích văn bản và tạo phong cách giọng phù hợp.<br/>
                    AI sẽ tự thêm biểu cảm: vui, buồn, nghiêm túc, hào hứng... tùy nội dung.<br/>
                    Bạn có thể <b>Lưu profile</b> để dùng lại cho các đoạn text khác.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:'#eff6ff'}}><Upload size={16} style={{color:'#2563eb'}}/></div>
                <div>
                  <h3 className="text-sm font-bold mb-1" style={{color:'var(--text-primary)'}}>Bước 5: Tải file SRT / TXT</h3>
                  <p className="text-xs leading-relaxed" style={{color:'var(--text-secondary)'}}>
                    Chuyển sang tab <b>"📄 SRT / File"</b> → Upload file phụ đề <b>.srt</b> hoặc văn bản <b>.txt</b>.<br/>
                    • <b>Dịch tất cả</b>: Dịch phụ đề sang ngôn ngữ khác (Anh, Nhật, Hàn...)<br/>
                    • <b>Tạo audio tất cả</b>: Tạo giọng đọc cho từng đoạn, tải từng file hoặc tải hết.<br/>
                    • <b>Tải SRT đã dịch</b>: Xuất file phụ đề đã dịch.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:'#f5f3ff'}}><Palette size={16} style={{color:'#7c3aed'}}/></div>
                <div>
                  <h3 className="text-sm font-bold mb-1" style={{color:'var(--text-primary)'}}>Mẹo sử dụng</h3>
                  <p className="text-xs leading-relaxed" style={{color:'var(--text-secondary)'}}>
                    • Thêm <b>nhiều API key</b> để không bị giới hạn lượt dùng.<br/>
                    • Chọn <b>Ngôn ngữ phát âm</b> phù hợp (sidebar bên trái) trước khi tạo.<br/>
                    • Điều chỉnh <b>Tốc độ</b> và <b>Cao độ</b> cho giọng tự nhiên hơn.<br/>
                    • Lưu <b>Profile giọng</b> yêu thích để tái sử dụng nhanh.<br/>
                    • Với SRT: Dịch trước → kiểm tra → tạo audio.
                  </p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t flex items-center justify-between" style={{borderColor:'var(--border)'}}>
              <p className="text-[11px]" style={{color:'var(--text-muted)'}}>Voice Studio — Powered by Gemini AI</p>
              <button onClick={()=>setShowGuide(false)} className="px-4 py-2 rounded-lg text-xs font-semibold" style={{background:'var(--accent)',color:'white'}}>Đã hiểu!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;