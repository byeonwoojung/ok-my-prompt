'use client';

import { usePromptStore } from '@/stores/prompt-store';

export function PromptEditor() {
  const { template, setTemplate } = usePromptStore();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">프롬프트</label>
        <span className="text-xs text-muted-foreground">
          {'{{$변수이름}}'} 형식으로 플레이스홀더를 추가하세요. JSON {'{{ }}'} 등과 명확히 구분됩니다.
        </span>
      </div>
      <textarea
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        placeholder={"당신은 {{$역할}}입니다. 다음 JSON 형식으로 응답하세요: {\"result\": \"...\"}"}
        className="w-full min-h-[120px] rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono [field-sizing:content]"
        spellCheck={false}
      />
    </div>
  );
}
