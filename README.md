# ok-my-prompt

AI 프롬프트를 테스트하고 최적화할 수 있는 웹 애플리케이션입니다.

다양한 AI 모델(OpenAI, Google Gemini, Anthropic Claude)에 프롬프트를 보내고, 플레이스홀더 조합을 통해 어떤 변형이 가장 좋은 결과를 내는지 비교할 수 있습니다.

## 주요 기능

- **멀티 모델 지원** — OpenAI(GPT-4o, GPT-3.5 Turbo 등), Google Gemini, Anthropic Claude 모델 선택
- **프롬프트 순열 시스템** — `{{변수이름}}` 플레이스홀더로 모든 옵션 조합을 자동 생성하여 한번에 테스트
- **배치 / 순서 섞기 모드** — 같은 프롬프트를 N회 반복하거나, 플레이스홀더 위치를 바꿔서 순서 효과 테스트
- **파라미터 조절** — Temperature, Max Tokens, Top P 등 슬라이더 바로 직관적 조절 (호버 시 설명 표시)
- **결과 비교** — 그리드/테이블 뷰, 별점 평가, JSON 내보내기
- **비용 예상** — 실행 전 예상 API 비용 표시
- **프롬프트 저장** — 로그인 후 Supabase에 저장, 비로그인 시 세션에 최근 5개 유지
- **API 키 관리** — 설정 페이지에서 등록, 15자 이후 마스킹 표시
- **다크모드** — 시스템 테마 자동 감지 + 수동 전환

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router), React 19, TypeScript |
| 스타일링 | Tailwind CSS 4 |
| 상태관리 | Zustand |
| 인증/DB | Supabase (Google OAuth + PostgreSQL) |
| AI SDK | openai, @google/genai, @anthropic-ai/sdk |
| 다크모드 | next-themes |
| 배포 | Vercel |

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local.example`을 복사하여 `.env.local`을 만들고 Supabase 키를 입력합니다.

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Supabase 데이터베이스 설정

`supabase/migrations/` 디렉토리의 SQL 파일을 순서대로 Supabase SQL Editor에서 실행합니다.

```
00001_create_profiles.sql
00002_create_api_keys.sql
00003_create_prompts.sql
00004_create_prompt_results.sql
```

### 4. Google OAuth 설정 (선택)

1. [Google Cloud Console](https://console.cloud.google.com/)에서 OAuth 2.0 클라이언트 ID 생성
2. 승인된 리디렉션 URI: `https://<your-project>.supabase.co/auth/v1/callback`
3. Supabase 대시보드 → Authentication → Providers → Google 활성화 후 Client ID/Secret 입력

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── (app)/              # 사이드바 레이아웃 (텍스트 생성, 이미지 분석, 설정, 프롬프트)
│   ├── (auth)/             # 로그인, OAuth 콜백
│   └── api/ai/             # AI 프록시 API 라우트 (openai, google, anthropic)
├── components/             # React 컴포넌트
│   ├── prompt/             # 프롬프트 에디터, 플레이스홀더, 순열 미리보기
│   ├── model/              # 모델 선택, 파라미터 슬라이더
│   ├── results/            # 결과 그리드, 별점, 진행률, 비용 예상
│   ├── settings/           # API 키 관리
│   ├── auth/               # 로그인/사용자 메뉴
│   └── layout/             # 사이드바, 헤더, 프로바이더
├── lib/                    # 유틸리티
│   ├── ai/                 # AI 프로바이더 래퍼 (OpenAI, Google, Anthropic)
│   ├── prompts/            # 파서, 순열 알고리즘, 세션 스토어
│   └── supabase/           # Supabase 클라이언트
├── stores/                 # Zustand 상태 관리
├── hooks/                  # 커스텀 훅
└── types/                  # TypeScript 타입 정의
```

## 라이선스

MIT License - [LICENSE](LICENSE) 참고
