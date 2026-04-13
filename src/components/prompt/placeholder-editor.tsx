'use client';

import { useRef } from 'react';
import { usePromptStore } from '@/stores/prompt-store';

function SlotEditor({
  name,
  options,
  onUpdateOptions,
}: {
  name: string;
  options: string[];
  onUpdateOptions: (options: string[]) => void;
}) {
  const lastRef = useRef<HTMLTextAreaElement>(null);

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    onUpdateOptions(updated);
  };

  const removeOption = (index: number) => {
    if (options.length <= 1) return;
    onUpdateOptions(options.filter((_, i) => i !== index));
  };

  const addOption = () => {
    onUpdateOptions([...options, '']);
    setTimeout(() => lastRef.current?.focus(), 0);
  };

  return (
    <div className="rounded-lg border border-border bg-card/50">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-mono font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          {'{{$' + name + '}}'}
        </span>
        <span className="text-xs text-muted-foreground">
          {options.filter(o => o.trim()).length}개 옵션
        </span>
      </div>

      {/* 옵션 목록 */}
      <div className="divide-y divide-border">
        {options.map((option, index) => (
          <div key={index} className="flex items-start gap-2 px-3 py-2">
            <span className="shrink-0 mt-2 text-[10px] text-muted-foreground/50 w-4 text-right font-mono">
              {index + 1}
            </span>
            <textarea
              ref={index === options.length - 1 ? lastRef : undefined}
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`옵션 ${index + 1}`}
              rows={1}
              className="flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring resize-none overflow-hidden [field-sizing:content]"
            />
            {options.length > 1 && (
              <button
                onClick={() => removeOption(index)}
                className="shrink-0 mt-1.5 p-0.5 text-muted-foreground/30 hover:text-destructive transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 하단 추가 버튼 */}
      <button
        onClick={addOption}
        className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-accent/50 border-t border-dashed border-border transition-colors rounded-b-lg"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        옵션 추가
      </button>
    </div>
  );
}

export function PlaceholderEditor() {
  const { slots, updateSlotOptions } = usePromptStore();

  if (slots.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="h-px bg-border" />
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">플레이스홀더 옵션</h3>
        <p className="text-[10px] text-muted-foreground">
          각 자리에 들어갈 텍스트를 입력하세요. 실행 시 모든 조합이 테스트됩니다.
        </p>
      </div>
      {/* 항상 세로 배치 */}
      <div className="space-y-3">
        {slots.map((slot) => (
          <SlotEditor
            key={slot.name}
            name={slot.name}
            options={slot.options.length > 0 ? slot.options : ['']}
            onUpdateOptions={(options) => updateSlotOptions(slot.name, options)}
          />
        ))}
      </div>
    </div>
  );
}
