const fs = require('fs');
const path = require('path');

// .env.local 파일 자동 로드
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}


async function main() {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // [1단계] 최신 데이터 확인
    const localDataPath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
    if (!fs.existsSync(localDataPath)) {
      console.log('local-info.json 파일이 없습니다.');
      return;
    }
    
    let localData = [];
    try {
      localData = JSON.parse(fs.readFileSync(localDataPath, 'utf8'));
    } catch (e) {
      console.error('데이터 파싱 오류', e);
      return;
    }

    if (localData.length === 0) {
      console.log('데이터가 없습니다.');
      return;
    }
    
    // 마지막 항목 (배열의 마지막)
    const latestItem = localData[localData.length - 1];
    const itemName = latestItem.name || latestItem.title;

    // 기존 데이터와 중복 확인
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }
    
    const mdFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    
    // 기존 .md 파일들을 열어서 프론트매터의 제목과 비교
    for (const file of mdFiles) {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const titleMatch = content.match(/title:\s*"?([^"\n]+)"?/);
      if (titleMatch) {
        const existingTitle = titleMatch[1].trim();
        if (existingTitle === itemName) {
          console.log('이미 작성된 글입니다');
          return;
        }
      }
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY가 설정되지 않았습니다.');
      return;
    }

    let resultText = '';

    // 오늘 날짜 구하기 (YYYY-MM-DD 포맷)
    const todayString = new Date().toISOString().split('T')[0];

    // [2단계] Gemini AI로 블로그 글 생성
    const promptText = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(latestItem)}
오늘 날짜: ${todayString}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${todayString}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: ${todayString}-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const MAX_RETRIES = 3;
    let geminiRes = null;
    let success = false;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Gemini API 호출 시도 (${attempt}/${MAX_RETRIES})...`);
        geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });

        if (geminiRes.ok) {
          success = true;
          break;
        } else {
          const errorText = await geminiRes.text();
          console.warn(`[주의] API 호출 실패 (${geminiRes.status}): ${errorText}`);
        }
      } catch (e) {
        console.warn(`[주의] 네트워크 에러 발생: ${e.message}`);
      }

      if (attempt < MAX_RETRIES) {
        console.log(`10초 대기 후 재시도합니다...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    if (!success) {
      console.error('❌ 최대 재시도 횟수를 초과했습니다. 임시(쓰레기) 글을 만들지 않고 스크립트를 즉시 종료합니다.');
      return;
    }

    const geminiData = await geminiRes.json();
    resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 마크다운 역따옴표 제거 로직
    resultText = resultText.replace(/^```markdown/im, '').replace(/^```/im, '').replace(/```$/im, '').trim();

    // [3단계] 파일 저장 (본문과 파일명 분리)
    const lines = resultText.split('\n');
    let filename = '';
    let contentLines = [];

    for (const line of lines) {
      if (line.trim().startsWith('FILENAME:')) {
        filename = line.replace('FILENAME:', '').trim();
      } else {
        contentLines.push(line);
      }
    }

    const postContent = contentLines.join('\n').trim();

    if (!filename) {
      const today = new Date().toISOString().split('T')[0];
      filename = `${today}-automated-post`;
    }
    
    if (!filename.endsWith('.md')) {
      filename += '.md';
    }

    // 최종 파일 생성
    const filePath = path.join(postsDir, filename);
    fs.writeFileSync(filePath, postContent, 'utf8');
    console.log(`✅ 블로그 글 생성 완료: ${filename}`);

  } catch (error) {
    console.error('스크립트 실행 중 치명적 에러 발생:', error);
  }
}

main();
