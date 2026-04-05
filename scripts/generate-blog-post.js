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

    // 실제 Gemini API 사용
    if (false) {
      // (레거시 테스트 키 분기 제거됨)
      const todayString = new Date().toISOString().split('T')[0];
      const fallbackKeyword = 'mock-automated-post';
      
      resultText = `---
title: "${itemName}"
date: ${todayString}
summary: "${itemName}에 대한 멋진 블로그 글입니다."
category: 정보
tags: [테스트, 샘플, 남호주]
---

안녕하세요! 오늘은 정말 유익한 지역 공공서비스인 **${itemName}**에 대해 자세히 살펴보려고 합니다.
남호주에서 진행되는 이 서비스는 생각보다 훨씬 많은 사람들에게 큰 혜택과 도움을 주고 있습니다. 평소에 바빠서 이런 꿀 같은 정보를 놓치셨던 분들도, 오늘 제 글을 통해 꼭 알아가셨으면 좋겠습니다!

### 💡 이 서비스를 강력히 추천하는 3가지 이유

첫째로, 누구나 정말 쉽고 빠르게 접근할 수 있도록 체계적으로 준비되어 있습니다. 복잡한 절차 때문에 포기하셨던 분들께도 강력히 권해드립니다. 
둘째, 실질적인 생활에 큰 보탬이 됩니다. 피부에 와닿지 않는 형식적인 지원이 아닌, 내 삶의 질을 직접적으로 향상시켜 주는 실용적인 정보이기 때문입니다.
마지막으로, 주변의 사랑하는 가족이나 친구들에게도 공유하기 아주 좋은 정보라는 점입니다.

### 📝 빠른 신청 방법 안내

신청 방법도 전혀 어렵지 않습니다! 해당 기관의 공식 온라인 홈페이지에 접속하신 후, 안내된 절차에 따라 간편하게 본인 인증을 진행하시면 됩니다. 바로가기 버튼을 누르고 지금 바로 확인해 보세요!

FILENAME: ${todayString}-${fallbackKeyword}`;
    } else {
      // [2단계] Gemini AI로 블로그 글 생성
      const promptText = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(latestItem)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: (오늘 날짜 YYYY-MM-DD)
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (!geminiRes.ok) {
        const errorText = await geminiRes.text();
        console.warn(`[주의] Gemini API 호출 실패 (${geminiRes.status}). 원인: ${errorText}`);
        console.log('API 키 오류로 임시 블로그 글을 생성합니다.');
        const todayString = new Date().toISOString().split('T')[0];
        resultText = `---\ntitle: "임시: ${latestItem.name || latestItem.title}"\ndate: ${todayString}\nsummary: "임시 블로그 데이터"\ncategory: 정보\ntags: [테스트]\n---\n\n구글 API 에러로 임시 텍스트가 작성되었습니다.\n\nFILENAME: ${todayString}-mock-post-api-error`;
      } else {
        const geminiData = await geminiRes.json();
        resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

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
