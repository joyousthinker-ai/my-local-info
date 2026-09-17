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

// 요일별 주제 및 확장 검색 키워드
const TOPIC_ROTATION = {
  0: { keywords: ['tourism', 'park', 'trail', 'recreation', 'festival', 'event'], category: '관광/여가' },
  1: { keywords: ['education', 'school', 'library', 'childcare', 'university', 'kindergarten'], category: '교육' },
  2: { keywords: ['transport', 'road', 'cycling', 'bus', 'train', 'tram', 'traffic'], category: '교통' },
  3: { keywords: ['health', 'hospital', 'medical', 'disability', 'community health'], category: '건강/의료' },
  4: { keywords: ['housing', 'property', 'planning', 'development', 'heritage', 'zoning'], category: '주거/부동산' },
  5: { keywords: ['business', 'economy', 'employment', 'job', 'industry', 'trade'], category: '경제/취업' },
  6: { keywords: ['water', 'energy', 'waste', 'recycling', 'tree', 'environment'], category: '생활/환경' },
};

// 제외할 반복 주제 (대기질, 기상 측정소 등)
const BLOCKED_PATTERNS = [
  /air.?quality/i,
  /meteorolog/i,
  /monitoring.?station/i,
  /particle.?data/i,
  /ambient.?air/i,
  /EPA.*data/i,
  /pollutant/i,
];

function isBlockedTopic(item) {
  const text = `${item.title || ''} ${item.notes || ''} ${item.organization?.title || ''}`;
  return BLOCKED_PATTERNS.some(pattern => pattern.test(text));
}

async function main() {
  try {
    const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // [1단계] 오늘의 주제 결정
    const dayOfWeek = new Date().getDay();
    const todayTopic = TOPIC_ROTATION[dayOfWeek] || TOPIC_ROTATION[0];
    const selectedKeyword = todayTopic.keywords[Math.floor(Math.random() * todayTopic.keywords.length)];
    console.log(`📌 오늘의 주제: ${todayTopic.category} (키워드: ${selectedKeyword})`);

    // [2단계] 기존 로컬 데이터 불러오기
    const localDataPath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
    let localData = [];
    if (fs.existsSync(localDataPath)) {
      try {
        localData = JSON.parse(fs.readFileSync(localDataPath, 'utf8'));
      } catch (e) {
        console.error('local-info.json 파싱 실패:', e);
        localData = [];
      }
    }

    // [3단계] 남호주 공공데이터 API 호출
    const encodedKeyword = encodeURIComponent(selectedKeyword);
    const apiUrl = `https://data.sa.gov.au/data/api/3/action/package_search?q=${encodedKeyword}&rows=100`;
    const fetchOptions = { headers: {} };

    if (PUBLIC_DATA_API_KEY && PUBLIC_DATA_API_KEY !== '필요시 나중에_입력') {
      fetchOptions.headers['Authorization'] = PUBLIC_DATA_API_KEY;
    }

    let selectedItem = null;

    try {
      const apiRes = await fetch(apiUrl, fetchOptions);
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        let results = (apiData.result?.results || []).sort(() => Math.random() - 0.5);
        console.log(`📥 API에서 ${results.length}개 데이터 수신`);

        for (const item of results) {
          if (isBlockedTopic(item)) continue;
          const isExists = localData.some(d => (d.name || d.title) === item.title);
          if (!isExists) {
            selectedItem = item;
            break;
          }
        }
      }
    } catch (netErr) {
      console.warn('공공데이터 API 연결 실패:', netErr.message);
    }

    if (!selectedItem) {
      console.log('ℹ️ 공공데이터에서 새로운 항목이 없으므로, 오늘의 유용한 현지 정보 데이터로 대체합니다.');
    } else {
      console.log(`✅ 공공데이터 선택: ${selectedItem.title}`);
    }

    // [4단계] Gemini AI로 정보 정리 및 가공
    let parsedNewItem = null;
    const todayString = new Date().toISOString().split('T')[0];

    if (GEMINI_API_KEY && selectedItem) {
      const promptText = `아래 South Australia 공공데이터 1건을 분석해서 JSON 객체로 변환해줘.

형식: {"id": 0, "name": "서비스명(영문)", "category": "${todayTopic.category}", "startDate": "${todayString}", "endDate": "상시", "location": "장소 또는 기관명", "target": "지원대상", "summary": "한줄요약(한국어)", "link": "상세URL"}

반드시 위 순수 JSON 객체만 출력해 (마크다운 백틱 없이).
데이터: ${JSON.stringify(selectedItem)}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

      try {
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          let textStr = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          textStr = textStr.replace(/^```json/im, '').replace(/^```/im, '').replace(/```$/im, '').trim();
          parsedNewItem = JSON.parse(textStr);
        }
      } catch (e) {
        console.warn('Gemini 변환 실패, 기본 포맷 사용:', e.message);
      }
    }

    // fallback 기본 데이터 생성
    if (!parsedNewItem) {
      if (selectedItem) {
        parsedNewItem = {
          id: 0,
          name: selectedItem.title || 'South Australia Public Service',
          title: selectedItem.title || 'South Australia Public Service',
          category: todayTopic.category,
          startDate: todayString,
          endDate: '상시',
          location: selectedItem.organization?.title || 'South Australia',
          target: '남호주 거주민 및 방문자',
          summary: selectedItem.notes ? selectedItem.notes.substring(0, 100) : '남호주 공공 생활 서비스 정보입니다.',
          link: 'https://data.sa.gov.au/'
        };
      } else {
        // API에서 새 데이터가 없을 때의 생활 팁 데이터 자동 생성
        parsedNewItem = {
          id: 0,
          name: `Adelaide Living Guide - ${todayTopic.category} (${todayString})`,
          title: `Adelaide Living Guide - ${todayTopic.category} (${todayString})`,
          category: todayTopic.category,
          startDate: todayString,
          endDate: '상시',
          location: 'Adelaide, South Australia',
          target: '애들레이드 교민, 유학생, 워홀러',
          summary: `남호주 애들레이드 생활에 꼭 필요한 ${todayTopic.category} 실전 가이드 및 최신 정보입니다.`,
          link: 'https://www.sa.gov.au/'
        };
      }
    }

    // [5단계] ID 부여 및 저장
    const targetId = localData.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
    parsedNewItem.id = targetId;
    if (!parsedNewItem.title && parsedNewItem.name) {
      parsedNewItem.title = parsedNewItem.name;
    }

    localData.push(parsedNewItem);
    fs.writeFileSync(localDataPath, JSON.stringify(localData, null, 2), 'utf8');
    console.log(`🎉 데이터 추가 완료: ID ${targetId} (${parsedNewItem.title})`);

  } catch (error) {
    console.error('스크립트 실행 중 에러 발생:', error);
  }
}

main();
