/**
 * /api/bookings/index.js — Create or Update Booking
 * Mẫnthợtóc API
 *
 * Endpoint POST tạo mới hoặc cập nhật thông tin booking nếu trùng số điện thoại.
 * Cho phép đặt giờ thoải mái không bị giới hạn slot.
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

    // 1. Kiểm tra xem sđt này đã có lịch đặt nào trước đó chưa
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('phone', phoneClean)
      .maybeSingle();

    let result;

    if (existing && existing.id) {
      // 2a. Nếu CÙNG SỐ ĐIỆN THOẠI → Cập nhật lại lịch hẹn mới
      result = await supabase
        .from('bookings')
        .update({
          name: name.trim(),
          booking_date: bookingDate,
          booking_time: bookingTime,
          note: note ? note.trim() : null,
          created_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('id')
        .single();
    } else {
      // 2b. Nếu SỐ ĐIỆN THOẠI MỚI → Tạo booking mới
      result = await supabase
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
    }

    if (result.error) {
      console.error('[API] Database operation error:', result.error);
      return error(res, 'Không thể lưu lịch đặt. Vui lòng thử lại.', 500, 'DATABASE_ERROR');
    }

    return ok(res, {
      success: true,
      bookingId: result.data.id,
      message: existing ? 'Cập nhật lịch đặt thành công!' : 'Đặt lịch thành công!',
    }, 200);

  } catch (err) {
    console.error('[API] Booking handler error:', err);
    return error(res, 'Có lỗi xảy ra trên server.', 500, 'SERVER_ERROR');
  }
}
