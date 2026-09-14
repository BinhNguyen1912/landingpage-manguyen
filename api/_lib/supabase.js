/**
 * supabase.js — Supabase Client (Server-side)
 * Mẫnthợtóc API
 *
 * ⚠️ File này chỉ được dùng trong Vercel Serverless Functions (/api/).
 *    KHÔNG bao giờ import file này vào frontend JS.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;

// Tương thích cả tên key mới (publishable) lẫn cũ (anon)
const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    '[Supabase] Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_ANON_KEY.\n' +
    'Kiểm tra Vercel Dashboard → Settings → Environment Variables.'
  );
}

/**
 * Supabase client — dùng anon/publishable key.
 * RLS (Row Level Security) kiểm soát quyền truy cập.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession:   false,
    autoRefreshToken: false,
  },
});

