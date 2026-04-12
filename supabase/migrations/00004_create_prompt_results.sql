-- 프롬프트 실행 결과 테이블
CREATE TABLE public.prompt_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL,
  permutation_index INT NOT NULL,
  resolved_prompt TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  response TEXT,
  tokens_used JSONB,
  latency_ms INT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prompt_results_prompt_id ON public.prompt_results(prompt_id);
CREATE INDEX idx_prompt_results_user_id ON public.prompt_results(user_id);
CREATE INDEX idx_prompt_results_batch_id ON public.prompt_results(batch_id);

-- RLS 활성화
ALTER TABLE public.prompt_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 결과만 조회" ON public.prompt_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 결과만 생성" ON public.prompt_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 결과만 수정" ON public.prompt_results
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 결과만 삭제" ON public.prompt_results
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
