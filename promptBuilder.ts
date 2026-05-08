/**
 * Prompt Builder for TTS
 * Based on the ORIGINAL working code in AiTtsPreview.tsx:
 *   contents: { parts: [{ text: `${systemInstruction}\n\n#### TRANSCRIPT\n${text}` }] }
 * 
 * The TTS model understands #### TRANSCRIPT as a separator.
 * Everything BEFORE it = voice direction (not read aloud)
 * Everything AFTER it = text to speak (read aloud with emotion tags)
 */

import { VN_VOICES } from './vnVoices';

export type PromptMode = 'director' | 'vietnamese' | 'international';

interface PromptConfig {
  audioProfile: string;
  voiceMode: string;
  voiceName: string;
  sysHint: string;
  speed: number;
  pitch: number;
  language: string;
  text: string;
}

interface TTSPromptResult {
  fullText: string;    // Combined: systemInstruction + #### TRANSCRIPT + text
  mode: PromptMode;
}

export function buildTTSPrompt(config: PromptConfig): TTSPromptResult {
  const { audioProfile, voiceMode, voiceName, sysHint, speed, pitch, language, text } = config;

  const speedHint = speed !== 1 ? `Speak at ${speed}x speed.` : '';
  const pitchHint = pitch !== 0
    ? `Adjust vocal pitch by ${pitch} semitones ${pitch > 0 ? 'higher' : 'lower'}.`
    : '';
  const extraHints = [speedHint, pitchHint].filter(Boolean).join(' ');

  // Build system instruction part (voice direction, NOT read aloud)
  let sysBlock: string;

  if (audioProfile) {
    // MODE 1: AI Director — use generated Audio Profile
    const parts = [];
    if (extraHints) parts.push(extraHints);
    parts.push(audioProfile);
    sysBlock = parts.join('\n\n');
    // Combine: sysBlock + #### TRANSCRIPT + text
    return {
      fullText: sysBlock + '\n\n#### TRANSCRIPT\n' + text,
      mode: 'director'
    };
  }

  if (voiceMode === 'vietnamese') {
    // MODE 2: Vietnamese Voice — persona hint
    const vnVoice = VN_VOICES.find(v => v.name === voiceName);
    const persona = vnVoice ? vnVoice.systemHint : '';
    sysBlock = [persona, extraHints, `Speak naturally in ${language}.`]
      .filter(Boolean).join(' ');
    return {
      fullText: sysBlock + '\n\n#### TRANSCRIPT\n' + text,
      mode: 'vietnamese'
    };
  }

  // MODE 3: International Voice
  sysBlock = [sysHint, extraHints, `Speak naturally and expressively in ${language}.`]
    .filter(Boolean).join(' ');
  return {
    fullText: sysBlock + '\n\n#### TRANSCRIPT\n' + text,
    mode: 'international'
  };
}
