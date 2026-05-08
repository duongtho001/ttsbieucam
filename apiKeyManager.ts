/**
 * API Key Manager — Round-Robin Rotation
 * Keys are stored in localStorage, one key per line.
 * Each call to getNextApiKey() advances the pointer cyclically.
 */

const STORAGE_KEY = 'gemini_api_keys';
const INDEX_KEY = 'gemini_api_key_index';

/** Parse raw textarea value into an array of trimmed, non-empty keys */
export function parseKeys(raw: string): string[] {
  return raw
    .split('\n')
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}

/** Save API keys to localStorage */
export function saveApiKeys(raw: string): void {
  localStorage.setItem(STORAGE_KEY, raw);
  localStorage.setItem(INDEX_KEY, '0'); // reset rotation on save
}

/** Load raw API keys string from localStorage */
export function loadApiKeysRaw(): string {
  return localStorage.getItem(STORAGE_KEY) || '';
}

/** Load parsed API keys array */
export function loadApiKeys(): string[] {
  return parseKeys(loadApiKeysRaw());
}

/** Get current key index */
function getCurrentIndex(): number {
  const keys = loadApiKeys();
  if (keys.length === 0) return 0;
  const stored = parseInt(localStorage.getItem(INDEX_KEY) || '0', 10);
  return isNaN(stored) ? 0 : stored % keys.length;
}

/**
 * Get the next API key in rotation.
 * Returns null if no keys are configured.
 */
export function getNextApiKey(): string | null {
  const keys = loadApiKeys();
  if (keys.length === 0) return null;

  const index = getCurrentIndex();
  const key = keys[index];

  // Advance the pointer
  const nextIndex = (index + 1) % keys.length;
  localStorage.setItem(INDEX_KEY, String(nextIndex));

  return key;
}

/** Return key count and current rotation index (for display) */
export function getKeyStats(): { total: number; currentIndex: number } {
  const keys = loadApiKeys();
  return {
    total: keys.length,
    currentIndex: getCurrentIndex(),
  };
}

/**
 * Get the next API key, skipping any keys in the exclude list.
 * Used for auto-retry when a key hits 429 quota.
 * Returns null if all keys are exhausted.
 */
export function getNextApiKeyExcluding(excludeKeys: string[]): string | null {
  const keys = loadApiKeys();
  const available = keys.filter(k => !excludeKeys.includes(k));
  if (available.length === 0) return null;

  const index = getCurrentIndex();
  // Find the next available key starting from current index
  for (let i = 0; i < keys.length; i++) {
    const idx = (index + i) % keys.length;
    const key = keys[idx];
    if (!excludeKeys.includes(key)) {
      localStorage.setItem(INDEX_KEY, String((idx + 1) % keys.length));
      return key;
    }
  }
  return null;
}
