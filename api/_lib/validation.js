/**
 * validation.js — Server-side Validation
 * Mẫnthợtóc API
 *
 * Server-side validation độc lập với frontend.
 * Không bao giờ tin tưởng vào frontend validation.
 */

/** Danh sách khung giờ hợp lệ — phải khớp với frontend constants.js */
const ALLOWED_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];

/** Regex số điện thoại Việt Nam */
const VN_PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;

/** Regex ngày YYYY-MM-DD */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Regex giờ HH:MM */
const TIME_REGEX = /^\d{2}:\d{2}$/;

// ─────────────────────────────────────────────────────────────────

/**
 * Kết quả validate booking request.
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string}  [message]
 * @property {string}  [field]
 */

/**
 * Validate toàn bộ booking request body.
 * @param {Object} body
 * @returns {ValidationResult}
 */
export function validateBookingRequest(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, message: 'Request body không hợp lệ.' };
  }

  const { name, phone, bookingDate, bookingTime, note } = body;

  // ─── name ───────────────────────────────────────────────────
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return {
      valid: false,
      field: 'name',
      message: 'Họ và tên không hợp lệ (ít nhất 2 ký tự).',
    };
  }
  if (name.trim().length > 100) {
    return { valid: false, field: 'name', message: 'Họ và tên quá dài.' };
  }

  // ─── phone ──────────────────────────────────────────────────
  if (!phone || typeof phone !== 'string') {
    return { valid: false, field: 'phone', message: 'Số điện thoại không hợp lệ.' };
  }
  const phoneClean = phone.trim().replace(/\s/g, '');
  if (!VN_PHONE_REGEX.test(phoneClean)) {
    return {
      valid: false,
      field: 'phone',
      message: 'Số điện thoại không đúng định dạng (VD: 0901234567).',
    };
  }

  // ─── bookingDate ─────────────────────────────────────────────
  if (!bookingDate || typeof bookingDate !== 'string' || !DATE_REGEX.test(bookingDate)) {
    return {
      valid: false,
      field: 'bookingDate',
      message: 'Ngày đặt lịch không hợp lệ (định dạng YYYY-MM-DD).',
    };
  }

  // Kiểm tra ngày không phải quá khứ (so sánh theo UTC+7)
  const todayVN = getTodayVN();
  if (bookingDate < todayVN) {
    return {
      valid: false,
      field: 'bookingDate',
      message: 'Không thể đặt lịch cho ngày đã qua.',
    };
  }

  // ─── bookingTime ─────────────────────────────────────────────
  if (!bookingTime || !TIME_REGEX.test(bookingTime)) {
    return {
      valid: false,
      field: 'bookingTime',
      message: 'Khung giờ không đúng định dạng (HH:MM).',
    };
  }
  if (!ALLOWED_TIME_SLOTS.includes(bookingTime)) {
    return {
      valid: false,
      field: 'bookingTime',
      message: 'Khung giờ không nằm trong danh sách cho phép.',
    };
  }

  // ─── note (optional) ─────────────────────────────────────────
  if (note !== undefined && note !== null) {
    if (typeof note !== 'string') {
      return { valid: false, field: 'note', message: 'Ghi chú không hợp lệ.' };
    }
    if (note.length > 500) {
      return { valid: false, field: 'note', message: 'Ghi chú tối đa 500 ký tự.' };
    }
  }

  return { valid: true };
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/**
 * Lấy ngày hôm nay theo múi giờ Việt Nam (UTC+7) dạng 'YYYY-MM-DD'.
 * @returns {string}
 */
function getTodayVN() {
  const now = new Date();
  // Chuyển sang UTC+7
  const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return vnTime.toISOString().slice(0, 10);
}
