/**
 * Audio Profile Manager — Save/Load profiles to localStorage
 * Keeps voice consistent across sessions
 */

export interface SavedProfile {
  id: string;
  name: string;
  audioProfile: string;    // The profile header (Scene + Director Notes)
  voiceMode: 'vietnamese' | 'international';
  voiceName: string;
  geminiVoice: string;
  createdAt: number;
}

const STORAGE_KEY = 'saved_audio_profiles';

export function loadSavedProfiles(): SavedProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProfile(profile: SavedProfile): void {
  const profiles = loadSavedProfiles();
  profiles.unshift(profile); // newest first
  // Keep max 20 profiles
  if (profiles.length > 20) profiles.length = 20;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function deleteProfile(id: string): void {
  const profiles = loadSavedProfiles().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}
