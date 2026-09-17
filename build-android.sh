#!/bin/bash
# AI 영어 렌즈 안드로이드 앱 빌드 및 구글 플레이 패키징 스크립트

set -e

echo "=================================================="
echo "🚀 [AI 영어 렌즈] 안드로이드 앱 빌드 시작"
echo "=================================================="

# 1. Next.js 웹앱 빌드 (out 폴더로 정적 내보내기)
echo "📦 1단계: 웹 애플리케이션 최적화 빌드 중..."
npm run build

# 2. Capacitor 안드로이드 프로젝트 초기화 및 동기화
if [ ! -d "android" ]; then
  echo "📱 2단계: 안드로이드 네이티브 프로젝트 생성 중..."
  npx cap add android
fi

echo "🔄 3단계: 안드로이드 프로젝트에 최신 코드 동기화 중..."
npx cap sync android

echo "=================================================="
echo "✅ 안드로이드 앱 빌드 및 동기화 완료!"
echo "=================================================="
echo ""
echo "👉 다음 단계 안내:"
echo "1. 안드로이드 스튜디오로 열기:"
echo "   npx cap open android"
echo ""
echo "2. 구글 플레이 스토어 출시용 파일(AAB) 생성 방법:"
echo "   - 안드로이드 스튜디오 실행 후 상단 메뉴 [Build] > [Generate Signed Bundle / APK] 선택"
echo "   - [Android App Bundle] 선택 후 키스토어 서명하여 생성된 .aab 파일을 구글 플레이 콘솔에 업로드"
echo ""
echo "3. 내 스마트폰에 바로 설치할 수 있는 테스트용 APK 생성:"
echo "   cd android && ./gradlew assembleDebug"
echo "   (생성 위치: android/app/build/outputs/apk/debug/app-debug.apk)"
echo "=================================================="
