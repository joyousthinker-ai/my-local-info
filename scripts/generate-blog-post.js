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

// 카테고리별 맞춤 프롬프트 지침
const CATEGORY_PROMPTS = {
  '관광/여가': `
🎯 역할: 호주 남호주(SA) 애들레이드 거주 5년차 교민 여행 인플루언서
🎯 독자: 애들레이드 및 호주 거주 교민, 유학생, 워홀러 및 여행 준비자
🎯 톤: 친절하고 생생한 실제 경험담 가이드 스타일
반드시 포함할 내용:
- 대중교통 및 자동차로 가는 구체적 방법과 소요시간
- 주차 팁, 입장료, 예약 필수 여부
- 가족/커플/나홀로 여행객 맞춤 추천 코스
- 주변 추천 맛집 및 카페
- 실전 꿀팁 (방문하기 좋은 시간대, 복장 등)`,

  '교육': `
🎯 역할: 남호주 애들레이드에서 자녀를 키우는 학부모 교민
🎯 독자: 호주 조기유학, 이민, 어학연수를 준비하거나 생활 중인 한국인
🎯 톤: 실질적인 도움이 되는 꼼꼼하고 따뜻한 조언 스타일
반드시 포함할 내용:
- 한국 교육 시스템과의 현실적인 차이점
- 등록 절차 및 준비 서류 (영문)
- 비용 (학비, OSHC, 방과후 활동 OSHC)
- 영어 서포트 프로그램(EALD/ESL) 혜택
- 부모들이 자주 묻는 질문 FAQ 3가지`,

  '교통': `
🎯 역할: 애들레이드에서 매일 출퇴근하는 직장인 교민
🎯 독자: 남호주 대중교통 및 운전이 낯선 한국인
🎯 톤: 명쾌하고 실용적인 비교 분석 스타일
반드시 포함할 내용:
- Adelaide Metro 버스/기차/트램 탑승 방법 및 요금 체계
- Metro Card 충전 및 MetroCard vs 신용카드 탭 비교
- 한국과 다른 호주 운전 룰 (라운드어바웃, Give Way, 훅턴 등)
- 꼭 설치해야 할 교통 필수 앱
- 벌금 주의사항 (주차 단속, 과속 카메라)`,

  '건강/의료': `
🎯 역할: 호주 의료 시스템을 꼼꼼히 겪어본 현지 교민
🎯 독자: 호주 병원 시스템이 낯설고 불안한 한국인
🎯 톤: 든든하고 안심을 주는 전문 가이드 스타일
반드시 포함할 내용:
- Medicare 및 개인보험(OSHC/OVHC) 활용법
- GP 진료 예약부터 약국(PBS) 처방전 수령까지 전 과정
- Bulk Billing(무료진료) 찾는 꿀팁
- 응급 상황(000 전화, RAH 응급실) 행동 요령
- 한국어 무료 통역 서비스 (TIS National 131 450) 이용법`,

  '주거/부동산': `
🎯 역할: 애들레이드에서 렌트 및 내집마련을 경험한 교민
🎯 독자: 호주에서 집을 구하는 워홀러, 유학생, 이민자
🎯 톤: 현실적이고 손해 보지 않게 도와주는 멘토 스타일
반드시 포함할 내용:
- 호주 렌트 구하기 단계별 가이드 (인스펙션부터 계약까지)
- 보증금(Bond) 안전하게 돌려받는 체크리스트 (컨디션 리포트)
- 애들레이드 주요 지역별 특징과 렌트비 시세
- 전기/가스/인터넷 설치 및 렌트 필수 앱(realestate, Domain)
- 계약 시 사기 예방 및 주의사항`,

  '경제/취업': `
🎯 역할: 호주 현지 기업에서 근무 중인 교민 멘토
🎯 독자: 호주에서 일자리를 찾거나 세무/연금 관리를 하려는 한국인
🎯 톤: 현실적이고 동기부여가 되는 직무 가이드 스타일
반드시 포함할 내용:
- Seek, LinkedIn 등 호주 구직 플랫폼 200% 활용법
- 호주식 영문 이력서(Resume) & 커버레터 작성 팁
- TFN 및 연금(Superannuation), 최저시급 규정
- 영어 회화 수준별 일자리 접근 전략
- 세금 환급(Tax Return) 기초 가이드`,

  '생활/환경': `
🎯 역할: 애들레이드 살림 9단 현지 교민
🎯 독자: 호주 생활비를 아끼고 스마트하게 살고 싶은 한국인
🎯 톤: 쏠쏠한 꿀팁을 가득 담은 일상 팁 스타일
반드시 포함할 내용:
- 마트 장보기 절약 팁 (Coles, Woolworths 세일 주기 및 한인마트)
- 쓰레기 분리수거 및 옐로우/그린/레드 빈 규칙
- 전기세/수도세 절약 요령
- 중고 거래 꿀팁 (Facebook Marketplace, Gumtree)
- 벌금 피하는 생활 안전 수칙`,
};

const DEFAULT_PROMPT = `
🎯 역할: 호주 남호주(SA) 애들레이드 거주 교민 블로거
🎯 독자: 남호주 생활 정보를 찾는 교민, 유학생, 워홀러
🎯 톤: 친절하고 생생한 정보 전달 스타일
반드시 포함할 내용:
- 이 정보가 실생활에 왜 중요한지 핵심 설명
- 구체적인 실천 및 활용 방법 3단계
- 한국과의 차이점 및 주의사항
- 관련 공식 사이트 및 문의처
- 요약 정리 표`;

async function callGemini(promptText, apiKey) {
  const models = ['gemini-flash-latest', 'gemini-2.5-flash'];

  for (const model of models) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`  🤖 Gemini API 호출 중 (${model}, 시도 ${attempt})...`);
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } else {
          const errText = await res.text();
          console.warn(`  ⚠️ [${model}] API 에러 (${res.status}): ${errText.substring(0, 100)}`);
        }
      } catch (e) {
        console.warn(`  ⚠️ [${model}] 네트워크 에러: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

async function main() {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY가 설정되지 않았습니다.');
      return;
    }

    const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    const localDataPath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
    let localData = [];
    if (fs.existsSync(localDataPath)) {
      try {
        localData = JSON.parse(fs.readFileSync(localDataPath, 'utf8'));
      } catch (e) {
        console.error('local-info.json 읽기 실패:', e);
      }
    }

    // 기존 블로그 글들의 제목 수집
    const existingMdFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    const existingTitles = new Set();

    for (const file of existingMdFiles) {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const titleMatch = content.match(/title:\s*"?([^"\n]+)"?/);
      if (titleMatch) {
        existingTitles.add(titleMatch[1].trim());
      }
    }

    // 아직 글이 작성되지 않은 항목을 최신순으로 탐색
    let targetItem = null;
    for (let i = localData.length - 1; i >= 0; i--) {
      const item = localData[i];
      const name = item.title || item.name;
      if (name && !existingTitles.has(name)) {
        targetItem = item;
        break;
      }
    }

    // 호주 애들레이드 시간대 기준 오늘 날짜 계산 (YYYY-MM-DD)
    const adelaideDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Australia/Adelaide',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    const todayString = adelaideDateStr;

    // 카테고리 영문 슬러그 매핑
    const CATEGORY_SLUGS = {
      '관광/여가': 'tourism',
      '교육': 'education',
      '교통': 'transport',
      '건강/의료': 'health',
      '주거/부동산': 'housing',
      '경제/취업': 'jobs',
      '생활/환경': 'living',
    };

    const catSlug = CATEGORY_SLUGS[targetItem.category] || 'guide';
    const itemId = targetItem.id || Math.floor(Math.random() * 1000);

    // 만약 공공데이터 항목 중 미작성된 것이 없다면, 유용한 테마로 자동 선정
    if (!targetItem) {
      const defaultCategories = ['생활/환경', '주거/부동산', '교통', '건강/의료', '교육', '관광/여가', '경제/취업'];
      const dayCategory = defaultCategories[new Date().getDay() % defaultCategories.length];
      targetItem = {
        title: `2026 애들레이드 생활 실전 가이드 - ${dayCategory} 완벽 정리`,
        category: dayCategory,
        summary: `남호주 애들레이드에 거주하는 교민과 유학생, 워홀러를 위한 ${dayCategory} 핵심 가이드`,
        location: '애들레이드 (Adelaide)',
        target: '교민, 유학생, 워홀러, 이민 준비자',
        link: 'https://www.sa.gov.au/'
      };
      console.log(`ℹ️ 새 미작성 데이터가 없어 오늘의 맞춤 주제를 자동 선정했습니다: [${dayCategory}]`);
    } else {
      console.log(`🎯 작성 대상 데이터: ${targetItem.title} (${targetItem.category})`);
    }

    const itemCategory = targetItem.category || '생활정보';
    const categoryPrompt = CATEGORY_PROMPTS[itemCategory] || DEFAULT_PROMPT;

    const promptText = `${categoryPrompt}

위 가이드라인에 따라 아래 정보를 바탕으로 유익하고 생생한 블로그 글을 작성해줘.
- 정보: ${JSON.stringify(targetItem)}
- 오늘 날짜: ${todayString}

📋 글 작성 규칙:
1. 검색(SEO)에 매우 유리하도록 제목에 핵심 키워드(예: 2026년, 호주 애들레이드, 남호주 등)를 자연스럽게 포함
2. 본문은 1500자 이상으로 매우 상세하고 친절하게 작성
3. 소제목(##, ###)을 다양하게 사용하여 읽기 쉽게 구성
4. "대기질", "모니터링 스테이션" 같은 기계적인 데이터는 작성하지 말 것
5. 마지막에 핵심 요약 정리 표(테이블) 반드시 포함

출력 형식은 반드시 아래 형식을 정확히 지켜줘 (마크다운 코드블록 백틱 없이):
---
title: "검색에 유리한 매력적인 한국어 제목"
date: ${todayString}
summary: 한 줄 요약 (60자 내외)
category: ${itemCategory}
tags: [애들레이드, 남호주, ${itemCategory}, 호주생활, 꿀팁]
---

(본문 내용 마크다운)

FILENAME: ${todayString}-adelaide-${catSlug}-${itemId}`;

    const rawResponse = await callGemini(promptText, GEMINI_API_KEY);

    if (!rawResponse) {
      console.error('❌ Gemini 응답 생성 실패');
      return;
    }

    // 마크다운 코드블록 정리
    let cleanText = rawResponse.replace(/^```(?:markdown)?\s*/im, '').replace(/\s*```\s*$/im, '').trim();

    // 파일명 추출
    const lines = cleanText.split('\n');
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
      filename = `${todayString}-adelaide-${catSlug}-${itemId}`;
    }

    // 영문, 숫자, 하이픈만으로 파일명 정리
    filename = filename.replace(/[^a-zA-Z0-9\-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!filename.endsWith('.md')) {
      filename += '.md';
    }

    const finalFilePath = path.join(postsDir, filename);
    fs.writeFileSync(finalFilePath, postContent, 'utf8');
    console.log(`✅ 블로그 글 발행 완료: ${filename}`);

  } catch (error) {
    console.error('블로그 글 생성 중 에러:', error);
  }
}

main();
