// Gemini API를 활용한 영어 문법 교정 및 맞춤 피드백 엔진

export interface MistakeDetail {
  original: string;
  corrected: string;
  reason: string;
}

export interface CoachResult {
  extractedText: string;
  correctedText: string;
  explanation: string;
  mistakes: MistakeDetail[];
  casualAlternative: string;
  formalAlternative: string;
  studyTips: string[];
  score?: number;
  summaryFeedback?: string;
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

  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];

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

      // Clean JSON string in case of Markdown wrapping
      const cleanJson = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed: CoachResult = JSON.parse(cleanJson);
      return parsed;
    } catch (err: any) {
      console.warn(`[Gemini ${model}] failed:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('영어 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
}
