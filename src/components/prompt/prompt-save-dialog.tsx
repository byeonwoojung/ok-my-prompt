'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { usePromptStore } from '@/stores/prompt-store';
import { createClient } from '@/lib/supabase/client';
import { saveSessionPrompt } from '@/lib/prompts/session-store';

export function PromptSaveDialog() {
  const { isLoggedIn, user } = useAuth();
  const { template, slots, provider, model, parameters } = usePromptStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [nextUntitled, setNextUntitled] = useState(1);

  const placeholderTitle = `제목 없음 ${nextUntitled}`;

  // Cmd+S 단축키로 열기
  useEffect(() => {
    const handler = () => { if (template.trim()) setOpen(true); };
    window.addEventListener('open-save-dialog', handler);
    return () => window.removeEventListener('open-save-dialog', handler);
  }, [template]);

  const handleSave = async () => {
    const finalTitle = title.trim() || placeholderTitle;

    if (!isLoggedIn) {
      // 비로그인: sessionStorage에 저장
      saveSessionPrompt({
        id: crypto.randomUUID(),
        template,
        placeholders: slots,
        model_config: { provider, model, parameters: parameters as Record<string, number> },
        created_at: new Date().toISOString(),
      });
      setOpen(false);
      setTitle('');
      setDescription('');
      toast.success('세션에 임시 저장되었습니다');
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('prompts').insert({
        user_id: user!.id,
        title: finalTitle,
        description: description.trim() || null,
        prompt_type: 'text',
        template,
        placeholders: slots,
        model_config: { provider, model, parameters },
      });

      if (error) throw error;

      setOpen(false);
      setTitle('');
      setDescription('');
      setNextUntitled(prev => prev + 1);
      toast.success('프롬프트가 저장되었습니다');
    } catch (err) {
      toast.error('저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (!template.trim()) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
      >
        저장
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">프롬프트 저장</h2>

            {!isLoggedIn && (
              <div className="mb-4 rounded-md bg-yellow-500/10 px-3 py-2 text-sm text-yellow-600 dark:text-yellow-400">
                로그인하지 않은 상태입니다. 세션에 임시 저장됩니다.
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  제목 <span className="text-destructive">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={placeholderTitle}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium">설명 (선택)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="프롬프트에 대한 설명을 입력하세요"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
