/**
 * dom.js — DOM Helper Utilities
 * Mẫnthợtóc Landing Page
 */

/**
 * Shorthand querySelector.
 * @param {string} selector
 * @param {Element|Document} [context=document]
 * @returns {Element|null}
 */
export const $ = (selector, context = document) =>
  context.querySelector(selector);

/**
 * Shorthand querySelectorAll.
 * @param {string} selector
 * @param {Element|Document} [context=document]
 * @returns {Element[]}
 */
export const $$ = (selector, context = document) =>
  Array.from(context.querySelectorAll(selector));

/**
 * Hiển thị một element (xóa display:none).
 * @param {Element} el
 */
export function show(el) {
  if (el) el.style.display = '';
}

/**
 * Ẩn một element (thêm display:none).
 * @param {Element} el
 */
export function hide(el) {
  if (el) el.style.display = 'none';
}

/**
 * Toggle class trên element.
 * @param {Element} el
 * @param {string} className
 * @param {boolean} [force]
 */
export function toggleClass(el, className, force) {
  if (!el) return;
  if (typeof force === 'boolean') {
    el.classList.toggle(className, force);
  } else {
    el.classList.toggle(className);
  }
}

/**
 * Hiển thị thông báo lỗi cho một field.
 * @param {string} fieldErrorId - ID của span lỗi (VD: 'error-name')
 * @param {string} message
 * @param {string} fieldId - ID của input field
 */
export function showFieldError(fieldErrorId, message, fieldId) {
  const errorEl = document.getElementById(fieldErrorId);
  const fieldEl = document.getElementById(fieldId);

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'flex';
  }
  if (fieldEl) {
    fieldEl.classList.add('form-input--error');
    fieldEl.setAttribute('aria-invalid', 'true');
  }
}

/**
 * Xóa thông báo lỗi của một field.
 * @param {string} fieldErrorId
 * @param {string} fieldId
 */
export function clearFieldError(fieldErrorId, fieldId) {
  const errorEl = document.getElementById(fieldErrorId);
  const fieldEl = document.getElementById(fieldId);

  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
  if (fieldEl) {
    fieldEl.classList.remove('form-input--error');
    fieldEl.removeAttribute('aria-invalid');
  }
}

/**
 * Xóa tất cả lỗi trong form.
 */
export function clearAllErrors() {
  document.querySelectorAll('.form-error').forEach((el) => {
    el.textContent = '';
    el.style.display = 'none';
  });
  document.querySelectorAll('.form-input--error').forEach((el) => {
    el.classList.remove('form-input--error');
    el.removeAttribute('aria-invalid');
  });
}

/**
 * Hiển thị toast notification ngắn hạn.
 * @param {string} message
 * @param {'success'|'error'} type
 * @param {number} [duration=3000] - ms
 */
export function showToast(message, type = 'success', duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast toast--${type}`;

  // Force reflow để animation chạy lại
  void toast.offsetWidth;
  toast.classList.add('is-visible');

  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, duration);
}

/**
 * Khóa/mở body scroll (khi modal đang mở).
 * @param {boolean} locked
 */
export function setBodyScrollLock(locked) {
  if (locked) {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  } else {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }
}

/**
 * Lazy load images — add 'loaded' class khi ảnh đã tải xong.
 */
export function initLazyImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  const markLoaded = (img) => {
    img.classList.add('loaded');
    const parentItem = img.closest('.gallery-item');
    if (parentItem) parentItem.classList.add('loaded');
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.addEventListener('load', () => markLoaded(img), { once: true });
            img.addEventListener('error', () => markLoaded(img), { once: true });
            // Nếu đã cached thì load ngay
            if (img.complete && img.naturalWidth > 0) markLoaded(img);
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '100px' }
    );

    images.forEach((img) => observer.observe(img));
  } else {
    // Fallback cho trình duyệt cũ
    images.forEach((img) => markLoaded(img));
  }
}
