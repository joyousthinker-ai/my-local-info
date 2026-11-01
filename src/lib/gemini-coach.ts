// Gemini API를 활용한 영어 문법 교정 및 맞춤 피드백 엔진
//
// ✅ 작동 확인된 모델 (2026-11 기준):
//   gemini-2.5-flash  — 빠르고 안정적, 이미지 지원
//   gemini-3.5-flash  — 추론 기능 포함
//   gemini-3.8-flash  — 최신 (구글 권장)
// ❌ 서비스 종료된 모델:
//   gemini-2.0-flash  — 404 NOT_FOUND
//   gemini-1.5-flash  — 404 NOT_FOUND

const MODELS = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-3.5-flash'];

// ── 공통 타입 ───────────────────────────────────────────────

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
}

export interface TranslateResult {
  detectedLanguage: 'korean' | 'english' | 'other';
  translatedText: string;
  alternativeTranslations: string[];
  nuanceNote: string;
}

// ── 공통 헬퍼: Gemini API 호출 ──────────────────────────────

async function callGemini(
  apiKey: string,
  systemInstruction: string,
  contents: any[],
  temperature = 0.3
): Promise<string> {
  let lastError: any = null;

  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              responseMimeType: 'application/json',
              temperature,
            },
          }),
        }
      );

      // 서버 오류(4xx/5xx) → 다음 모델 시도
      if (!res.ok) {
        const errBody = await res.text();
        console.warn(`[Gemini ${model}] HTTP ${res.status}:`, errBody.substring(0, 120));
        lastError = new Error(`API 오류 (${res.status})`);
        continue;
      }

      const data = await res.json();

      // API가 error 객체를 200으로 돌려줄 때도 처리
      if (data.error) {
        console.warn(`[Gemini ${model}] API error:`, data.error.message);
        lastError = new Error(data.error.message);
        continue;
      }

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        lastError = new Error('AI 응답이 비어있습니다.');
        continue;
      }

      // 마크다운 코드블록 제거
      return rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    } catch (err: any) {
      console.warn(`[Gemini ${model}] 예외:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('모든 AI 모델 호출이 실패했습니다. 잠시 후 다시 시도해주세요.');
}

// ── 공통 헬퍼: API 키 가져오기 ─────────────────────────────

function getApiKey(customKey?: string): string {
  const key =
    customKey ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    '';
  if (!key) throw new Error('Gemini API 키가 설정되지 않았습니다.');
  return key;
}

// ── 1. 영어 문법 교정 분석 ──────────────────────────────────

const COACH_SYSTEM_PROMPT = `
당신은 한국인 초보자에게 친절하고 세심하게 영어를 가르쳐주는 수석 영어 교육 전문가 & 원어민 코치입니다.
사용자가 보낸 [텍스트] 또는 [이미지]를 분석하여 아래 JSON 형식으로만 응답하세요.

[응답 JSON 키]
- extractedText: 원문 (오타 그대로 추출)
- correctedText: 원어민 스타일로 교정된 문장
- summaryFeedback: 따뜻한 격려 총평 (한국어 1~2문장)
- mistakes: 오류 목록 배열 [{original, corrected, reason(한국어)}]
- casualAlternative: 친구/카톡용 편안한 영어 표현
- formalAlternative: 직장/메일용 격식체 영어 표현
- studyTips: 핵심 학습 팁 2~3가지 (한국어 배열)
- score: 자연스러움 점수 0~100 (숫자)

[규칙] 순수 JSON만 반환. 마크다운 코드블록 절대 금지.
`.trim();

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
  const key = getApiKey(apiKey);

  const parts: any[] = [];
  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
      },
    });
    parts.push({
      text: `이 이미지 속 영어 문장을 읽고 분석해주세요.${text ? `\n추가 전달: ${text}` : ''}`,
    });
  } else if (text) {
    parts.push({ text: `다음 영어 문장을 분석해주세요:\n"""\n${text}\n"""` });
  } else {
    throw new Error('분석할 텍스트나 이미지를 입력해주세요.');
  }

  const rawJson = await callGemini(key, COACH_SYSTEM_PROMPT, [{ parts }]);

  let parsed: CoachResult;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('AI 응답 형식 오류입니다. 다시 시도해주세요.');
  }

  // 필수 필드 기본값 보완 (앱 오류 방지)
  parsed.extractedText = parsed.extractedText || text || '';
  parsed.correctedText = parsed.correctedText || text || '';
  parsed.summaryFeedback = parsed.summaryFeedback || '';
  parsed.mistakes = Array.isArray(parsed.mistakes) ? parsed.mistakes : [];
  parsed.studyTips = Array.isArray(parsed.studyTips) ? parsed.studyTips : [];
  parsed.score = typeof parsed.score === 'number' ? parsed.score : 0;
  parsed.casualAlternative = parsed.casualAlternative || parsed.correctedText;
  parsed.formalAlternative = parsed.formalAlternative || parsed.correctedText;

  return parsed;
}

// ── 2. 한↔영 자동 번역 ────────────────────────────────────

const TRANSLATE_SYSTEM_PROMPT = `
당신은 한국어↔영어 전문 번역가입니다.
입력 텍스트의 언어를 자동 감지하고, 반대 언어로 자연스럽게 번역하세요.

[규칙]
- 한국어 → 원어민이 실제로 쓰는 자연스러운 영어
- 영어 → 한국인이 일상에서 쓰는 자연스러운 한국어
- 직역보다 의역 우선 (뉘앙스와 맥락 살리기)
- 순수 JSON만 반환. 마크다운 코드블록 절대 금지.

[응답 JSON 키]
- detectedLanguage: "korean" | "english" | "other"
- translatedText: 메인 번역 결과
- alternativeTranslations: 다른 번역 표현 1~2개 (배열)
- nuanceNote: 뉘앙스나 주의사항 한 문장 (없으면 빈 문자열)
`.trim();

export async function translateText({
  text,
  apiKey,
}: {
  text: string;
  apiKey?: string;
}): Promise<TranslateResult> {
  if (!text.trim()) throw new Error('번역할 텍스트를 입력해주세요.');

  const key = getApiKey(apiKey);
  const contents = [{ parts: [{ text: `번역해주세요:\n"""\n${text}\n"""` }] }];

  const rawJson = await callGemini(key, TRANSLATE_SYSTEM_PROMPT, contents, 0.2);

  let parsed: TranslateResult;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('번역 응답 형식 오류입니다. 다시 시도해주세요.');
  }

  // 기본값 보완
  parsed.translatedText = parsed.translatedText || '';
  parsed.alternativeTranslations = Array.isArray(parsed.alternativeTranslations)
    ? parsed.alternativeTranslations
    : [];
  parsed.nuanceNote = parsed.nuanceNote || '';

  return parsed;
}
