/**
 * /api/bookings/availability.js — Fetch Booked Slots for a Date
 * Mẫnthợtóc API
 *
 * Endpoint GET lấy danh sách các khung giờ đã bị đặt cho một ngày cụ thể.
 */

import { supabase } from '../_lib/supabase.js';
import { ok, error, handleOptions } from '../_lib/response.js';

export default async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  if (req.method !== 'GET') {
    return error(res, 'Phương thức không được hỗ trợ (chỉ chấp nhận GET).', 405, 'METHOD_NOT_ALLOWED');
  }

  try {
    // Lấy query parameter date
    let date = req.query?.date;
    if (!date && req.url) {
      const url = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
      date = url.searchParams.get('date');
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return error(res, 'Tham số date không hợp lệ (định dạng YYYY-MM-DD).', 400, 'INVALID_DATE');
    }

    // Truy vấn các booking đã đặt cho ngày này
    const { data, error: dbError } = await supabase
      .from('bookings')
      .select('booking_time')
      .eq('booking_date', date);

    if (dbError) {
      console.error('[API] Fetch availability error:', dbError);
      return error(res, 'Không thể kiểm tra khung giờ trống.', 500, 'DATABASE_ERROR');
    }

    // Standardize 'HH:MM:SS' sang 'HH:MM'
    const bookedSlots = (data || []).map((item) => {
      const timeStr = String(item.booking_time);
      return timeStr.slice(0, 5); // '09:00:00' -> '09:00'
    });

    return ok(res, {
      success: true,
      date,
      bookedSlots,
    });

  } catch (err) {
    console.error('[API] Availability handler error:', err);
    return error(res, 'Có lỗi xảy ra trên server.', 500, 'SERVER_ERROR');
  }
}
