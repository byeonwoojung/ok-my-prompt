# ok-my-prompt

AI 프롬프트를 테스트하고 최적화할 수 있는 웹 애플리케이션입니다.

다양한 AI 모델(OpenAI, Google Gemini, Anthropic Claude)에 프롬프트를 보내고, 플레이스홀더 조합을 통해 어떤 변형이 가장 좋은 결과를 내는지 비교할 수 있습니다.

## 주요 기능

- **멀티 모델 지원** — OpenAI(GPT-4o, GPT-3.5 Turbo, o1, o3 등), Google Gemini, Anthropic Claude 모델 선택
- **프롬프트 순열 시스템** — `{{변수이름}}` 플레이스홀더로 모든 옵션 조합을 자동 생성하여 한번에 테스트 (일반 `{중괄호}`와 구분)
- **배치 / 순서 섞기 모드** — 같은 프롬프트를 N회 반복하거나, 플레이스홀더 위치를 바꿔서 순서 효과 테스트 (둘 중 택1)
- **스트리밍 응답** — SSE 기반 실시간 글자 단위 표시
- **이미지 분석** — 이미지 업로드(드래그앤드롭/붙여넣기) + 비전 모델 테스트
- **파라미터 조절** — Temperature, Max Tokens, Top P 등 슬라이더 바로 직관적 조절 (호버 시 설명 표시)
- **결과 비교** — 그리드/테이블 뷰, 별점 평가, JSON 내보내기
- **비용 예상** — 실행 전 예상 API 비용 표시
- **프롬프트 저장** — 로그인 후 Supabase에 저장, 비로그인 시 세션에 최근 5개 유지
- **API 키 관리** — 서버사이드 AES-256-GCM 암호화 저장, 15자 이후 마스킹 표시
- **다크모드** — 시스템 테마 자동 감지 + 수동 전환
- **모바일 대응** — 반응형 사이드바 (모바일: 슬라이드 메뉴)
- **키보드 단축키** — `Cmd+Enter` 실행, `Cmd+S` 저장

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router), React 19, TypeScript |
| 스타일링 | Tailwind CSS 4 |
| 상태관리 | Zustand |
| 인증/DB | Supabase (Google OAuth + PostgreSQL + RLS) |
| AI SDK | openai, @google/genai, @anthropic-ai/sdk |
| 알림 | sonner (토스트) |
| 다크모드 | next-themes |
| 배포 | Vercel |

## 보안

- **API 키 암호화** — 사용자 API 키는 서버사이드에서 AES-256-GCM으로 암호화 후 Supabase에 저장. 복호화는 AI 호출 시 서버에서만 수행.
- **RLS (Row Level Security)** — 모든 테이블에 사용자별 접근 제한 정책 적용
- **서버 프록시** — AI API 호출은 모두 Next.js API Route를 통해 프록시. 클라이언트에서 직접 AI API를 호출하지 않음.
- **입력 검증** — 프로바이더, 모델, 배치 카운트 등 서버사이드 검증
- **비로그인 사용자** — API 키를 sessionStorage에 임시 저장 (탭 닫으면 삭제). 로그인 시 암호화 저장으로 자동 이전.

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

> `SUPABASE_SERVICE_ROLE_KEY`는 API 키 암호화에 사용됩니다. 절대 클라이언트에 노출되지 않습니다.

### 3. Supabase 데이터베이스 설정

`supabase/migrations/` 디렉토리의 SQL 파일을 순서대로 Supabase SQL Editor에서 실행합니다.

```
00001_create_profiles.sql   — 프로필 테이블 + 자동 생성 트리거
00002_create_api_keys.sql   — API 키 저장 (암호화)
00003_create_prompts.sql    — 프롬프트 저장
00004_create_prompt_results.sql — 실행 결과 저장
```

### 4. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 OAuth 2.0 클라이언트 ID 생성 (무료)
2. 애플리케이션 유형: 웹 애플리케이션
3. 승인된 리디렉션 URI: `https://<your-project>.supabase.co/auth/v1/callback`
4. Supabase 대시보드 → Authentication → Providers → Google 활성화 후 Client ID/Secret 입력

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── (app)/              # 사이드바 레이아웃
│   │   ├── text-generation/ # 텍스트 생성 (프롬프트 순열 테스트)
│   │   ├── image-analysis/  # 이미지 분석 (비전 모델)
│   │   ├── settings/        # API 키 관리
│   │   └── prompts/         # 저장된 프롬프트 목록/상세
│   ├── (auth)/              # 로그인, OAuth 콜백
│   └── api/
│       ├── ai/              # AI 프록시 (openai, google, anthropic)
│       └── keys/            # API 키 암호화 저장/삭제
├── components/
│   ├── prompt/              # 에디터, 플레이스홀더, 순열 미리보기, 저장
│   ├── model/               # 모델 선택, 파라미터 슬라이더
│   ├── results/             # 결과 그리드, 별점, 진행률, 비용 예상
│   ├── settings/            # API 키 폼
│   ├── auth/                # 로그인/사용자 메뉴
│   ├── image/               # 이미지 업로드
│   └── layout/              # 사이드바, 헤더, 프로바이더
├── lib/
│   ├── ai/                  # AI 래퍼, 스트리밍, API 키 조회
│   ├── prompts/             # 파서, 순열 알고리즘, 세션 스토어
│   ├── supabase/            # 클라이언트/서버/미들웨어
│   └── crypto.ts            # AES-256-GCM 암호화
├── stores/                  # Zustand 상태 관리
├── hooks/                   # use-auth, use-ai-request, use-session-sync
└── types/                   # TypeScript 타입
```

## 라이선스

MIT License - [LICENSE](LICENSE) 참고
