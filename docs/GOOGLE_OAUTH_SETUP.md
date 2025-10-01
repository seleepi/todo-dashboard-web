# Google OAuth 설정 가이드

Google OAuth를 통한 회원가입/로그인 기능이 구현되었습니다. 다음 단계를 따라 설정을 완료해주세요.

## 1. Google Cloud Console 설정

### 1.1 Google Cloud Console에서 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보"로 이동

### 1.2 OAuth 2.0 클라이언트 ID 생성
1. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택
2. 애플리케이션 유형: "웹 애플리케이션" 선택
3. 이름: 적절한 이름 입력 (예: "TODO Dashboard")
4. 승인된 JavaScript 원본:
   - `http://localhost:3000` (개발용)
   - `https://your-domain.com` (프로덕션용)
5. 승인된 리디렉션 URI:
   - `http://localhost:3000/oauth2-redirect` (개발용)
   - `https://your-domain.com/oauth2-redirect` (프로덕션용)

### 1.3 클라이언트 ID 복사
생성된 OAuth 2.0 클라이언트의 클라이언트 ID를 복사해두세요.

## 2. PocketBase 설정

### 2.1 PocketBase 관리자 패널 접속
1. PocketBase 실행: `./pocketbase serve`
2. 관리자 패널 접속: `http://127.0.0.1:8090/_/`

### 2.2 OAuth2 Provider 설정
1. 관리자 패널에서 "Settings" > "Auth providers" 이동
2. "Google" 활성화
3. 다음 정보 입력:
   - **Client ID**: Google Cloud Console에서 복사한 클라이언트 ID
   - **Client Secret**: Google Cloud Console에서 복사한 클라이언트 시크릿
   - **Redirect URL**: `https://your-pocketbase-url.com/api/oauth2-redirect`

### 2.3 사용자 컬렉션 확인
`users` 컬렉션이 다음 필드를 포함하는지 확인:
- `id` (자동 생성)
- `email` (text, required)
- `name` (text)
- `avatar` (url, optional)

## 3. 환경변수 설정

`.env.local` 파일에 Google Client ID 추가:

```env
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase-url.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## 4. 기능 확인

### 4.1 로그인 페이지 확인
1. 개발 서버 실행: `npm run dev`
2. `http://localhost:3000` 접속
3. 로그인 페이지에서 "Google로 로그인" 버튼 확인

### 4.2 Google OAuth 플로우 테스트
1. "Google로 로그인" 버튼 클릭
2. Google 계정 선택/로그인
3. 권한 승인
4. 자동으로 대시보드로 리디렉션 확인

## 5. 구현된 기능

### 5.1 회원가입
- Google 계정으로 처음 로그인하면 자동으로 사용자 계정 생성
- 사용자 정보는 PocketBase `users` 컬렉션에 저장

### 5.2 로그인
- 기존 Google 계정으로 로그인 가능
- 이메일/비밀번호 로그인도 계속 지원

### 5.3 사용자 정보
- Google에서 제공하는 이메일, 이름, 프로필 사진 정보 자동 저장
- PocketBase 사용자 모델과 완전 호환

## 6. 보안 고려사항

### 6.1 HTTPS 사용
프로덕션 환경에서는 반드시 HTTPS를 사용해야 합니다.

### 6.2 도메인 제한
Google Cloud Console에서 승인된 도메인만 OAuth 사용 가능하도록 설정되어 있습니다.

### 6.3 토큰 관리
PocketBase에서 JWT 토큰 관리를 자동으로 처리합니다.

## 7. 문제 해결

### 7.1 "Google OAuth provider is not configured" 오류
- PocketBase 관리자 패널에서 Google OAuth 설정 확인
- Client ID, Client Secret이 올바르게 입력되었는지 확인

### 7.2 리디렉션 오류
- Google Cloud Console의 승인된 리디렉션 URI 확인
- PocketBase OAuth2 설정의 Redirect URL 확인

### 7.3 팝업 차단
- 브라우저의 팝업 차단 설정 확인
- 사용자에게 팝업 허용 안내

## 8. 추가 개선사항

현재 구현은 기본적인 Google OAuth 기능을 제공합니다. 필요에 따라 다음 기능들을 추가할 수 있습니다:

- 다른 OAuth 제공자 (Facebook, GitHub 등) 추가
- 사용자 프로필 관리 기능
- 계정 연결/해제 기능
- 관리자 권한 관리

---

이제 Google OAuth를 통한 회원가입과 로그인이 완전히 구현되었습니다. 사용자는 Google 계정을 사용하여 쉽게 서비스에 가입하고 로그인할 수 있습니다.