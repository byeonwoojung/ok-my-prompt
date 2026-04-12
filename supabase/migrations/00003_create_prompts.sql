-- 프롬프트 저장 테이블
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('text', 'image')),
  template TEXT NOT NULL,
  placeholders JSONB NOT NULL DEFAULT '[]',
  model_config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prompts_user_id ON public.prompts(user_id);

-- RLS 활성화
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 프롬프트만 조회" ON public.prompts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 프롬프트만 생성" ON public.prompts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 프롬프트만 수정" ON public.prompts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 프롬프트만 삭제" ON public.prompts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
