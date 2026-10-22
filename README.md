# 이름 삼행시

이름을 넣으면 Claude가 삼행시를 지어 주는 웹사이트입니다.

- `index.html`: 화면
- `api/poem.js`: Claude API를 호출하는 서버 함수 (API 키는 서버에만 있고 방문자에게 보이지 않음)

## Vercel에 배포하기

1. 이 폴더를 GitHub 저장소에 올립니다.
2. https://vercel.com 에 로그인 → **Add New → Project** → 저장소 선택 → **Deploy**.
3. 프로젝트 **Settings → Environment Variables**에 추가:
   - Name: `ANTHROPIC_API_KEY`
   - Value: https://console.anthropic.com 에서 만든 API 키
4. **Deployments** 탭에서 최신 배포를 **Redeploy** 하면 끝. `https://<프로젝트이름>.vercel.app` 주소가 생깁니다.

GitHub 없이 하려면 이 폴더에서 `npx vercel` 을 실행한 뒤, 3번처럼 키를 넣고 `npx vercel --prod` 로 다시 배포하세요.

## 비용 줄이기

`api/poem.js`의 `model`을 `"claude-haiku-5-5"`로 바꾸면 훨씬 저렴해집니다. 이때 `betas`와 `fallbacks` 두 줄은 지워 주세요.
Anthropic 콘솔에서 월 사용 한도(Spend limit)를 걸어 두는 것을 권장합니다.
