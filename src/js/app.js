/**
 * app.js — Application Entry Point
 * Mẫnthợtóc Landing Page
 */

import { initBookingModal, openSheet } from './components/booking-modal.js';
import { initLazyImages }              from './utils/dom.js';
import { IMAGES, BRAND }               from './config/constants.js';

/**
 * Inject thông tin thương hiệu từ BRAND constant vào DOM.
 * Chỉ cần sửa BRAND trong constants.js là cập nhật được toàn bộ link và thông tin.
 */
function applyBrand() {
  // ─── Username & Display name ───────────────────────────────────
  const usernameEl = document.getElementById('hero-username');
  if (usernameEl) usernameEl.textContent = BRAND.username;

  const displayNameEl = document.getElementById('hero-display-name');
  if (displayNameEl) displayNameEl.textContent = BRAND.displayName;

  // ─── Social links trong hero ───────────────────────────────────
  const heroTiktok = document.getElementById('hero-tiktok-link');
  if (heroTiktok) heroTiktok.href = BRAND.tiktok;

  const heroFacebook = document.getElementById('hero-facebook-link');
  if (heroFacebook) heroFacebook.href = BRAND.facebook;

  // ─── Địa chỉ trong hero ─────────────────────────────────────────
  const heroAddress = document.getElementById('hero-address-text');
  if (heroAddress && BRAND.address) heroAddress.textContent = BRAND.address;

  // ─── Grid buttons ─────────────────────────────────────────────
  const btnFacebook = document.getElementById('btn-facebook');
  if (btnFacebook) btnFacebook.href = BRAND.facebook;

  const btnTiktok = document.getElementById('btn-tiktok');
  if (btnTiktok) btnTiktok.href = BRAND.tiktok;

  const btnInstagram = document.getElementById('btn-instagram');
  if (btnInstagram) btnInstagram.href = BRAND.instagram;

  const btnReviews = document.getElementById('btn-reviews');
  if (btnReviews) btnReviews.href = `${BRAND.facebook}/reviews`;

  const btnAddress = document.getElementById('btn-address');
  if (btnAddress) btnAddress.href = `tel:${BRAND.phone}`;

  // ─── Open Graph / meta title (runtime) ────────────────────────
  // (static meta trong HTML đã đủ cho SEO; đây chỉ update dynamic)
  document.title = `${BRAND.displayName} — Đặt lịch cắt tóc nam | ${BRAND.username}`;
}

/**
 * Inject đường dẫn ảnh từ IMAGES constant vào DOM.
 * Thay vì hardcode src trong HTML, JS sẽ set động từ constants.js.
 * → Chỉ cần sửa constants.js là đổi được ảnh.
 */
function applyImages() {
  // ─── Avatar hero ──────────────────────────────────────────────
  const avatar = document.getElementById('hero-avatar');
  if (avatar) {
    avatar.src = IMAGES.AVATAR;
    const touchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (touchIcon) touchIcon.href = IMAGES.AVATAR;
  }

  // ─── Gallery images ───────────────────────────────────────────
  const galleryImgs = document.querySelectorAll('[data-gallery-index]');
  galleryImgs.forEach((img) => {
    const index = parseInt(img.dataset.galleryIndex, 10);
    if (IMAGES.GALLERY[index]) img.src = IMAGES.GALLERY[index];
  });

  // ─── Life images ──────────────────────────────────────────────
  const lifeImgs = document.querySelectorAll('[data-life-index]');
  lifeImgs.forEach((img) => {
    const index = parseInt(img.dataset.lifeIndex, 10);
    if (IMAGES.LIFE[index]) img.src = IMAGES.LIFE[index];
  });
}

/**
 * Khởi động toàn bộ ứng dụng.
 * Được gọi khi DOM đã sẵn sàng.
 */
function init() {
  // ─── 1. Inject brand info từ constants ───────────────────────
  applyBrand();

  // ─── 2. Inject image paths từ constants ───────────────────────
  applyImages();

  // ─── 2. Booking Modal ─────────────────────────────────────────
  initBookingModal();

  // ─── 3. Attach booking triggers ───────────────────────────────
  document.getElementById('btn-open-booking')?.addEventListener('click', openSheet);
  document.getElementById('btn-consult-booking')?.addEventListener('click', openSheet);

  // ─── 4. Smooth scroll cho anchor links ────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ─── 5. Lazy load gallery images ──────────────────────────────
  initLazyImages();

  // ─── 6. Hero avatar fade-in khi load xong ─────────────────────
  const heroAvatar = document.getElementById('hero-avatar');
  if (heroAvatar) {
    heroAvatar.addEventListener('load', () => {
      heroAvatar.style.opacity = '1';
    });
    if (heroAvatar.complete) heroAvatar.style.opacity = '1';
  }
}

// ─── Bootstrap ────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
