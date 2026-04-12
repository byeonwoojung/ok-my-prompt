'use client';

import { usePromptStore } from '@/stores/prompt-store';
import { PROVIDERS } from '@/lib/constants';
import { ScrubberInput } from './scrubber-input';

export function ParameterPanel() {
  const { provider, parameters, setParameter } = usePromptStore();
  const parameterDefs = PROVIDERS[provider].parameters;

  return (
    <div className="flex flex-wrap gap-4">
      {parameterDefs.map((param) => (
        <ScrubberInput
          key={param.key}
          label={param.label}
          description={param.description}
          value={(parameters as Record<string, number>)[param.key] ?? param.defaultValue}
          onChange={(v) => setParameter(param.key, v)}
          min={param.min}
          max={param.max}
          step={param.step}
        />
      ))}
    </div>
  );
}
