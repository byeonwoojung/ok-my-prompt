import type { SessionPrompt } from '@/types/prompt';
import { MAX_SESSION_PROMPTS } from '@/lib/constants';

const SESSION_PROMPTS_KEY = 'ok-my-prompt:session-prompts';
const SESSION_API_KEYS_KEY = 'ok-my-prompt:session-api-keys';

export function getSessionPrompts(): SessionPrompt[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = sessionStorage.getItem(SESSION_PROMPTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSessionPrompt(prompt: SessionPrompt): void {
  if (typeof window === 'undefined') return;
  const prompts = getSessionPrompts();
  const existing = prompts.findIndex(p => p.id === prompt.id);
  if (existing >= 0) {
    prompts[existing] = prompt;
  } else {
    prompts.unshift(prompt);
  }
  // 최근 5개만 유지
  const trimmed = prompts.slice(0, MAX_SESSION_PROMPTS);
  sessionStorage.setItem(SESSION_PROMPTS_KEY, JSON.stringify(trimmed));
}

export function removeSessionPrompt(id: string): void {
  if (typeof window === 'undefined') return;
  const prompts = getSessionPrompts().filter(p => p.id !== id);
  sessionStorage.setItem(SESSION_PROMPTS_KEY, JSON.stringify(prompts));
}

// API 키 임시 저장 (비로그인 사용자)
export type SessionApiKeys = Partial<Record<string, string>>;

export function getSessionApiKeys(): SessionApiKeys {
  if (typeof window === 'undefined') return {};
  try {
    const data = sessionStorage.getItem(SESSION_API_KEYS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function setSessionApiKey(provider: string, key: string): void {
  if (typeof window === 'undefined') return;
  const keys = getSessionApiKeys();
  keys[provider] = key;
  sessionStorage.setItem(SESSION_API_KEYS_KEY, JSON.stringify(keys));
}

export function removeSessionApiKey(provider: string): void {
  if (typeof window === 'undefined') return;
  const keys = getSessionApiKeys();
  delete keys[provider];
  sessionStorage.setItem(SESSION_API_KEYS_KEY, JSON.stringify(keys));
}

export function maskApiKey(key: string): string {
  if (key.length <= 15) return key;
  return key.slice(0, 15) + '*'.repeat(Math.min(key.length - 15, 20));
}
