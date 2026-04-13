-- 플레이스홀더 문법 마이그레이션: {{변수}} → {{$변수}}
--
-- BREAKING CHANGE (커밋 1059d95): JSON 출력 포맷의 literal {{ }} 와의 충돌을
-- 막기 위해 플레이스홀더 변수 앞에 $ 접두사를 필수로 변경.
--
-- 이전 파서 정규식([a-zA-Z_\uAC00-\uD7A3][...])과 일치하는 패턴만 변환한다.
-- JSON literal({{ "key": ... }} / {{\n ... \n}} 등)은 공백/따옴표/줄바꿈 때문에
-- 위 정규식에 매칭되지 않으므로 영향받지 않는다.
--
-- 영향: prompts.template 컬럼만 변경. placeholders JSONB는 슬롯 이름만 저장하므로 변경 불필요.
-- prompt_results.resolved_prompt는 이미 치환된 결과이므로 변경 불필요.
--
-- 롤백: 아래 UPDATE에서 패턴을 '\{\{\$([a-zA-Z_가-힣][a-zA-Z0-9_가-힣]*)\}\}'로,
-- 치환 문자열을 '{{\1}}'로 바꿔 실행.

-- 변환 전 영향받는 행 수 확인 (실행 전 검토용 - 주석 해제하여 확인)
-- SELECT count(*) AS affected_rows FROM public.prompts
-- WHERE template ~ '\{\{[a-zA-Z_가-힣][a-zA-Z0-9_가-힣]*\}\}';

UPDATE public.prompts
SET
  template = regexp_replace(
    template,
    '\{\{([a-zA-Z_가-힣][a-zA-Z0-9_가-힣]*)\}\}',
    '{{$\1}}',
    'g'
  ),
  updated_at = now()
WHERE template ~ '\{\{[a-zA-Z_가-힣][a-zA-Z0-9_가-힣]*\}\}';

-- 변환 결과 검증 (실행 후 - 주석 해제하여 확인)
-- SELECT id, title, template FROM public.prompts
-- WHERE template LIKE '%{{$%' ORDER BY updated_at DESC LIMIT 10;
