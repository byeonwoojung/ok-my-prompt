'use client';

import { useCallback, useRef } from 'react';
import { usePromptStore } from '@/stores/prompt-store';

export function PromptEditor() {
  const { template, setTemplate } = usePromptStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTemplate(e.target.value);
    },
    [setTemplate]
  );

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    // 높이 리셋(auto) → 재계산 과정에서 페이지 레이아웃이 흔들려
    // 윈도우 스크롤이 위로 점프하는 현상을 방지하기 위해 스크롤 위치 보존.
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
    if (window.scrollY !== scrollY || window.scrollX !== scrollX) {
      window.scrollTo(scrollX, scrollY);
    }
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">프롬프트</label>
        <span className="text-xs text-muted-foreground">
          {'{{$변수이름}}'} 형식으로 플레이스홀더를 추가하세요. JSON {'{{ }}'} 등과 명확히 구분됩니다.
        </span>
      </div>
      <textarea
        ref={textareaRef}
        value={template}
        onChange={(e) => {
          handleChange(e);
          adjustHeight();
        }}
        placeholder={"당신은 {{$역할}}입니다. 다음 JSON 형식으로 응답하세요: {\"result\": \"...\"}"}
        className="w-full min-h-[120px] rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
        spellCheck={false}
      />
    </div>
  );
}
