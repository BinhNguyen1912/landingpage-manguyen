/**
 * slot-picker.js — Time Slot Selection Component
 * Mẫnthợtóc Landing Page
 */

import { TIME_SLOTS } from '../config/constants.js';
import { clearFieldError } from '../utils/dom.js';

/** State của slot picker */
const state = {
  selectedSlot: null,
  currentDate:  null,
};

/** Container element */
let slotGridEl = null;

/** Callback khi user chọn slot */
let onSlotSelectCallback = null;

// ─────────────────────────────────────────────────────────────────

/**
 * Khởi tạo slot picker.
 * @param {string} gridElementId - ID của container element
 * @param {Function} [onSelect] - Callback khi slot được chọn
 */
export function initSlotPicker(gridElementId, onSelect) {
  slotGridEl = document.getElementById(gridElementId);
  onSlotSelectCallback = onSelect || null;

  if (!slotGridEl) {
    console.warn(`[SlotPicker] Element #${gridElementId} không tìm thấy.`);
  }
}

// ─────────────────────────────────────────────────────────────────

/**
 * Load danh sách slot cho một ngày và render lại grid.
 * @param {string} date - YYYY-MM-DD
 */
export function loadSlotsForDate(date) {
  if (!slotGridEl) return;

  // Nếu không truyền date, lấy ngày hôm nay (YYYY-MM-DD)
  if (!date) {
    const now = new Date();
    const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    date = vnTime.toISOString().slice(0, 10);
  }

  // Reset slot đã chọn nếu đổi sang ngày khác
  if (state.currentDate !== date) {
    state.selectedSlot = null;
    const displayEl = document.getElementById('slot-selected-display');
    if (displayEl) displayEl.textContent = '';
  }

  state.currentDate = date;
  renderSlots();
}

// ─────────────────────────────────────────────────────────────────

/**
 * Lấy slot hiện tại đang được chọn.
 * @returns {string|null}
 */
export function getSelectedSlot() {
  return state.selectedSlot;
}

/**
 * Reset slot picker về trạng thái ban đầu.
 */
export function resetSlotPicker() {
  state.selectedSlot = null;
  state.currentDate  = null;
  renderEmpty('Vui lòng chọn ngày trước');
}

// ─────────────────────────────────────────────────────────────────
// RENDERING
// ─────────────────────────────────────────────────────────────────

/** Render danh sách slot button — Cho phép chọn tất cả các giờ */
function renderSlots() {
  if (!slotGridEl) return;

  if (!TIME_SLOTS || TIME_SLOTS.length === 0) {
    renderEmpty('Hiện chưa có khung giờ nào.');
    return;
  }

  slotGridEl.innerHTML = '';
  slotGridEl.className = 'slot-grid';

  TIME_SLOTS.forEach((time) => {
    const isSelected = state.selectedSlot === time;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = isSelected ? 'slot-item slot-item--selected' : 'slot-item';
    btn.dataset.time = time;
    btn.setAttribute('aria-label', isSelected ? `${time} — Đang chọn` : `Chọn khung giờ ${time}`);
    btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    btn.setAttribute('role', 'radio');

    btn.innerHTML = `<span class="slot-time">${time}</span>`;

    btn.addEventListener('click', () => handleSlotClick(time));

    slotGridEl.appendChild(btn);
  });
}

/** Render empty / placeholder message */
function renderEmpty(message = '') {
  if (!slotGridEl) return;
  slotGridEl.innerHTML = `<p class="slots-empty">${message}</p>`;
  slotGridEl.className = 'slot-grid';
}

// ─────────────────────────────────────────────────────────────────
// EVENT HANDLER
// ─────────────────────────────────────────────────────────────────

/** Xử lý khi user click vào một slot */
function handleSlotClick(time) {
  // Toggle: nếu click vào slot đang chọn → bỏ chọn
  state.selectedSlot = (state.selectedSlot === time) ? null : time;

  // Cập nhật display text bên cạnh label
  const displayEl = document.getElementById('slot-selected-display');
  if (displayEl) {
    displayEl.textContent = state.selectedSlot ? `— ${state.selectedSlot}` : '';
  }

  // Xóa error nếu đã chọn
  if (state.selectedSlot) {
    clearFieldError('error-time', 'slot-grid');
  }

  // Re-render để update UI
  renderSlots();

  // Callback
  if (onSlotSelectCallback) {
    onSlotSelectCallback(state.selectedSlot);
  }
}
