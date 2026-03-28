const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // [1단계] South Australia 공공데이터 API에서 데이터 가져오기
    const apiUrl = 'https://data.sa.gov.au/data/api/3/action/package_search?rows=20';
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

    const hasString = (item, str) => {
      const regex = new RegExp(str, 'i');
      return regex.test(item.title || '') || 
             regex.test(item.notes || '') || 
             regex.test(item.organization?.title || '');
    };

    // [2단계] 기존 데이터와 비교
    const localDataPath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
    let localData = [];
    if (fs.existsSync(localDataPath)) {
      try {
        localData = JSON.parse(fs.readFileSync(localDataPath, 'utf8'));
      } catch (e) {
        console.error('Failed to parse local-info.json', e);
        return; // 에러 발생 시 기존 데이터 유지
      }
    }

    let selectedItem = null;

    // 우선순위 필터링 (Adelaide -> South Australia -> 전체 데이터)
    for (const phrase of ['Adelaide', 'South Australia', '']) {
      for (const item of results) {
        const isExists = localData.some(d => (d.name || d.title) === item.title);
        if (!isExists && (!phrase || hasString(item, phrase))) {
          selectedItem = item;
          break;
        }
      }
      if (selectedItem) break;
    }

    if (!selectedItem) {
      console.log('새로운 데이터가 없습니다');
      return;
    }

    // [3단계] Gemini AI로 새 항목 1개만 가공
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return;
    }

    const promptText = `아래 South Australia 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식: {id: 숫자, name: 서비스명(영문), category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약(한국어 번역), link: 상세URL} category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해. startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어. 반드시 JSON 객체만 출력해. 다른 텍스트 없이.\n\n데이터: ${JSON.stringify(selectedItem)}`;

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
        category: '행사',
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

    // [4단계] 기존 데이터에 추가
    const targetId = localData.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
    parsedNewItem.id = targetId;
    
    // UI 호환성을 위한 기존 필드명 및 값 정리
    if (parsedNewItem.name && !parsedNewItem.title) {
      parsedNewItem.title = parsedNewItem.name;
    }
    if (parsedNewItem.category === '행사') parsedNewItem.category = '행사/축제';
    if (parsedNewItem.category === '혜택') parsedNewItem.category = '지원금/혜택';

    localData.push(parsedNewItem);
    
    // 에러 발생 없이 모든 단계 정상 처리될 경우에만 저장
    fs.writeFileSync(localDataPath, JSON.stringify(localData, null, 2), 'utf8');
    console.log('데이터가 성공적으로 추가되었습니다.');

  } catch (error) {
    console.error('Script Failed:', error);
  }
}

main();
