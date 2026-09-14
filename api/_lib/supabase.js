/**
 * supabase.js — Supabase Client (Server-side)
 * Mẫnthợtóc API
 *
 * ⚠️ File này chỉ được dùng trong Vercel Serverless Functions (/api/).
 *    KHÔNG bao giờ import file này vào frontend JS.
 *    service_role key KHÔNG được để trong frontend code.
 */

// Dùng supabase-js v2 — install: npm install @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[Supabase] Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_ANON_KEY. ' +
    'Kiểm tra file .env hoặc Vercel dashboard.'
  );
}

/**
 * Supabase client được khởi tạo với anon key.
 * RLS (Row Level Security) sẽ kiểm soát quyền truy cập.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,   // Serverless không cần persist session
    autoRefreshToken: false,
  },
});
