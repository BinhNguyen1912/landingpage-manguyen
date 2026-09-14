/**
 * /api/bookings/index.js — Create New Booking
 * Mẫnthợtóc API
 *
 * Endpoint POST tạo booking mới trong Supabase.
 */

import { supabase } from '../_lib/supabase.js';
import { validateBookingRequest } from '../_lib/validation.js';
import { ok, error, handleOptions } from '../_lib/response.js';

export default async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  if (req.method !== 'POST') {
    return error(res, 'Phương thức không được hỗ trợ (chỉ chấp nhận POST).', 405, 'METHOD_NOT_ALLOWED');
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    // Validate input
    const validation = validateBookingRequest(body);
    if (!validation.valid) {
      return error(res, validation.message, 400, 'VALIDATION_ERROR');
    }

    const { name, phone, bookingDate, bookingTime, note } = body;
    const phoneClean = phone.trim().replace(/\s/g, '');

    // Thêm booking vào Supabase
    const { data, error: dbError } = await supabase
      .from('bookings')
      .insert([
        {
          name: name.trim(),
          phone: phoneClean,
          booking_date: bookingDate,
          booking_time: bookingTime,
          note: note ? note.trim() : null,
        },
      ])
      .select('id')
      .single();

    if (dbError) {
      // Mã lỗi 23505 của PostgreSQL = Unique Violation (trùng booking_date + booking_time)
      if (dbError.code === '23505') {
        return error(
          res,
          'Khung giờ này vừa được người khác đặt. Vui lòng chọn khung giờ khác.',
          409,
          'BOOKING_SLOT_UNAVAILABLE'
        );
      }

      console.error('[API] Database insert error:', dbError);
      return error(res, 'Không thể lưu lịch đặt. Vui lòng thử lại.', 500, 'DATABASE_ERROR');
    }

    return ok(res, {
      success: true,
      bookingId: data.id,
      message: 'Đặt lịch thành công!',
    }, 201);

  } catch (err) {
    console.error('[API] Create booking handler error:', err);
    return error(res, 'Có lỗi xảy ra trên server.', 500, 'SERVER_ERROR');
  }
}
