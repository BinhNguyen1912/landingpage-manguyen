/**
 * booking-modal.js — Booking Bottom Sheet Controller
 * Mẫnthợtóc Landing Page
 */

import { createBooking }                 from '../services/api.js';
import { validateBookingForm }           from '../utils/validators.js';
import { getTodayISOString, formatDateVN } from '../utils/date.js';
import { clearAllErrors, showFieldError, show, hide, setBodyScrollLock } from '../utils/dom.js';
import { TIME_SLOTS }                    from '../config/constants.js';
import {
  initSlotPicker,
  loadSlotsForDate,
  getSelectedSlot,
  resetSlotPicker,
} from './slot-picker.js';

// ─── DOM Element References ───────────────────────────────────────
const els = {
  backdrop:         () => document.getElementById('modal-backdrop'),
  sheet:            () => document.getElementById('booking-sheet'),
  closeBtn:         () => document.getElementById('btn-close-sheet'),
  submitBtn:        () => document.getElementById('btn-submit-booking'),
  backHomeBtn:      () => document.getElementById('btn-back-home'),
  form:             () => document.getElementById('booking-form'),
  dateInput:        () => document.getElementById('field-date'),
  nameInput:        () => document.getElementById('field-name'),
  phoneInput:       () => document.getElementById('field-phone'),
  noteInput:        () => document.getElementById('field-note'),
  noteCharCount:    () => document.getElementById('note-char-count'),
  globalError:      () => document.getElementById('booking-global-error'),
  globalErrorText:  () => document.getElementById('booking-global-error-text'),

  // View states
  viewForm:         () => document.getElementById('view-form'),
  viewLoading:      () => document.getElementById('view-loading'),
  viewSuccess:      () => document.getElementById('view-success'),
  sheetFooter:      () => document.getElementById('sheet-footer'),
  sheetFooterSucc:  () => document.getElementById('sheet-footer-success'),

  // Success detail fields
  successName:      () => document.getElementById('success-name'),
  successDate:      () => document.getElementById('success-date'),
  successTime:      () => document.getElementById('success-time'),
  successPhone:     () => document.getElementById('success-phone'),
};

// ─── State ────────────────────────────────────────────────────────
let isOpen = false;
let isSubmitting = false;

// ─────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────

/**
 * Khởi tạo toàn bộ booking modal logic.
 * Gọi một lần khi trang load.
 */
export function initBookingModal() {
  // Khởi tạo slot picker
  initSlotPicker('slot-grid');

  // Set ngày tối thiểu = hôm nay
  const dateInput = els.dateInput();
  if (dateInput) {
    dateInput.min = getTodayISOString();
  }

  // Event listeners
  els.backdrop()?.addEventListener('click', closeSheet);
  els.closeBtn()?.addEventListener('click', closeSheet);
  els.backHomeBtn()?.addEventListener('click', handleBackHome);

  // Date change → load slots
  els.dateInput()?.addEventListener('change', handleDateChange);

  // Note character counter
  els.noteInput()?.addEventListener('input', handleNoteInput);

  // Real-time validation
  els.nameInput()?.addEventListener('blur', () => validateFieldLive('name'));
  els.phoneInput()?.addEventListener('blur', () => validateFieldLive('phone'));

  // Form submit
  els.form()?.addEventListener('submit', handleSubmit);
  els.submitBtn()?.addEventListener('click', handleSubmit);

  // Keyboard: Escape để đóng
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeSheet();
  });
}

// ─────────────────────────────────────────────────────────────────
// OPEN / CLOSE
// ─────────────────────────────────────────────────────────────────

/**
 * Mở booking sheet.
 */
export function openSheet() {
  if (isOpen) return;
  isOpen = true;

  const sheet    = els.sheet();
  const backdrop = els.backdrop();

  if (!sheet || !backdrop) return;

  backdrop.classList.add('is-open');
  backdrop.setAttribute('aria-hidden', 'false');

  sheet.classList.add('is-open');
  sheet.setAttribute('aria-hidden', 'false');

  setBodyScrollLock(true);

  // Focus vào sheet để screen reader nhận biết
  setTimeout(() => {
    const firstInput = sheet.querySelector('input:not([disabled])');
    firstInput?.focus();
  }, 350);

  // Update nút trigger aria-expanded
  document.querySelectorAll('[aria-haspopup="dialog"]').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'true');
  });
}

/**
 * Đóng booking sheet & reset về trạng thái form.
 */
export function closeSheet() {
  if (!isOpen) return;
  isOpen = false;

  const sheet    = els.sheet();
  const backdrop = els.backdrop();

  if (!sheet || !backdrop) return;

  backdrop.classList.remove('is-open');
  backdrop.setAttribute('aria-hidden', 'true');

  sheet.classList.remove('is-open');
  sheet.setAttribute('aria-hidden', 'true');

  setBodyScrollLock(false);

  document.querySelectorAll('[aria-haspopup="dialog"]').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
  });

  // Reset form sau animation
  setTimeout(resetModal, 400);
}

// ─────────────────────────────────────────────────────────────────
// FORM HANDLERS
// ─────────────────────────────────────────────────────────────────

/** Xử lý khi ngày thay đổi → reload slots */
async function handleDateChange(e) {
  const date = e.target.value;
  if (!date) return;

  clearFieldError('error-date', 'field-date');
  await loadSlotsForDate(date);
}

/** Character counter cho note field */
function handleNoteInput(e) {
  const len    = e.target.value.length;
  const max    = 500;
  const countEl = els.noteCharCount();

  if (countEl) {
    if (len > 0) {
      countEl.textContent = `${len}/${max}`;
      countEl.style.display = 'flex';
      countEl.style.color = len > max ? 'var(--color-error)' : 'var(--color-text-muted)';
    } else {
      countEl.style.display = 'none';
    }
  }
}

/** Real-time validate từng field khi blur */
function validateFieldLive(fieldName) {
  const fieldMap = {
    name:  { input: 'field-name',  error: 'error-name',  getValue: () => els.nameInput()?.value },
    phone: { input: 'field-phone', error: 'error-phone', getValue: () => els.phoneInput()?.value },
  };

  const field = fieldMap[fieldName];
  if (!field) return;

  const value = field.getValue() || '';

  // Import validators inline (đã import ở file app.js — ở đây gọi trực tiếp)
  import('../utils/validators.js').then(({ validateName, validatePhone }) => {
    const validators = { validateName, validatePhone };
    const fnName = `validate${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`;
    const result = validators[fnName]?.(value);

    if (result && !result.valid) {
      showFieldError(field.error, result.message, field.input);
    } else {
      clearFieldError(field.error, field.input, field.input);
    }
  });
}

// ─────────────────────────────────────────────────────────────────
// SUBMIT
// ─────────────────────────────────────────────────────────────────

/** Xử lý submit form */
async function handleSubmit(e) {
  e.preventDefault();

  if (isSubmitting) return;

  // Hide global error
  hide(els.globalError());

  // Thu thập dữ liệu
  const formData = {
    name:        els.nameInput()?.value || '',
    phone:       els.phoneInput()?.value || '',
    bookingDate: els.dateInput()?.value  || '',
    bookingTime: getSelectedSlot() || '',
    note:        els.noteInput()?.value  || '',
  };

  // Validate client-side
  const { isValid, errors } = validateBookingForm(formData, TIME_SLOTS);

  // Hiển thị lỗi
  clearAllErrors();
  if (!isValid) {
    if (errors.name)        showFieldError('error-name',  errors.name,        'field-name');
    if (errors.phone)       showFieldError('error-phone', errors.phone,       'field-phone');
    if (errors.bookingDate) showFieldError('error-date',  errors.bookingDate, 'field-date');
    if (errors.bookingTime) showFieldError('error-time',  errors.bookingTime, 'slot-grid');
    if (errors.note)        showFieldError('error-note',  errors.note,        'field-note');

    // Scroll tới lỗi đầu tiên
    const firstError = els.sheet()?.querySelector('.form-input--error');
    firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Chuyển sang loading state
  isSubmitting = true;
  switchView('loading');

  try {
    const result = await createBooking({
      name:        formData.name.trim(),
      phone:       formData.phone.trim(),
      bookingDate: formData.bookingDate,
      bookingTime: formData.bookingTime,
      note:        formData.note.trim(),
    });

    if (result.success) {
      showSuccessView(formData);
    } else {
      // Trở về form và hiển thị lỗi
      switchView('form');
      showGlobalError(result.message || 'Có lỗi xảy ra. Vui lòng thử lại.');

      // Nếu slot bị conflict → reload lại slot list
      if (result.code === 'BOOKING_SLOT_UNAVAILABLE') {
        await loadSlotsForDate(formData.bookingDate);
      }
    }
  } catch (err) {
    switchView('form');
    showGlobalError(err.message || 'Kết nối thất bại. Vui lòng thử lại.');
  } finally {
    isSubmitting = false;
  }
}

// ─────────────────────────────────────────────────────────────────
// UI STATE SWITCHING
// ─────────────────────────────────────────────────────────────────

/** Chuyển đổi giữa các view: 'form' | 'loading' | 'success' */
function switchView(view) {
  const viewForm    = els.viewForm();
  const viewLoading = els.viewLoading();
  const viewSuccess = els.viewSuccess();
  const footer      = els.sheetFooter();
  const footerSucc  = els.sheetFooterSucc();

  [viewForm, viewLoading, viewSuccess].forEach((el) =>
    el?.classList.remove('is-active')
  );

  if (view === 'form') {
    viewForm?.classList.add('is-active');
    show(footer);
    hide(footerSucc);
  } else if (view === 'loading') {
    viewLoading?.classList.add('is-active');
    hide(footer);
    hide(footerSucc);
  } else if (view === 'success') {
    viewSuccess?.classList.add('is-active');
    hide(footer);
    show(footerSucc);
  }
}

/** Hiển thị success view với thông tin booking */
function showSuccessView(formData) {
  const successName  = els.successName();
  const successDate  = els.successDate();
  const successTime  = els.successTime();
  const successPhone = els.successPhone();

  if (successName)  successName.textContent  = formData.name;
  if (successDate)  successDate.textContent  = formatDateVN(formData.bookingDate);
  if (successTime)  successTime.textContent  = formData.bookingTime;
  if (successPhone) successPhone.textContent = formData.phone;

  switchView('success');
}

/** Hiển thị lỗi global (conflict, server error) */
function showGlobalError(message) {
  const errorEl    = els.globalError();
  const errorTextEl = els.globalErrorText();

  if (errorTextEl) errorTextEl.textContent = message;
  if (errorEl) {
    errorEl.style.display = 'flex';
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/** Xử lý nút Quay lại trang chính */
function handleBackHome() {
  closeSheet();
}

/** Reset modal về trạng thái ban đầu */
function resetModal() {
  // Reset form
  els.form()?.reset();

  // Reset slot picker
  resetSlotPicker();

  // Reset date min
  const dateInput = els.dateInput();
  if (dateInput) dateInput.min = getTodayISOString();

  // Clear errors
  clearAllErrors();
  hide(els.globalError());

  // Hide char count
  const countEl = els.noteCharCount();
  if (countEl) countEl.style.display = 'none';

  // Switch back to form view
  switchView('form');
}
