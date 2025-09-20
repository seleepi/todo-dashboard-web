# Google OAuth 디버깅 가이드

## 🔍 현재 상황
- ✅ PocketBase 연결: 정상
- ✅ Google OAuth 설정: 활성화됨
- ✅ 팝업 생성: 정상
- ❌ redirect_uri: 여전히 비어있음

## 🛠️ Google Cloud Console 정확한 설정

### 1단계: OAuth 클라이언트 편집
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **API 및 서비스** → **사용자 인증 정보**
3. **"todo-dashboard-login"** 클릭 (또는 해당 OAuth 클라이언트)

### 2단계: 리디렉션 URI 정확한 설정
**중요: 정확히 다음 설정만 유지하세요:**

**승인된 JavaScript 원본:**
```
https://todo-dashboard.up.railway.app
https://todo-dashboard-pocketbase.up.railway.app
```

**승인된 리디렉션 URI:**
```
https://todo-dashboard-pocketbase.up.railway.app/api/oauth2-redirect
```

### 3단계: 주의사항
- **끝에 슬래시(/) 없음**
- **정확한 도메인명 사용**
- **https:// 사용 (http:// 아님)**
- **기존의 다른 URI들은 모두 삭제**

### 4단계: 저장 후 대기
- **"저장" 클릭**
- **5-10분 대기** (Google에서 설정이 전파되는 시간)

## 🔧 PocketBase 설정 재확인

### Client Secret 재설정
1. Google Cloud Console에서 **새로운 Client Secret 생성**
2. PocketBase에서 **새로운 Client Secret 입력**
3. **Save changes**

### 완전 재설정 (최후 수단)
1. PocketBase에서 Google OAuth **비활성화**
2. **Save changes**
3. 다시 **활성화**
4. Client ID, Client Secret **재입력**
5. **Save changes**

## 🚨 문제가 계속되는 경우

### 새로운 OAuth 클라이언트 생성
기존 클라이언트에 문제가 있을 수 있으므로:

1. Google Cloud Console에서 **새로운 OAuth 클라이언트 ID 생성**
2. **웹 애플리케이션** 선택
3. 올바른 URI 설정
4. 새로운 Client ID/Secret을 PocketBase에 입력

## 📋 체크리스트

설정 전 반드시 확인:
- [ ] Google Cloud Console에서 정확한 리디렉션 URI 설정
- [ ] 기존의 잘못된 URI들 모두 삭제
- [ ] PocketBase에 올바른 Client ID 입력
- [ ] PocketBase에 올바른 Client Secret 입력
- [ ] Google OAuth 활성화
- [ ] 설정 저장 후 5-10분 대기

## 🎯 예상 결과

설정이 올바르면:
```
"redirect_uri=https%3A%2F%2Ftodo-dashboard-pocketbase.up.railway.app%2Fapi%2Foauth2-redirect"
```

현재 (문제 상황):
```
"redirect_uri="
```

---

**중요**: Google Cloud Console 설정 변경 후 반드시 5-10분 대기하세요!