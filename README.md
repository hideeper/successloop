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
- Vercel 계정: `hideeper-s-projects`
- GitHub 저장소: https://github.com/hideeper/successloop (Public) — **`main`에 push하면 자동 배포**
- 환경변수: Vercel 대시보드에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 등록됨

일반적인 작업 흐름:
```bash
git add <파일>
git commit -m "설명"
git push            # → Vercel이 자동으로 감지해 배포
```

수동 배포가 필요하면:
```bash
npx vercel --prod --scope hideeper-s-projects
```

⚠️ **주의**: DB 비밀번호 등 민감정보가 담긴 파일(`supabase 깃헙, rdb 등 정보.png`)은 `.gitignore`로 제외되어 있습니다. 새 스크린샷·비밀번호 파일을 프로젝트 폴더에 저장할 땐 커밋 전 반드시 확인하세요.

## 웹 푸시 알림
- VAPID 기반 브라우저 푸시. 설정 화면에서 "알림 켜기" → 구독 등록, "테스트 발송"으로 즉시 확인 가능.
- 정시 리마인드(아침 07:00 · 밤 22:00 KST)는 `vercel.json`의 Cron이 `/api/cron/send-reminders`를 호출해 발송.
- ⚠️ **Vercel Hobby(무료) 플랜은 크론을 하루 1회로 제한** — 그래서 15분 간격이 아니라, KST 07:00/22:00에 맞춘 **고정 UTC 시각 크론 2개**(`0 22 * * *`, `0 13 * * *`)로 구성. 현재는 사실상 한국 사용자 기준으로만 정확히 동작(다른 시간대 사용자 지원은 Pro 플랜 업그레이드 또는 외부 크론 서비스 필요).
- 발송 중복 방지: `usage_events`에 `push_morning_sent`/`push_night_sent` 기록해 같은 날 중복 발송 방지.

## 상태
- 구현 완료: 로그인/회원가입(이메일, 실제 Supabase Auth) · 1단계(설명카드+입력폼, 예시팝업) · 잠재의식 Daily on(SMART) · 오늘 허브(리마인드 배너) · 읽기 화면(아침/일상/밤) · PIN 설정·잠금(해시) · 목표 탭(열람/수정/새로작성, 버전보존) · 설정(로그아웃) · **웹 푸시 알림**(정시+테스트발송)
- 데이터: Supabase Postgres + RLS 전면 적용, end-to-end 검증 완료
- 배포: Vercel + GitHub 자동배포 연동 완료
- 미구현: 소셜 로그인(Google/Apple/Kakao 실제 OAuth) · 랜덤 알림·방해금지 커스터마이징 · 관리자 대시보드 · 문의하기/약관보기/데이터내보내기(스텁 상태)

