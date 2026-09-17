#!/bin/bash
# AI 영어 렌즈 & 애들레이드 라이프 원클릭 실행 스크립트

echo "=================================================="
echo "🚀 [AI 영어 렌즈] 서버를 시작하고 브라우저를 엽니다..."
echo "=================================================="

# 기존 포트 3000 사용 중인 프로세스가 있다면 깔끔하게 정리
PID=$(lsof -ti :3000 2>/dev/null || true)
if [ -n "$PID" ]; then
  echo "🧹 이전 실행 프로세스(PID: $PID) 정리 중..."
  kill -9 $PID 2>/dev/null || true
  sleep 1
fi

# 3초 후 브라우저 자동 실행 (백그라운드)
(sleep 3 && open "http://localhost:3000/english-coach/") &

# 개발 서버 실행
npm run dev
