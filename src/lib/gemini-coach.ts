// Gemini API를 활용한 영어 문법 교정 및 맞춤 피드백 엔진

export interface MistakeDetail {
  original: string;
  corrected: string;
  reason: string;
}

export interface CoachResult {
  extractedText: string;
  correctedText: string;
  summaryFeedback: string;
  mistakes: MistakeDetail[];
  casualAlternative: string;
  formalAlternative: string;
  studyTips: string[];
  score: number;
  // 하위 호환성 유지
  explanation?: string;
}

export interface TranslateResult {
  detectedLanguage: 'korean' | 'english' | 'other'; // 입력된 언어
  translatedText: string;                             // 번역 결과
  alternativeTranslations: string[];                  // 다른 번역 표현 1~2개
  nuanceNote: string;                                 // 미묘한 뉘앙스 차이 설명 (한국어)
}

/**
 * 한↔영 자동 감지 번역 함수
 * - 한글 입력 → 영어로 번역
 * - 영어 입력 → 한글로 번역
 */
export async function translateText({
  text,
  apiKey,
}: {
  text: string;
  apiKey?: string;
}): Promise<TranslateResult> {
  const activeKey =
    apiKey ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    '';

  if (!activeKey) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  if (!text.trim()) {
    throw new Error('번역할 텍스트를 입력해주세요.');
  }

  const systemInstruction = `
당신은 한국어와 영어 사이의 전문 번역가입니다.
사용자가 입력한 텍스트의 언어를 자동으로 감지하고, 반대 언어로 자연스럽게 번역하세요.

[규칙]
- 한국어 → 영어 번역 시: 원어민이 실제로 쓰는 가장 자연스러운 영어로 번역
- 영어 → 한국어 번역 시: 한국인이 일상에서 실제로 쓰는 자연스러운 한국어로 번역
- 직역보다 의역을 우선: 뉘앙스와 맥락을 살려서 번역
- 반드시 JSON으로만 응답하고, 마크다운 코드블록(\`\`\`json)은 절대 사용 금지

[응답 JSON 형식]
{
  "detectedLanguage": "korean" 또는 "english" 또는 "other",
  "translatedText": "번역 결과 (메인)",
  "alternativeTranslations": ["다른 번역 표현 1", "다른 번역 표현 2"],
  "nuanceNote": "번역 시 고려한 뉘앙스나 주의사항 한 문장 (없으면 빈 문자열)"
}
`;

  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `다음 텍스트를 번역해주세요:\n"""\n${text}\n"""` }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2, // 번역은 일관성이 중요하므로 낮게 설정
          },
        }),
      });

      if (!response.ok) {
        lastError = new Error(`API 오류 (${response.status})`);
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('응답이 비어있습니다.');

      const cleanJson = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      let parsed: TranslateResult;
      try {
        parsed = JSON.parse(cleanJson);
      } catch {
        throw new Error('번역 응답 형식 오류. 다시 시도해주세요.');
      }

      // 기본값 보완
      parsed.translatedText = parsed.translatedText || '';
      parsed.alternativeTranslations = Array.isArray(parsed.alternativeTranslations)
        ? parsed.alternativeTranslations
        : [];
      parsed.nuanceNote = parsed.nuanceNote || '';

      return parsed;
    } catch (err: any) {
      console.warn(`[Gemini ${model}] 번역 실패:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('번역 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
}

export async function analyzeEnglish({
  text,
  imageBase64,
  mimeType = 'image/jpeg',
  apiKey,
}: {
  text?: string;
  imageBase64?: string;
  mimeType?: string;
  apiKey?: string;
}): Promise<CoachResult> {
  const activeKey =
    apiKey ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    '';

  if (!activeKey) {
    throw new Error('Gemini API 키가 설정되지 않았습니다. 설정에서 API 키를 확인해주세요.');
  }

  const systemInstruction = `
당신은 한국인 초보자에게 친절하고 세심하게 영어를 가르쳐주는 수석 영어 교육 전문가 & 원어민 코치입니다.
사용자가 보낸 [텍스트] 또는 [이미지(손글씨, 화면 캡처, 문자, 메일, 책 등)]를 분석하여 다음 5가지 요소를 완벽하게 담은 JSON 객체로만 응답하세요.

[요구사항]
1. extractedText: 이미지나 텍스트에서 인식한 영어 원문 (오타나 오탈자가 있어도 있는 그대로 추출)
2. correctedText: 가장 자연스럽고 세련된 원어민 스타일의 교정된 영어 문장
3. summaryFeedback: 전체적인 글에 대한 따뜻하고 격려가 담긴 총평 (한국어 1~2문장)
4. mistakes: 틀렸거나 어색했던 부분들의 1:1 비교 목록 (배열 형태):
   - original: 원래 어색했던 단어/구
   - corrected: 올바른 교정 단어/구
   - reason: 초보자도 쉽게 이해할 수 있는 구체적인 이유 및 문법 설명 (한국어)
5. casualAlternative: 친구에게 문자/카톡/DM으로 보낼 때 좋은 편안하고 캐주얼한 표현
6. formalAlternative: 직장 동료, 교수님, 거래처 등에 보낼 때 적합한 정중하고 격식 있는 비즈니스 표현
7. studyTips: 앞으로 이 실수를 방지하고 실력을 키울 수 있는 핵심 암기 패턴이나 꿀팁 2~3가지 (한국어 배열)
8. score: 100점 만점 기준의 자연스러움 점수 (숫자, 예: 85)

[응답 포맷 규칙]
- 반드시 유효한 JSON 형식으로만 반환하세요 (마크다운 코드블록 \`\`\`json 없이 순수 JSON 문자열만 출력).
- JSON 키 이름: "extractedText", "correctedText", "summaryFeedback", "mistakes", "casualAlternative", "formalAlternative", "studyTips", "score"
`;

  const contents: any[] = [];
  const parts: any[] = [];

  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
      },
    });
    parts.push({
      text: `이 이미지 속의 영어 문장을 읽고 분석해주세요.${text ? `\n추가 전달사항: ${text}` : ''}`,
    });
  } else if (text) {
    parts.push({
      text: `다음 영어 문장을 분석하고 첨삭해주세요:\n"""\n${text}\n"""`,
    });
  } else {
    throw new Error('분석할 텍스트나 이미지를 입력해주세요.');
  }

  contents.push({ parts });

  // gemini-2.0-flash가 가장 빠르고 안정적 (2.5-flash는 추론 모델이라 느림)
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];

  let lastError: any = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Gemini ${model}] error:`, errorText);
        lastError = new Error(`API 호출 실패 (${response.status}): ${errorText.substring(0, 100)}`);
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Gemini로부터 응답을 받지 못했습니다.');
      }

      // 마크다운 코드블록 제거 후 JSON 파싱
      const cleanJson = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      let parsed: CoachResult;
      try {
        parsed = JSON.parse(cleanJson);
      } catch {
        console.warn(`[Gemini ${model}] JSON 파싱 실패`);
        throw new Error('AI 응답 형식 오류입니다. 다시 시도해주세요.');
      }

      // 필수 필드 누락 시 기본값 채워줌 (앱 오류 방지)
      parsed.extractedText = parsed.extractedText || text || '';
      parsed.correctedText = parsed.correctedText || text || '';
      parsed.summaryFeedback = parsed.summaryFeedback || '';
      parsed.mistakes = Array.isArray(parsed.mistakes) ? parsed.mistakes : [];
      parsed.studyTips = Array.isArray(parsed.studyTips) ? parsed.studyTips : [];
      parsed.score = typeof parsed.score === 'number' ? parsed.score : 0;
      parsed.casualAlternative = parsed.casualAlternative || parsed.correctedText;
      parsed.formalAlternative = parsed.formalAlternative || parsed.correctedText;

      return parsed;
    } catch (err: any) {
      console.warn(`[Gemini ${model}] failed:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('영어 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
}
