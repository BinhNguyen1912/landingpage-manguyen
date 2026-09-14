/**
 * api.js — API Client Service
 * Mẫnthợtóc Landing Page
 *
 * Chuyên xử lý tất cả giao tiếp với backend API.
 * Dễ dàng thay đổi base URL hoặc thêm auth headers sau này.
 */

import { API_ENDPOINTS, API_TIMEOUT_MS } from '../config/constants.js';

/**
 * Thực hiện fetch với timeout và error handling chuẩn.
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<any>} - Parsed JSON response
 * @throws {Error} - Lỗi network, timeout, hoặc server error
 */
async function request(url, options = {}) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    // Parse JSON bất kể status code
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Phản hồi từ server không hợp lệ.');
    }

    // Trả về data dù là success hay error từ server
    return { ok: response.ok, status: response.status, data };

  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Kết nối quá chậm. Vui lòng thử lại.');
    }
    if (!navigator.onLine) {
      throw new Error('Không có kết nối mạng. Vui lòng kiểm tra lại.');
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách các khung giờ đã được đặt cho một ngày cụ thể.
 *
 * @param {string} date - Định dạng YYYY-MM-DD
 * @returns {Promise<string[]>} - Mảng các khung giờ đã đặt (VD: ['09:00', '14:30'])
 */
export async function fetchBookedSlots(date) {
  if (!date) return [];

  const url = `${API_ENDPOINTS.GET_AVAILABILITY}?date=${encodeURIComponent(date)}`;
  const { ok, data } = await request(url, { method: 'GET' });

  if (!ok) {
    console.error('[API] fetchBookedSlots error:', data);
    return []; // Trả về rỗng để không block UI
  }

  return Array.isArray(data.bookedSlots) ? data.bookedSlots : [];
}

// ─────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} BookingPayload
 * @property {string} name
 * @property {string} phone
 * @property {string} bookingDate - YYYY-MM-DD
 * @property {string} bookingTime - HH:MM
 * @property {string} [note]
 */

/**
 * @typedef {Object} BookingResult
 * @property {boolean} success
 * @property {string} [bookingId]
 * @property {string} [code]
 * @property {string} [message]
 */

/**
 * Tạo một booking mới.
 *
 * @param {BookingPayload} payload
 * @returns {Promise<BookingResult>}
 */
export async function createBooking(payload) {
  const body = {
    name:        String(payload.name || '').trim(),
    phone:       String(payload.phone || '').trim(),
    bookingDate: payload.bookingDate,
    bookingTime: payload.bookingTime,
    note:        String(payload.note || '').trim(),
  };

  const { ok, status, data } = await request(API_ENDPOINTS.CREATE_BOOKING, {
    method: 'POST',
    body:   JSON.stringify(body),
  });

  if (ok && data.success) {
    return { success: true, bookingId: data.bookingId };
  }

  // Xử lý từng loại lỗi từ server
  if (status === 409 || data.code === 'BOOKING_SLOT_UNAVAILABLE') {
    return {
      success: false,
      code:    'BOOKING_SLOT_UNAVAILABLE',
      message: 'Khung giờ này vừa được người khác đặt.\nVui lòng chọn khung giờ khác.',
    };
  }

  if (status === 400) {
    return {
      success: false,
      code:    'VALIDATION_ERROR',
      message: data.message || 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.',
    };
  }

  return {
    success: false,
    code:    'SERVER_ERROR',
    message: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
  };
}
