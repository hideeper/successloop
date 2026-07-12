# SuccessLoop

나의 진정한 목표를 매일 달성한다.

목표를 잠재의식에 각인시켜, 뇌가 스스로 답을 찾게 만드는 목표 설정·리마인드 서비스.

## 스택
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 (PWA)
- Supabase (PostgreSQL + Auth + RLS + Storage)
- 모바일 확장: Expo + Expo Notifications (동일 Supabase 백엔드)

## 문서
- `PRD.md` — 제품 요구사항
- `WORKFLOW.md` — 개발 워크플로우 규칙
- `legal/` — 약관·개인정보 처리방침 초안
- `supabase/migrations/` — DB 스키마

## 개발 시작

```bash
# 1) 의존성 설치
npm install

# 2) 환경변수 설정 (Supabase 프로젝트 생성 후)
cp .env.local.example .env.local   # 값 채우기

# 3) DB 스키마 적용 (Supabase 대시보드 SQL 에디터에 붙여넣거나 CLI)
#    supabase/migrations/0001_init.sql

# 4) 개발 서버
npm run dev            # http://localhost:3000

# 검증
npm run typecheck      # 타입 체크
npm run build          # 빌드
npm run lint           # 린트
```

## 배포
- **URL**: https://success-system.vercel.app
- Vercel 계정: `hideeper-s-projects` (GitHub 연동 없이 CLI 직접 배포)
- 환경변수: Vercel 대시보드에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 등록됨

코드 수정 후 재배포:
```bash
npx vercel --prod --scope hideeper-s-projects
```

## 상태
- 구현 완료: 로그인/회원가입(이메일, 실제 Supabase Auth) · 1단계(설명카드+입력폼, 예시팝업) · 잠재의식 Daily on(SMART) · 오늘 허브(리마인드 배너) · 읽기 화면(아침/일상/밤) · PIN 설정·잠금(해시) · 목표 탭(열람/수정/새로작성, 버전보존) · 설정(로그아웃)
- 데이터: Supabase Postgres + RLS 전면 적용, end-to-end 검증 완료
- 미구현: 소셜 로그인(Google/Apple/Kakao 실제 OAuth) · 웹 푸시 알림 · 관리자 대시보드 · 문의하기/약관보기/데이터내보내기(스텁 상태) · GitHub 자동배포 연동
