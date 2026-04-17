'use client';

import { usePromptStore } from '@/stores/prompt-store';
import { PROVIDERS } from '@/lib/constants';
import { ScrubberInput } from './scrubber-input';

export function ParameterPanel() {
  const { provider, model, parameters, setParameter } = usePromptStore();
  const parameterDefs = PROVIDERS[provider].parameters;
  const currentModel = PROVIDERS[provider].models.find(m => m.id === model);

  return (
    <div className="flex flex-wrap gap-4">
      {parameterDefs.map((param) => {
        // max_tokens 는 모델별 출력 상한을 우선 사용
        const effectiveMax =
          param.key === 'max_tokens' && currentModel?.maxOutputTokens
            ? currentModel.maxOutputTokens
            : param.max;
        return (
          <ScrubberInput
            key={param.key}
            label={param.label}
            description={param.description}
            value={(parameters as Record<string, number>)[param.key] ?? param.defaultValue}
            onChange={(v) => setParameter(param.key, v)}
            min={param.min}
            max={effectiveMax}
            step={param.step}
          />
        );
      })}
    </div>
  );
}
