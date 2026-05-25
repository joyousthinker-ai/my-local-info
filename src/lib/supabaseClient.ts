import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 설정값이 존재하고, 실제 올바른 웹 주소 형식(https://)으로 시작할 때만 연결 클라이언트를 생성합니다.
const isValidUrl = supabaseUrl.startsWith('https://');

export const supabase = isValidUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
