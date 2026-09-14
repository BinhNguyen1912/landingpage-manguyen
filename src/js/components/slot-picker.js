/**
 * slot-picker.js — Time Slot Selection Component
 * Mẫnthợtóc Landing Page
 */

import { TIME_SLOTS } from '../config/constants.js';
import { fetchBookedSlots } from '../services/api.js';
import { clearFieldError, showFieldError } from '../utils/dom.js';

/**
 * @typedef {Object} SlotPickerState
 * @property {string|null} selectedSlot - Slot đang được chọn
 * @property {string[]}    bookedSlots  - Slot đã bị đặt từ server
 * @property {boolean}     loading      - Đang fetch dữ liệu
 * @property {string|null} currentDate  - Ngày hiện tại đang xem
 */

/** State của slot picker */
const state = {
  selectedSlot: null,
  bookedSlots:  [],
  loading:      false,
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
export async function loadSlotsForDate(date) {
  if (!slotGridEl) return;
  if (!date) {
    renderEmpty('Vui lòng chọn ngày trước');
    return;
  }

  // Reset nếu đổi sang ngày khác
  if (state.currentDate !== date) {
    state.selectedSlot = null;
  }

  state.currentDate = date;
  state.loading = true;
  renderSkeleton();

  try {
    const booked = await fetchBookedSlots(date);
    state.bookedSlots = Array.isArray(booked) ? booked : [];
  } catch (err) {
    console.error('[SlotPicker] Không tải được lịch đặt:', err);
    state.bookedSlots = [];
  } finally {
    state.loading = false;
    renderSlots();
  }
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
  state.bookedSlots  = [];
  state.loading      = false;
  state.currentDate  = null;
  renderEmpty('Vui lòng chọn ngày trước');
}

// ─────────────────────────────────────────────────────────────────
// RENDERING
// ─────────────────────────────────────────────────────────────────

/** Render danh sách slot button */
function renderSlots() {
  if (!slotGridEl) return;

  if (TIME_SLOTS.length === 0) {
    renderEmpty('Hiện chưa có khung giờ nào.');
    return;
  }

  slotGridEl.innerHTML = '';
  slotGridEl.className = 'slot-grid';

  TIME_SLOTS.forEach((time) => {
    const isBooked   = state.bookedSlots.includes(time);
    const isSelected = state.selectedSlot === time;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = buildSlotClass(isBooked, isSelected);
    btn.dataset.time = time;
    btn.disabled = isBooked;
    btn.setAttribute('aria-label',
      isBooked
        ? `${time} — Đã được đặt`
        : isSelected
          ? `${time} — Đang chọn`
          : `Chọn khung giờ ${time}`
    );
    btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    btn.setAttribute('role', 'radio');

    btn.innerHTML = `
      <span class="slot-time">${time}</span>
      ${isBooked ? '<span class="slot-status">Đã đặt</span>' : ''}
    `;

    if (!isBooked) {
      btn.addEventListener('click', () => handleSlotClick(time));
    }

    slotGridEl.appendChild(btn);
  });
}

/** Xây dựng className cho từng slot */
function buildSlotClass(isBooked, isSelected) {
  let cls = 'slot-item';
  if (isBooked)   cls += ' slot-item--booked';
  if (isSelected) cls += ' slot-item--selected';
  return cls;
}

/** Render skeleton loading */
function renderSkeleton() {
  if (!slotGridEl) return;
  slotGridEl.innerHTML = '';
  slotGridEl.className = 'slot-grid slot-grid--loading';

  // Render 6 skeleton cards
  for (let i = 0; i < 6; i++) {
    const div = document.createElement('div');
    div.className = 'slot-skeleton';
    div.setAttribute('aria-hidden', 'true');
    slotGridEl.appendChild(div);
  }
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
  if (state.bookedSlots.includes(time)) return;

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
