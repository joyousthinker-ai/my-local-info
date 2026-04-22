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
// 요일별 주제 순환 시스템
// 매일 다른 키워드로 검색하여 콘텐츠 다양성 확보
// ============================================================
const TOPIC_ROTATION = {
  0: { keyword: 'tourism recreation park trail', category: '관광/여가' },
  1: { keyword: 'education school library childcare', category: '교육' },
  2: { keyword: 'transport road cycling bus train', category: '교통' },
  3: { keyword: 'health hospital medical disability', category: '건강/의료' },
  4: { keyword: 'housing property planning development', category: '주거/부동산' },
  5: { keyword: 'business economy employment job', category: '경제/취업' },
  6: { keyword: 'water energy waste recycling tree', category: '생활/환경' },
};

// 대기질/기상 데이터 반복 차단 필터
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
    const todayTopic = TOPIC_ROTATION[dayOfWeek];
    console.log(`📌 오늘의 주제: ${todayTopic.category} (키워드: ${todayTopic.keyword})`);

    // [2단계] South Australia 공공데이터 API에서 주제별 데이터 가져오기
    const encodedKeyword = encodeURIComponent(todayTopic.keyword);
    const apiUrl = `https://data.sa.gov.au/data/api/3/action/package_search?q=${encodedKeyword}&rows=30`;
    const fetchOptions = { headers: {} };
    
    if (PUBLIC_DATA_API_KEY && PUBLIC_DATA_API_KEY !== '필요시 나중에_입력') {
      fetchOptions.headers['Authorization'] = PUBLIC_DATA_API_KEY;
    }

    const apiRes = await fetch(apiUrl, fetchOptions);
    if (!apiRes.ok) {
      console.error(`Public Data API Error: ${apiRes.status}`);
      return;
    }

    const apiData = await apiRes.json();
    const results = apiData.result?.results || [];
    console.log(`📥 API에서 ${results.length}개 데이터 수신`);

    // [3단계] 기존 데이터와 비교
    const localDataPath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
    let localData = [];
    if (fs.existsSync(localDataPath)) {
      try {
        localData = JSON.parse(fs.readFileSync(localDataPath, 'utf8'));
      } catch (e) {
        console.error('Failed to parse local-info.json', e);
        return;
      }
    }

    let selectedItem = null;

    // [4단계] 차단 필터 + 중복 확인을 거쳐 새 항목 선택
    // 우선순위: Adelaide → South Australia → 전체
    const hasString = (item, str) => {
      const regex = new RegExp(str, 'i');
      return regex.test(item.title || '') || 
             regex.test(item.notes || '') || 
             regex.test(item.organization?.title || '');
    };

    for (const phrase of ['Adelaide', 'South Australia', '']) {
      for (const item of results) {
        // 대기질/기상 관련 차단
        if (isBlockedTopic(item)) {
          continue;
        }
        const isExists = localData.some(d => (d.name || d.title) === item.title);
        if (!isExists && (!phrase || hasString(item, phrase))) {
          selectedItem = item;
          break;
        }
      }
      if (selectedItem) break;
    }

    if (!selectedItem) {
      console.log('새로운 데이터가 없습니다 (대기질 관련 데이터는 자동 건너뜀)');
      return;
    }

    console.log(`✅ 선택된 항목: ${selectedItem.title}`);

    // [5단계] Gemini AI로 새 항목 가공
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return;
    }

    const promptText = `아래 South Australia 공공데이터 1건을 분석해서 JSON 객체로 변환해줘.

형식: {id: 숫자, name: 서비스명(영문), category: 카테고리, startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약(한국어 번역), link: 상세URL}

category는 내용을 보고 아래 중 하나로 판단:
- '행사/축제' (이벤트, 축제, 문화행사)
- '지원금/혜택' (보조금, 할인, 지원 프로그램)
- '교통/인프라' (도로, 대중교통, 자전거)
- '교육/도서관' (학교, 도서관, 교육 프로그램)
- '건강/의료' (병원, 의료 서비스, 복지)
- '생활/환경' (재활용, 에너지, 수도)
- '관광/여가' (관광지, 공원, 트레일)
- '주거/부동산' (주택, 개발, 도시계획)
- '경제/취업' (고용, 사업, 경제 통계)

startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

데이터: ${JSON.stringify(selectedItem)}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    let parsedNewItem;

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.warn(`[주의] Gemini API 호출 실패 (${geminiRes.status}). 원인: ${errText}`);
      console.log('API 키 오류로 인해 임시(Mock) 데이터를 자동 생성합니다.');
      
      parsedNewItem = {
        id: 0,
        name: selectedItem.title || '새로운 대체 샘플 데이터',
        category: todayTopic.category,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '상시',
        location: selectedItem.organization?.title || '애들레이드',
        target: '전체 시민',
        summary: `이 데이터는 실제 내용 대신 테스트용으로 요약되었습니다. 원본: ${selectedItem.notes?.substring(0, 30) || '설명 없음'}...`,
        link: 'https://data.sa.gov.au/'
      };
    } else {
      const geminiData = await geminiRes.json();
      let textStr = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      textStr = textStr.replace(/^```json/im, '').replace(/```$/im, '').trim();

      try {
        parsedNewItem = JSON.parse(textStr);
      } catch (e) {
        console.error('Failed to parse Gemini response as JSON', e, textStr);
        return;
      }
    }

    // [6단계] 기존 데이터에 추가
    const targetId = localData.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
    parsedNewItem.id = targetId;
    
    // UI 호환성을 위한 기존 필드명 정리
    if (parsedNewItem.name && !parsedNewItem.title) {
      parsedNewItem.title = parsedNewItem.name;
    }

    localData.push(parsedNewItem);
    
    fs.writeFileSync(localDataPath, JSON.stringify(localData, null, 2), 'utf8');
    console.log(`✅ 데이터가 성공적으로 추가되었습니다. (카테고리: ${parsedNewItem.category})`);

  } catch (error) {
    console.error('Script Failed:', error);
  }
}

main();
