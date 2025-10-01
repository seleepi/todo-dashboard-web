# Google OAuth 빠른 설정 가이드

현재 Google 로그인 버튼을 클릭하면 오류가 발생하는 이유는 **Google OAuth가 아직 설정되지 않았기 때문**입니다.

## 🔧 즉시 해결 방법

### 1단계: Google Cloud Console 설정

1. **Google Cloud Console 접속**
   - [https://console.cloud.google.com/](https://console.cloud.google.com/) 방문
   - Google 계정으로 로그인

2. **새 프로젝트 생성**
   - 상단의 프로젝트 선택 드롭다운 클릭
   - "새 프로젝트" 선택
   - 프로젝트 이름: `todo-dashboard` (또는 원하는 이름)
   - "만들기" 클릭

3. **OAuth 동의 화면 설정**
   - 좌측 메뉴: "API 및 서비스" → "OAuth 동의 화면"
   - "외부" 선택 후 "만들기"
   - **앱 정보** 입력:
     - 앱 이름: `TODO Dashboard`
     - 사용자 지원 이메일: (본인 이메일)
     - 개발자 연락처 정보: (본인 이메일)
   - "저장 후 계속" 클릭
   - **범위** 페이지: "저장 후 계속" (기본값 유지)
   - **테스트 사용자** 페이지: "저장 후 계속"

4. **OAuth 클라이언트 ID 생성**
   - 좌측 메뉴: "API 및 서비스" → "사용자 인증 정보"
   - "+ 사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
   - 애플리케이션 유형: **웹 애플리케이션**
   - 이름: `TODO Dashboard Web Client`

   **중요: 정확한 URL 입력**
   - **승인된 JavaScript 원본**:
     ```
     https://todo-dashboard.up.railway.app
     ```

   - **승인된 리디렉션 URI**:
     ```
     https://todo-dashboard-pocketbase.up.railway.app/api/oauth2-redirect
     ```

5. **클라이언트 정보 복사**
   - 생성 완료 후 나타나는 팝업에서:
   - **클라이언트 ID** 복사 (예: `123456789-abcdef.apps.googleusercontent.com`)
   - **클라이언트 시크릿** 복사 (예: `GOCSPX-abcdef123456`)

### 2단계: PocketBase 설정

1. **PocketBase 관리자 패널 접속**
   - [https://todo-dashboard-pocketbase.up.railway.app/_/](https://todo-dashboard-pocketbase.up.railway.app/_/)
   - 관리자 계정으로 로그인

2. **Google OAuth 설정**
   - 좌측 메뉴: "Settings" 클릭
   - "Auth providers" 탭 선택
   - **Google** 체크박스 ✅ 체크하여 활성화

   **설정 입력:**
   - **Client ID**: 1단계에서 복사한 클라이언트 ID
   - **Client Secret**: 1단계에서 복사한 클라이언트 시크릿

   **중요: Redirect URL 확인**
   - 자동으로 입력되는 Redirect URL이 다음과 같은지 확인:
     ```
     https://todo-dashboard-pocketbase.up.railway.app/api/oauth2-redirect
     ```

3. **설정 저장**
   - "Save changes" 또는 "변경사항 저장" 클릭

### 3단계: 설정 확인

1. **브라우저에서 테스트**
   - [https://todo-dashboard.up.railway.app/](https://todo-dashboard.up.railway.app/) 접속
   - "Google로 로그인" 버튼 클릭
   - 브라우저 개발자 도구(F12) → Console 탭에서 로그 확인

2. **예상되는 성공 로그:**
   ```
   Starting Google OAuth login...
   Fetching auth methods from PocketBase...
   Auth methods received: { authProviders: [...] }
   Available auth providers: [{ name: "google", ... }]
   Google provider found: { name: "google", authUrl: "..." }
   ```

3. **오류가 있다면:**
   - Console에서 구체적인 오류 메시지 확인
   - 아래 문제 해결 섹션 참조

## 🔍 문제 해결

### "Google OAuth provider is not configured" 오류
- **원인**: PocketBase에서 Google OAuth가 활성화되지 않음
- **해결**: 2단계 PocketBase 설정 재확인

### "Google 로그인 오류: Failed to fetch" 오류
- **원인**: PocketBase 서버 연결 문제
- **해결**: PocketBase URL 확인 (`https://todo-dashboard-pocketbase.up.railway.app`)

### 팝업이 열리지 않거나 즉시 닫힘
- **원인**: 리디렉션 URI 불일치
- **해결**: Google Cloud Console의 리디렉션 URI와 PocketBase 설정이 정확히 일치하는지 확인

### "invalid_client" 오류
- **원인**: 클라이언트 ID/시크릿 오류 또는 도메인 불일치
- **해결**:
  1. Google Cloud Console에서 클라이언트 ID/시크릿 재확인
  2. 승인된 JavaScript 원본에 `https://todo-dashboard.up.railway.app` 추가 확인

## ⚡ 임시 해결책

Google OAuth 설정이 복잡하다면, 현재 구현된 **이메일/비밀번호 회원가입**을 사용하세요:

1. [https://todo-dashboard.up.railway.app/](https://todo-dashboard.up.railway.app/) 접속
2. "계정이 없나요? 회원가입" 클릭
3. 이름, 이메일, 비밀번호 입력하여 즉시 회원가입

## 📞 도움이 필요하다면

설정 중 문제가 발생하면:
1. 브라우저 Console 로그 확인
2. PocketBase 관리자 패널에서 Auth providers 설정 재확인
3. Google Cloud Console에서 OAuth 클라이언트 설정 재확인

---

**참고**: Google OAuth 설정은 한 번만 하면 되며, 설정 완료 후 모든 사용자가 Google 계정으로 간편하게 로그인할 수 있습니다.