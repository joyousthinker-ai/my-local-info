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

// ============================================================
// 카테고리별 맞춤 프롬프트 시스템
// 각 주제에 맞는 고유한 글 구성을 지시
// ============================================================
const CATEGORY_PROMPTS = {
  '관광/여가': `
🎯 역할: 호주 남호주(SA)에 거주하는 현지 교민 블로거
🎯 독자: 한국어를 사용하는 호주 거주 교민 & 호주 이민/유학 준비자
🎯 톤: 직접 가본 것처럼 생생하고 실용적인 여행 후기 스타일

반드시 포함할 내용:
- 가는 방법 (차/대중교통)
- 추천 시기 & 소요 시간
- 주변에 같이 갈 만한 곳
- 가족/커플/혼자 여행 각각 팁
- 주차, 입장료, 예약 필요 여부 등 실전 정보`,
  
  '교육': `
🎯 역할: 남호주에서 자녀를 키우는 학부모 블로거
🎯 독자: 호주에서 자녀 교육을 고민하는 한국인 부모
🎯 톤: 경험에서 우러나온 친근한 조언 스타일

반드시 포함할 내용:
- 한국 교육 시스템과의 차이점
- 실제 등록/이용 절차 단계별 설명
- 비용 정보 (무료/유료 구분)
- 영어가 부족할 때 도움받는 방법
- 추가로 알아두면 좋은 팁`,

  '교통': `
🎯 역할: 애들레이드에서 출퇴근하는 직장인 블로거
🎯 독자: 남호주에서 이동수단을 고민하는 한국인
🎯 톤: 실용적이고 비교 분석적인 스타일

반드시 포함할 내용:
- 이용 방법 단계별 설명
- 비용 비교 (vs 다른 수단)
- Metro Card 활용법
- 한국과 다른 교통 규칙/문화
- 앱이나 웹사이트 활용 팁`,

  '건강/의료': `
🎯 역할: 호주 의료 시스템을 경험한 교민 블로거
🎯 독자: 호주 의료 시스템이 낯선 한국인
🎯 톤: 안심시켜주면서도 꼼꼼한 가이드 스타일

반드시 포함할 내용:
- Medicare와의 관계 설명
- 이용 절차 (예약→방문→결제)
- 비용 구조 (Bulk billing 등)
- 응급 상황 대처법
- 한국어 통역 서비스 존재 여부`,

  '주거/부동산': `
🎯 역할: 남호주에서 집을 구한 경험이 있는 교민 블로거
🎯 독자: 호주에서 집을 구하려는 한국인 (렌트 or 매매)
🎯 톤: 현실적이고 구체적인 경험담 스타일

반드시 포함할 내용:
- 한국과 다른 점 (보증금, 계약 방식 등)
- 지역별 특징과 추천
- 시세 범위 (구체적 숫자)
- 주의할 점과 흔한 실수
- 유용한 웹사이트/앱 소개`,

  '경제/취업': `
🎯 역할: 호주에서 직장 생활 중인 교민 블로거  
🎯 독자: 호주에서 일자리를 찾거나 사업을 준비하는 한국인
🎯 톤: 현실적 조언과 희망을 동시에 주는 스타일

반드시 포함할 내용:
- 구체적인 취업/활용 방법
- 관련 자격 요건
- 영어 수준별 접근 전략
- 비자와의 관계 (워홀, PR 등)
- 실제 도움되는 리소스 링크`,

  '생활/환경': `
🎯 역할: 호주 생활에 적응한 교민 블로거
🎯 독자: 호주 생활 전반에 궁금한 한국인
🎯 톤: 실생활에 바로 적용 가능한 꿀팁 스타일

반드시 포함할 내용:
- 한국과 다른 호주만의 시스템 설명
- 비용 절약 팁
- 실수하기 쉬운 부분과 주의사항
- 관련 앱이나 웹사이트
- 환경 보호와 벌금 관련 정보`,
};

// 기본 프롬프트 (위 카테고리에 해당하지 않을 때)
const DEFAULT_PROMPT = `
🎯 역할: 호주 남호주(SA)에 거주하는 교민 블로거
🎯 독자: 한국어를 사용하는 호주 거주 교민 & 호주 이민/유학 준비자
🎯 톤: 친근하면서도 전문적인 정보 제공 스타일

반드시 포함할 내용:
- 이 정보가 왜 중요한지 실생활 맥락으로 설명
- 구체적인 활용 방법 3가지
- 한국과 비교했을 때의 차이점
- 관련 링크와 추가 자료`;


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
    
    // 마지막 항목
    const latestItem = localData[localData.length - 1];
    const itemName = latestItem.name || latestItem.title;

    // [2단계] 기존 글과 중복 확인
    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }
    
    const mdFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    
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

    // [3단계] 최근 7일 내 같은 카테고리 글 확인 (중복 주제 방지)
    const itemCategory = latestItem.category || '';
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let recentSameCategoryCount = 0;
    for (const file of mdFiles) {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const catMatch = content.match(/category:\s*"?([^"\n]+)"?/);
      const dateMatch = content.match(/date:\s*"?([^"\n]+)"?/);
      if (catMatch && dateMatch) {
        const fileCategory = catMatch[1].trim();
        const fileDate = new Date(dateMatch[1].trim());
        if (fileCategory === itemCategory && fileDate >= sevenDaysAgo) {
          recentSameCategoryCount++;
        }
      }
    }
    
    if (recentSameCategoryCount >= 2) {
      console.log(`⚠️ 최근 7일 내 "${itemCategory}" 카테고리 글이 이미 ${recentSameCategoryCount}개 있습니다. 다양성을 위해 건너뜁니다.`);
      return;
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY가 설정되지 않았습니다.');
      return;
    }

    // [4단계] 카테고리별 맞춤 프롬프트 선택
    const categoryPrompt = CATEGORY_PROMPTS[itemCategory] || DEFAULT_PROMPT;

    const todayString = new Date().toISOString().split('T')[0];

    const promptText = `${categoryPrompt}

아래 공공서비스/정보를 바탕으로 블로그 글을 작성해줘.
정보: ${JSON.stringify(latestItem)}
오늘 날짜: ${todayString}

📋 작성 규칙:
1. 제목은 검색에 유리하도록 구체적인 키워드 포함 (예: "2026년", "남호주", "애들레이드")
2. 본문은 1200자 이상으로 충실하게
3. 소제목(##)을 3~4개 사용해서 읽기 쉽게 구성
4. "대기질", "모니터링 스테이션", "EPA 데이터" 같은 반복 주제는 절대 작성하지 마
5. 실용적이고 구체적인 정보 위주로 (추상적인 이야기 X)
6. 마지막에 "정리하면" 또는 "한눈에 보기" 요약 테이블 포함

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (구체적이고 검색에 유리한 제목)
date: ${todayString}
summary: (한 줄 요약)
category: ${itemCategory || '생활정보'}
tags: [태그1, 태그2, 태그3, 태그4]
---

(본문)

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
      console.error('❌ 최대 재시도 횟수를 초과했습니다. 스크립트를 즉시 종료합니다.');
      return;
    }

    const geminiData = await geminiRes.json();
    let resultText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 마크다운 역따옴표 제거
    resultText = resultText.replace(/^```markdown/im, '').replace(/^```/im, '').replace(/```$/im, '').trim();

    // [5단계] 파일 저장
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

    const filePath = path.join(postsDir, filename);
    fs.writeFileSync(filePath, postContent, 'utf8');
    console.log(`✅ 블로그 글 생성 완료: ${filename} (카테고리: ${itemCategory})`);

  } catch (error) {
    console.error('스크립트 실행 중 치명적 에러 발생:', error);
  }
}

main();
