/**
 * date.js — Date & Time Utilities
 * Mẫnthợtóc Landing Page
 */

/**
 * Lấy ngày hôm nay theo định dạng 'YYYY-MM-DD' ở múi giờ địa phương.
 * @returns {string}
 */
export function getTodayISOString() {
  const now = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Kiểm tra xem một chuỗi ngày (YYYY-MM-DD) có phải là ngày trong quá khứ không.
 * @param {string} dateString - Định dạng YYYY-MM-DD
 * @returns {boolean} true nếu là ngày quá khứ
 */
export function isPastDate(dateString) {
  if (!dateString) return true;
  const today = getTodayISOString();
  return dateString < today;
}

/**
 * Kiểm tra chuỗi ngày có hợp lệ không.
 * @param {string} dateString - Định dạng YYYY-MM-DD
 * @returns {boolean}
 */
export function isValidDateString(dateString) {
  if (!dateString || typeof dateString !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString + 'T00:00:00');
  return !isNaN(date.getTime());
}

/**
 * Format ngày từ YYYY-MM-DD sang DD/MM/YYYY (hiển thị tiếng Việt).
 * @param {string} dateString - Định dạng YYYY-MM-DD
 * @returns {string} Định dạng DD/MM/YYYY
 */
export function formatDateVN(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Format ngày đầy đủ tiếng Việt (VD: "Thứ Hai, 20 tháng 9 năm 2026").
 * @param {string} dateString - Định dạng YYYY-MM-DD
 * @returns {string}
 */
export function formatDateFullVN(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T12:00:00');
  if (isNaN(date.getTime())) return dateString;

  const DAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = DAYS[date.getDay()];
  const day     = date.getDate();
  const month   = date.getMonth() + 1;
  const year    = date.getFullYear();

  return `${dayName}, ${day} tháng ${month} năm ${year}`;
}

/**
 * Tính số ngày còn lại đến ngày đặt lịch.
 * @param {string} dateString - Định dạng YYYY-MM-DD
 * @returns {number} Số ngày (âm nếu quá khứ)
 */
export function daysUntil(dateString) {
  if (!dateString) return 0;
  const today    = new Date(getTodayISOString() + 'T00:00:00');
  const target   = new Date(dateString + 'T00:00:00');
  const diffMs   = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
