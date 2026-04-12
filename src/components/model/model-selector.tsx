'use client';

import { usePromptStore } from '@/stores/prompt-store';
import { PROVIDERS } from '@/lib/constants';
import type { AIProvider } from '@/types/ai';

export function ModelSelector() {
  const { provider, model, setProvider, setModel } = usePromptStore();
  const providerConfig = PROVIDERS[provider];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">모델</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as AIProvider)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {(Object.entries(PROVIDERS) as [AIProvider, typeof PROVIDERS[AIProvider]][]).map(
            ([key, config]) => (
              <option key={key} value={key}>
                {config.name}
              </option>
            )
          )}
        </select>
      </div>

      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {providerConfig.models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}
