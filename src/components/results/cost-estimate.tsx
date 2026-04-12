'use client';

import { useMemo } from 'react';
import { usePromptStore } from '@/stores/prompt-store';
import { MODEL_PRICING } from '@/lib/constants';
import { computeStats } from '@/lib/prompts/permutations';

export function CostEstimate() {
  const { template, slots, runMode, model, parameters, batchCount } = usePromptStore();

  const estimate = useMemo(() => {
    const pricing = MODEL_PRICING[model];
    if (!pricing) return null;

    const validSlots = slots.filter(s => s.options.some(o => o.trim()));
    const cleanedSlots = validSlots.map(s => ({ ...s, options: s.options.filter(o => o.trim()) }));
    const stats = computeStats(cleanedSlots, runMode === 'shuffle');

    const effectiveBatch = runMode === 'batch' ? batchCount : 1;
    const totalRequests = stats.totalPermutations * effectiveBatch;

    if (totalRequests === 0) return null;

    const avgPromptLength = template.length;
    const estimatedInputTokens = Math.ceil(avgPromptLength / 2);
    const maxOutputTokens = (parameters as Record<string, number>).max_tokens ?? 1024;

    const inputCost = (estimatedInputTokens / 1000) * pricing.input * totalRequests;
    const outputCost = (maxOutputTokens / 1000) * pricing.output * totalRequests;
    const totalCost = inputCost + outputCost;

    return { totalRequests, totalCost };
  }, [template, slots, runMode, model, parameters, batchCount]);

  if (!estimate || estimate.totalRequests <= 1) return null;

  return (
    <div className="text-xs text-muted-foreground">
      예상 비용: ~${estimate.totalCost.toFixed(4)}
      <span className="ml-1">({estimate.totalRequests}건)</span>
    </div>
  );
}
