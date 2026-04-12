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
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
    }
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">프롬프트</label>
        <span className="text-xs text-muted-foreground">
          {'{{변수이름}}'} 형식으로 플레이스홀더를 추가하세요. 일반 {'{ }'} 중괄호와 구분됩니다.
        </span>
      </div>
      <textarea
        ref={textareaRef}
        value={template}
        onChange={(e) => {
          handleChange(e);
          adjustHeight();
        }}
        placeholder={"당신은 {{역할}}입니다. 다음 JSON 형식으로 응답하세요: {\"result\": \"...\"}"}
        className="w-full min-h-[120px] rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
        spellCheck={false}
      />
    </div>
  );
}
