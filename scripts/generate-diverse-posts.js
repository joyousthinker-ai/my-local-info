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
// 다양한 주제의 블로그 글을 일괄 생성하는 스크립트
// ============================================================

const BLOG_TOPICS = [
  {
    filename: '2026-04-19-sa-immigration-checklist.md',
    category: '이민/정착',
    prompt: `🎯 역할: 호주 남호주(SA) 애들레이드에 정착한 지 3년 된 한국인 교민 블로거
🎯 독자: 호주 SA주로 이민/유학/워홀을 준비하거나 막 도착한 한국인
🎯 톤: 선배 교민이 후배에게 알려주는 따뜻하고 실용적인 스타일

주제: "2026년 호주 SA주 이민생활 첫 달 체크리스트 — 도착 후 반드시 해야 할 10가지"

반드시 포함할 내용:
1. TFN(세금번호) 신청 방법과 소요 기간
2. 은행 계좌 개설 (추천 은행: CBA, NAB 등)
3. Medicare 등록 (또는 OSHC 관련)
4. 핸드폰 개통 (Telstra, Optus, Vodafone 비교)
5. 운전면허 관련 (임시 허용 기간 & 교환 절차)
6. Centrelink 등록 (해당되는 경우)
7. 숙소 구하기 (임시→장기 전략)
8. 대중교통 Metro Card 구매
9. 마트/장보기 팁 (Coles, Woolworths, 한인마트)
10. 한인 커뮤니티 (카카오톡 단톡방, 한인회 등)

각 항목마다 구체적인 웹사이트 URL, 소요시간, 비용 포함
총 1500자 이상, 소제목(##) 활용, 마지막에 체크리스트 요약 테이블`
  },
  {
    filename: '2026-04-20-sa-driving-licence-guide.md',
    category: '교통/생활',
    prompt: `🎯 역할: 남호주에서 한국 면허를 호주 면허로 교환한 경험이 있는 교민 블로거
🎯 독자: 한국 운전면허를 가지고 있고, 호주에서 운전하고 싶은 한국인
🎯 톤: 직접 경험한 것을 바탕으로 한 실전 가이드

주제: "한국 운전면허 → 남호주 면허 교환 완벽 가이드 2026"

반드시 포함할 내용:
1. 한국 면허로 호주에서 운전 가능한 기간 (비자 유형별)
2. 국제운전면허증(IDP) vs 면허 교환의 차이
3. 남호주 면허 교환 절차 단계별 (Service SA 방문)
4. 필요 서류 목록 (NATTI 번역, 한국 면허증 원본 등)
5. 비용 상세 (면허 교환 수수료, 번역 비용 등)
6. Service SA 위치 및 예약 방법
7. 시험이 필요한 경우 vs 바로 교환 가능한 경우
8. 운전 중 주의사항 (한국과 다른 호주 교통법규: 좌측통행, 라운드어바웃, 캥거루 주의 등)
9. 자동차 구매/보험 기본 정보
10. 유용한 앱 (Google Maps, Waze, SA Police 과속카메라 앱)

총 1500자 이상, 실용적 정보 위주, 비용 비교 테이블 포함`
  },
  {
    filename: '2026-04-20-sa-medicare-health-guide.md',
    category: '건강/의료',
    prompt: `🎯 역할: 호주 의료 시스템을 직접 이용해본 SA주 거주 교민 블로거
🎯 독자: 호주 의료 시스템이 처음인 한국인 (PR 소지자 & 유학생 모두)
🎯 톤: 복잡한 의료 시스템을 알기 쉽게 풀어주는 가이드 스타일

주제: "남호주 의료 시스템 완전 정복 — Medicare부터 응급실까지"

반드시 포함할 내용:
1. Medicare란? (한국 건강보험과 비교)
2. Medicare 등록 방법과 카드 받기
3. GP(일반의) 시스템 설명 — 한국과 완전히 다른 병원 이용법
4. Bulk Billing 클리닉이란? (무료 진료)
5. 전문의(Specialist) 예약 과정 — GP 추천서(Referral) 필요
6. 약국(Pharmacy)과 PBS(처방약 보조) 제도
7. 응급상황 시 대처법 (000 전화, RAH 응급실)
8. 치과/안과는 Medicare 적용 안 됨 — 사보험 필요성
9. 유학생용 OSHC 보험 활용법
10. 한국어 통역 서비스 (TIS National: 131 450)

총 1500자 이상, 비용 비교 테이블 포함, 응급 연락처 목록 포함`
  },
  {
    filename: '2026-04-20-adelaide-school-guide.md',
    category: '교육',
    prompt: `🎯 역할: 남호주에서 초등학생 자녀를 키우는 한국인 학부모 블로거
🎯 독자: 호주에서 자녀 교육을 고민하는 한국인 부모
🎯 톤: 직접 경험한 학부모의 솔직한 비교 분석

주제: "2026년 애들레이드 공립학교 vs 사립학교 — 한국인 학부모의 솔직 비교"

반드시 포함할 내용:
1. 호주 학제 설명 (Reception~Year 12, 학기 시작 시기)
2. 공립학교 장단점 (무료, 학군제, 다문화 환경)
3. 사립학교 장단점 (학비, 종교 기반, 시설)
4. 학비 비교 (공립: 무료~일부 유료 / 사립: 연간 $5,000~$30,000+)
5. 인기 공립학교 지역 (Burnside, Unley, Norwood 등)
6. ESL(영어 지원) 프로그램 — 영어 못해도 입학 가능
7. 입학 절차 단계별 설명
8. 방과후 활동 (OSHC — Out of School Hours Care)
9. 한국인 학생이 많은 학교 vs 적은 학교의 장단점
10. 학교 선택 시 확인할 체크리스트

총 1500자 이상, 비교 테이블 포함`
  },
  {
    filename: '2026-04-21-barossa-valley-wine-guide.md',
    category: '관광/여가',
    prompt: `🎯 역할: 바로사 밸리를 여러 번 방문한 와인 매니아 교민 블로거
🎯 독자: 남호주 와이너리 투어에 관심 있는 한국인 (관광객 + 교민)
🎯 톤: 와인을 잘 몰라도 즐길 수 있도록 친근하게 소개

주제: "바로사 밸리(Barossa Valley) 와이너리 투어 완벽 가이드 — 초보자도 즐기는 남호주 와인 여행"

반드시 포함할 내용:
1. 바로사 밸리란? (애들레이드 도심에서 1시간 거리)
2. 꼭 가봐야 할 유명 와이너리 TOP 5 (Penfolds, Jacob's Creek, Peter Lehmann 등)
3. 무료 시음 vs 유료 시음 와이너리 구분
4. 추천 코스 (반나절 / 하루 / 1박 2일)
5. 와인 초보를 위한 기본 상식 (Shiraz가 뭐야?)
6. 와이너리 외 즐길거리 (치즈, 초콜릿, 라벤더 농장)
7. 교통 방법 (자가용 vs 투어 버스 — 음주운전 주의!)
8. 베스트 시즌과 날씨 (가을 수확기 최고)
9. 예산 가이드 (1인당 $50~$200)
10. 사진 찍기 좋은 포인트

총 1500자 이상, 와이너리 비교 테이블 포함`
  },
  {
    filename: '2026-04-21-kangaroo-island-travel.md',
    category: '관광/여가',
    prompt: `🎯 역할: 캥거루 아일랜드를 2번 방문한 여행 매니아 교민 블로거
🎯 독자: 남호주 여행을 계획하는 한국인 (관광객 + 교민)
🎯 톤: 생생한 여행기 + 실용적 정보를 결합

주제: "캥거루 아일랜드(Kangaroo Island) 여행 완벽 플래너 — 야생동물 천국 2026"

반드시 포함할 내용:
1. 캥거루 아일랜드 소개 (호주 3번째로 큰 섬)
2. 가는 방법 (Cape Jervis → 페리 / 항공편)
3. 페리 예약 방법과 가격 (SeaLink)
4. 자동차 필수 여부 (섬 안 대중교통 없음)
5. 꼭 가봐야 할 명소 TOP 7 (Remarkable Rocks, Seal Bay, Flinders Chase 등)
6. 야생동물 만나기 (코알라, 바다사자, 캥거루, 펭귄)
7. 추천 일정 (1박 2일 / 2박 3일)
8. 숙소 옵션 (호텔, 에어비앤비, 캠핑)
9. 식사와 맛집 (현지 꿀, 치즈, 해산물)
10. 여행 예산 (2인 기준 $400~$800)

총 1500자 이상, 일정표 형식의 추천 스케줄 포함`
  },
  {
    filename: '2026-04-21-adelaide-vs-sydney-cost.md',
    category: '생활정보',
    prompt: `🎯 역할: 시드니에서 살다가 애들레이드로 이사한 교민 블로거
🎯 독자: 호주 어느 도시에서 살지 고민하는 한국인 (이민/유학 준비자)
🎯 톤: 두 도시를 직접 경험한 사람의 객관적 비교

주제: "2026년 애들레이드 vs 시드니 생활비 완전 비교 — 월급은 비슷한데 삶의 질은?"

반드시 포함할 내용:
1. 렌트비 비교 (원룸, 1BR, 2BR, 하우스)
2. 식비 비교 (마트 장보기, 외식)
3. 교통비 비교 (대중교통, 자동차 유지비)
4. 공과금 비교 (전기, 가스, 인터넷)
5. 차일드케어/교육비 비교
6. 평균 연봉 비교 (같은 직종 기준)
7. 부동산 시장 비교 (집값)
8. 생활 편의성 (한인 커뮤니티, 한국 식료품)
9. 자연환경/라이프스타일 비교
10. 결론: 어떤 사람에게 애들레이드가 더 좋을까?

모든 항목에 구체적인 2026년 기준 금액(AUD) 포함
총 1500자 이상, 비교 테이블 필수`
  },
  {
    filename: '2026-04-22-adelaide-rent-guide.md',
    category: '주거/부동산',
    prompt: `🎯 역할: 애들레이드에서 3번 이사한 경험이 있는 교민 블로거
🎯 독자: 남호주에서 렌트 집을 처음 구하는 한국인
🎯 톤: 실전 경험 기반의 꼼꼼한 가이드

주제: "2026년 애들레이드 지역별 렌트비 가이드 — 어디서 살까? 집 구하기 A to Z"

반드시 포함할 내용:
1. 호주 렌트 시스템 설명 (한국과 완전히 다른 점: 보증금=Bond, 주 단위 렌트)
2. 집 종류 (Unit, Apartment, Townhouse, House)
3. 지역별 렌트비 시세:
   - CBD & North Adelaide ($350~$550/주)
   - 동쪽 (Burnside, Norwood): 가족 선호, $400~$600/주
   - 남쪽 (Glenelg, Marion): 해변 근처, $350~$500/주
   - 북쪽 (Salisbury, Mawson Lakes): 저렴, $280~$400/주
   - 서쪽 (Henley Beach, West Beach): $380~$520/주
4. 집 구하기 앱/웹사이트 (realestate.com.au, Domain, Flatmates)
5. Inspection(집 보기) 예약과 방문 팁
6. 임대 신청서(Application) 쓰는 법 — 경쟁이 심할 때 어필 방법
7. 계약서(Lease) 핵심 확인 사항
8. 이사 당일 체크리스트 (Condition Report 중요!)
9. 전기/가스/인터넷 연결 방법
10. 흔한 실수 TOP 5

총 1500자 이상, 지역별 시세 비교 테이블 필수`
  },
  {
    filename: '2026-04-22-australia-must-have-apps.md',
    category: '생활정보',
    prompt: `🎯 역할: 호주 생활 3년차 디지털 노마드 교민 블로거
🎯 독자: 호주에서 생활하는 (또는 준비하는) 한국인
🎯 톤: 실제 사용 경험 기반의 간결하고 유용한 추천

주제: "호주에서 꼭 깔아야 할 필수 앱 12선 — 남호주 교민이 매일 쓰는 앱 총정리"

반드시 포함할 내용 (각 앱마다 한줄 설명 + 왜 필요한지 + 무료/유료):
1. myGov — 세금, Medicare, Centrelink 통합 관리
2. Medicare — 병원비 환급 즉시 처리
3. Adelaide Metro — 버스/전차/기차 시간표 & Metro Card 충전
4. Google Maps — 호주에서는 네이버지도 대신 이것
5. Uber / DiDi — 호주 택시 대안
6. realestate.com.au — 집 구하기 필수
7. Woolworths / Coles — 마트 앱 (할인, Everyday Rewards)
8. CommBank / NAB — 모바일 뱅킹
9. WhatsApp — 호주인들의 카카오톡
10. Seek — 호주 최대 구인구직 앱
11. BOM Weather — 호주 기상청 날씨 앱
12. TripView / AnyTrip — 대중교통 실시간 추적

각 앱에 ⭐ 추천도 (필수/권장/선택) 표시
총 1500자 이상, 카테고리별 정리 테이블 포함`
  },
  {
    filename: '2026-04-22-south-australia-seasons-guide.md',
    category: '생활정보',
    prompt: `🎯 역할: 남호주에서 사계절을 모두 경험한 교민 블로거
🎯 독자: 남호주로 오는 한국인 (이민, 유학, 워홀, 관광)
🎯 톤: 실생활에 바로 도움되는 계절별 꿀팁

주제: "남호주(SA)의 사계절과 옷 준비 가이드 — 한국과 완전히 다른 호주 날씨 적응기"

반드시 포함할 내용:
1. 남반구라서 계절이 반대! (한국 여름 = 호주 겨울)
2. 각 계절별 상세:
   [여름 12~2월]
   - 평균 기온 (25~40도), 일교차 큼
   - 자외선 지수가 극심 (썬크림 + 모자 필수)
   - 에어컨 전기요금 주의
   - 추천 옷차림
   
   [가을 3~5월]
   - 가장 살기 좋은 계절
   - 바로사 밸리 수확기 (와인 축제)
   - 추천 옷차림
   
   [겨울 6~8월]
   - 한국보다 따뜻한 겨울 (8~16도)
   - 비 오는 날 많음
   - 난방비 절약 팁
   - 추천 옷차림
   
   [봄 9~11월]
   - 꽃가루 알레르기 주의 (Hay Fever)
   - 야외 행사 시즌
   - 추천 옷차림

3. 한국에서 가져올 옷 vs 호주에서 살 옷
4. Kmart, Target, Uniqlo 등 저렴하게 옷 사는 팁
5. 계절별 필수 아이템 체크리스트

총 1500자 이상, 계절별 비교 테이블 포함`
  }
];

async function generatePost(topic) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY가 설정되지 않았습니다.');
    return false;
  }

  const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
  const filePath = path.join(postsDir, topic.filename);
  
  // 이미 존재하면 건너뛰기
  if (fs.existsSync(filePath)) {
    console.log(`⏭️  건너뜀 (이미 존재): ${topic.filename}`);
    return true;
  }

  const dateMatch = topic.filename.match(/^(\d{4}-\d{2}-\d{2})/);
  const postDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

  const fullPrompt = `${topic.prompt}

📋 출력 형식 (반드시 지켜줘):
---
title: (구체적이고 SEO에 유리한 제목)
date: ${postDate}
summary: (한 줄 요약, 50자 내외)
category: ${topic.category}
tags: [태그1, 태그2, 태그3, 태그4, 태그5]
---

(본문: 마크다운 형식, ## 소제목 사용, 표 포함)

⚠️ 규칙:
- 반드시 위 형식만 출력. 다른 설명 텍스트 없이.
- 역따옴표(\`\`\`)로 감싸지 마.
- "대기질", "모니터링 스테이션" 관련 내용 절대 작성하지 마.`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`  📝 Gemini API 호출 (${attempt}/3)...`);
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }]
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`  ⚠️ API 실패 (${res.status}): ${errText.substring(0, 100)}`);
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
        return false;
      }

      const data = await res.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // 마크다운 코드블록 제거
      text = text.replace(/^```(?:markdown)?\s*/im, '').replace(/\s*```\s*$/im, '').trim();
      
      if (!text.startsWith('---')) {
        console.warn('  ⚠️ 프론트매터가 없는 응답, 건너뜀');
        return false;
      }

      fs.writeFileSync(filePath, text, 'utf8');
      console.log(`  ✅ 생성 완료: ${topic.filename}`);
      return true;
    } catch (e) {
      console.warn(`  ⚠️ 에러: ${e.message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 5000));
    }
  }
  return false;
}

async function main() {
  console.log('🚀 다양한 블로그 글 일괄 생성 시작');
  console.log(`📊 총 ${BLOG_TOPICS.length}개 주제\n`);

  const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < BLOG_TOPICS.length; i++) {
    const topic = BLOG_TOPICS[i];
    console.log(`\n[${i + 1}/${BLOG_TOPICS.length}] ${topic.category}: ${topic.filename}`);
    
    const success = await generatePost(topic);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // API 속도 제한 방지를 위한 대기
    if (i < BLOG_TOPICS.length - 1) {
      console.log('  ⏳ 3초 대기...');
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log(`\n📊 결과: 성공 ${successCount}개, 실패 ${failCount}개`);
  console.log('🎉 일괄 생성 완료!');
}

main();
