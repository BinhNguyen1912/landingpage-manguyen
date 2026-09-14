/**
 * validators.js — Client-side Form Validation
 * Mẫnthợtóc Landing Page
 */

import { VALIDATION } from '../config/constants.js';
import { isPastDate, isValidDateString } from './date.js';

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string} message - Thông báo lỗi (rỗng nếu hợp lệ)
 */

/**
 * Validate họ và tên.
 * @param {string} value
 * @returns {ValidationResult}
 */
export function validateName(value) {
  const trimmed = (value || '').trim();

  if (!trimmed) {
    return { valid: false, message: 'Vui lòng nhập họ và tên.' };
  }
  if (trimmed.length < VALIDATION.name.minLength) {
    return { valid: false, message: 'Họ và tên phải có ít nhất 2 ký tự.' };
  }
  if (trimmed.length > VALIDATION.name.maxLength) {
    return { valid: false, message: 'Họ và tên quá dài.' };
  }

  return { valid: true, message: '' };
}

/**
 * Validate số điện thoại Việt Nam.
 * @param {string} value
 * @returns {ValidationResult}
 */
export function validatePhone(value) {
  const trimmed = (value || '').trim().replace(/\s/g, '');

  if (!trimmed) {
    return { valid: false, message: 'Vui lòng nhập số điện thoại.' };
  }

  if (!VALIDATION.phone.pattern.test(trimmed)) {
    return {
      valid: false,
      message: 'Số điện thoại không hợp lệ. VD: 0901234567',
    };
  }

  return { valid: true, message: '' };
}

/**
 * Validate ngày đặt lịch.
 * @param {string} value - YYYY-MM-DD
 * @returns {ValidationResult}
 */
export function validateBookingDate(value) {
  if (!value) {
    return { valid: false, message: 'Vui lòng chọn ngày cắt tóc.' };
  }

  if (!isValidDateString(value)) {
    return { valid: false, message: 'Ngày không hợp lệ.' };
  }

  if (isPastDate(value)) {
    return { valid: false, message: 'Không thể đặt lịch cho ngày đã qua.' };
  }

  return { valid: true, message: '' };
}

/**
 * Validate khung giờ đặt lịch.
 * @param {string} value - HH:MM
 * @param {string[]} allowedSlots - Danh sách khung giờ hợp lệ
 * @returns {ValidationResult}
 */
export function validateBookingTime(value, allowedSlots = []) {
  if (!value) {
    return { valid: false, message: 'Vui lòng chọn khung giờ cắt tóc.' };
  }

  if (allowedSlots.length > 0 && !allowedSlots.includes(value)) {
    return { valid: false, message: 'Khung giờ không hợp lệ.' };
  }

  return { valid: true, message: '' };
}

/**
 * Validate ghi chú (không bắt buộc, chỉ kiểm tra độ dài).
 * @param {string} value
 * @returns {ValidationResult}
 */
export function validateNote(value) {
  const trimmed = (value || '').trim();

  if (trimmed.length > VALIDATION.note.maxLength) {
    return {
      valid: false,
      message: `Ghi chú tối đa ${VALIDATION.note.maxLength} ký tự.`,
    };
  }

  return { valid: true, message: '' };
}

/**
 * Validate toàn bộ form đặt lịch cùng lúc.
 * @param {Object} data - { name, phone, bookingDate, bookingTime, note }
 * @param {string[]} allowedSlots - Danh sách khung giờ hợp lệ
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateBookingForm(data, allowedSlots = []) {
  const errors = {};

  const nameResult = validateName(data.name);
  if (!nameResult.valid) errors.name = nameResult.message;

  const phoneResult = validatePhone(data.phone);
  if (!phoneResult.valid) errors.phone = phoneResult.message;

  const dateResult = validateBookingDate(data.bookingDate);
  if (!dateResult.valid) errors.bookingDate = dateResult.message;

  const timeResult = validateBookingTime(data.bookingTime, allowedSlots);
  if (!timeResult.valid) errors.bookingTime = timeResult.message;

  const noteResult = validateNote(data.note);
  if (!noteResult.valid) errors.note = noteResult.message;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
