# PocketBase 배포 및 관리 가이드

## 현재 상황 개요

이 프로젝트는 두 개의 분리된 GitHub 레포지토리를 사용합니다:
- **웹 애플리케이션**: `https://github.com/seleepi/todo-dashboard-web`
- **PocketBase 데이터베이스**: `https://github.com/seleepi/todo-dashboard-pocketbase`

Railway에서도 두 서비스가 분리되어 배포됩니다.

## 문제 해결 기록

### 2024-09-29: Docker COPY 명령어 오류 해결

**문제**:
- PocketBase 배포가 갑자기 실패
- Docker COPY 명령어에서 shell redirection(`2>/dev/null || true`) 사용으로 인한 오류

**해결 방법**:
- 문제가 있던 라인: `COPY pb_migrations/ ./pb_migrations/ 2>/dev/null || true`
- 해결책: `RUN mkdir -p /pb/pb_migrations`로 대체

**수행한 작업**:
1. 로컬의 수정된 `Dockerfile`을 임시 위치에 복사
2. GitHub `todo-dashboard-pocketbase` 레포지토리에 푸시
3. Railway 자동 재배포 트리거

## 파일 위치 및 백업 상태

### 원본 파일 위치
```
C:\Users\sodi2\PycharmProjects\todo-dashboard-web\pocketbase\
├── Dockerfile                    # 수정된 최신 버전
├── pb_data/                      # 로컬 데이터베이스 파일들
├── pb_migrations/                # 마이그레이션 파일들
├── pocketbase.exe                # Windows 실행 파일
├── railway.json                  # Railway 배포 설정
└── DEPLOYMENT_GUIDE.md           # 이 문서
```

### 백업된 위치
- **GitHub**: `https://github.com/seleepi/todo-dashboard-pocketbase`
- **Railway**: 자동 배포됨
- **로컬 원본**: 변경사항 없이 유지됨

## PocketBase 변경사항 커밋 방법

현재 로컬 pocketbase 폴더는 웹 레포지토리에 포함되어 있지만, 실제 배포는 분리된 pocketbase 레포지토리에서 이루어집니다.

### 방법 1: 수동 복사 (현재 사용 중)

```bash
# 1. pocketbase 레포지토리 클론
git clone https://github.com/seleepi/todo-dashboard-pocketbase.git temp-pocketbase
cd temp-pocketbase

# 2. 로컬 파일 복사
cp "C:\Users\sodi2\PycharmProjects\todo-dashboard-web\pocketbase\Dockerfile" ./Dockerfile.pocketbase
cp "C:\Users\sodi2\PycharmProjects\todo-dashboard-web\pocketbase\railway.json" ./railway.json
# 필요한 경우 다른 파일들도 복사

# 3. 커밋 & 푸시
git add .
git commit -m "Update pocketbase configuration"
git push origin main

# 4. 임시 폴더 삭제
cd .. && rm -rf temp-pocketbase
```

### 방법 2: Git Submodule 설정 (권장)

```bash
# web 레포지토리에서 pocketbase를 submodule로 설정
cd "C:\Users\sodi2\PycharmProjects\todo-dashboard-web"
rm -rf pocketbase
git submodule add https://github.com/seleepi/todo-dashboard-pocketbase.git pocketbase

# 이후 pocketbase 변경사항 커밋
cd pocketbase
git add .
git commit -m "Update pocketbase files"
git push origin main

# 웹 레포지토리에서 submodule 업데이트 커밋
cd ..
git add pocketbase
git commit -m "Update pocketbase submodule"
git push
```

### 방법 3: PowerShell 스크립트 자동화

`sync-pocketbase.ps1` 스크립트 생성:

```powershell
# PocketBase 동기화 스크립트
$webRepo = "C:\Users\sodi2\PycharmProjects\todo-dashboard-web"
$tempDir = "C:\temp\pocketbase-sync"

# 임시 디렉토리 생성
New-Item -ItemType Directory -Force -Path $tempDir
cd $tempDir

# pocketbase 레포지토리 클론
git clone https://github.com/seleepi/todo-dashboard-pocketbase.git .

# 파일 복사
Copy-Item "$webRepo\pocketbase\Dockerfile" ".\Dockerfile.pocketbase" -Force
Copy-Item "$webRepo\pocketbase\railway.json" ".\railway.json" -Force

# 커밋 & 푸시
git add .
git commit -m "Sync from web repository - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin main

# 정리
cd $webRepo
Remove-Item -Recurse -Force $tempDir
```

## 주의사항

### 커밋하지 말아야 할 파일들
다음 파일들은 `.gitignore`에 추가하거나 커밋하지 않도록 주의:

```
# 데이터베이스 파일들
pb_data/data.db*
pb_data/logs.db*
pb_data/auxilliary.db*
*.db-shm
*.db-wal

# 실행 파일들
pocketbase.exe
pocketbase
*.zip

# 환경 파일들
.env*
```

### Railway 배포 확인
- PocketBase 변경사항을 푸시한 후 Railway 대시보드에서 배포 상태 확인
- 보통 1-2분 내에 자동 배포가 시작됨
- 배포 실패시 로그를 확인하여 Docker 명령어 오류 등을 점검

## 문제 발생시 체크리스트

1. **배포 실패시**:
   - [ ] Docker 명령어에 shell operators(`||`, `2>/dev/null` 등) 사용 여부 확인
   - [ ] COPY 명령어에서 존재하지 않는 디렉토리 참조 여부 확인
   - [ ] Railway 로그에서 구체적인 오류 메시지 확인

2. **동기화 문제시**:
   - [ ] 로컬 pocketbase 폴더와 GitHub pocketbase 레포지토리 간 차이점 확인
   - [ ] 마지막 성공한 배포 버전으로 롤백 고려

3. **데이터베이스 문제시**:
   - [ ] pb_data 폴더의 데이터베이스 파일들 확인
   - [ ] 마이그레이션 파일들 확인
   - [ ] PocketBase 버전 호환성 확인

---

**마지막 업데이트**: 2024-09-29
**작성자**: Claude Code Assistant