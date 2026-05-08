/**
 * Voice Catalog — Text format for AI to read and recommend voices
 */

import { VN_VOICES } from './vnVoices';
import { VOICE_DATA } from './constants';

export function getVoiceCatalogText(): string {
  const lines: string[] = [];

  lines.push('=== VOICE LIBRARY ===');
  lines.push('');
  lines.push('--- VIETNAMESE VOICES ---');

  for (const v of VN_VOICES) {
    lines.push(`[${v.name}] Gender: ${v.gender} | Gemini Voice: ${v.geminiVoice} | ${v.description} | Persona: ${v.systemHint}`);
  }

  lines.push('');
  lines.push('--- INTERNATIONAL VOICES ---');

  for (const v of VOICE_DATA) {
    const chars = v.analysis.characteristics.join(', ');
    lines.push(`[${v.name}] Gender: ${v.analysis.gender} | Pitch: ${v.pitch} | ${chars}`);
  }

  return lines.join('\n');
}
