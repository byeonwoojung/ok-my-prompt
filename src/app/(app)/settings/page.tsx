'use client';

import { ApiKeyForm } from '@/components/settings/api-key-form';
import type { AIProvider } from '@/types/ai';

const providers: { id: AIProvider; name: string; description: string }[] = [
  { id: 'openai', name: 'OpenAI', description: 'GPT-4o, GPT-4 Turbo, o1 등' },
  { id: 'google', name: 'Google (Gemini)', description: 'Gemini 2.5 Flash, Pro 등' },
  { id: 'anthropic', name: 'Anthropic (Claude)', description: 'Claude Sonnet 4, Opus 4 등' },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-sm text-muted-foreground mt-1">
          API 키를 등록하여 각 AI 모델을 사용하세요
        </p>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <div>
              <h2 className="text-lg font-semibold">{provider.name}</h2>
              <p className="text-sm text-muted-foreground">{provider.description}</p>
            </div>
            <ApiKeyForm provider={provider.id} />
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          <strong>보안 안내:</strong> 로그인하지 않은 경우 API 키는 브라우저 세션에만 저장되며,
          탭을 닫으면 삭제됩니다. 로그인하면 암호화되어 안전하게 서버에 저장됩니다.
        </p>
      </div>
    </div>
  );
}
