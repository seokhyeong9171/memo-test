# 공용 메모장

이름 / 수정 비밀번호 / 내용으로 메모를 남기는 모바일 친화 공용 메모장.
Next.js(App Router) + Upstash Redis. 비밀번호는 scrypt 해시로 저장됩니다.

## 로컬 실행
```bash
npm install
# .env.local 에 Upstash 값 입력
# UPSTASH_REDIS_REST_URL=...
# UPSTASH_REDIS_REST_TOKEN=...
npm run dev
```

## Git
```bash
git init
git add .
git commit -m "init: 공용 메모장"
git branch -M main
git remote add origin <GitHub 저장소 주소>
git push -u origin main
```

## Vercel 배포
1. vercel.com → Add New → Project → 위 GitHub 저장소 Import
2. 배포 후 프로젝트의 **Storage** 탭 → Marketplace에서 **Upstash Redis** 생성/연결
   (환경변수가 자동 주입됩니다)
3. **Redeploy** 한 번 하면 끝. 이후 `git push` 할 때마다 자동 배포됩니다.
