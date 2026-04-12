-- API 키 저장 테이블
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'google', 'anthropic')),
  encrypted_key TEXT NOT NULL,
  key_preview TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- RLS 활성화
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 키만 조회" ON public.api_keys
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 키만 생성" ON public.api_keys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 키만 수정" ON public.api_keys
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 키만 삭제" ON public.api_keys
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
