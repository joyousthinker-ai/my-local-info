import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 영어 렌즈 & 문법 코치 | 캡처·사진 한 번으로 실시간 영문 첨삭',
  description: '문자, 이메일, 영어 글을 캡처하거나 카메라로 찍으면 제미나이 AI가 1초 만에 문법 검사, 원어민 교정, 틀린 이유 분석, 발음 듣기, 맞춤 학습 팁을 제공합니다.',
  keywords: ['AI 영어 첨삭', '영어 문법 검사', '영어 렌즈', '제미나이 영어 공부', '영어 이메일 첨삭', '호주 영어'],
};

export default function EnglishCoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
