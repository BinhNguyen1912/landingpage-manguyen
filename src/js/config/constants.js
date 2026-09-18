/**
 * constants.js — Configuration & Static Data
 * Mẫnthợtóc Landing Page
 */

/** Base URL của API (tự động dùng relative path khi deploy lên Vercel) */
export const API_BASE_URL = '/api';

/** Các endpoint API */
export const API_ENDPOINTS = {
  CREATE_BOOKING: `${API_BASE_URL}/bookings`,
  GET_AVAILABILITY: `${API_BASE_URL}/bookings/availability`,
  HEALTH: `${API_BASE_URL}/health`,
};

/**
 * Danh sách khung giờ làm việc của Mẫn.
 * Format: 'HH:MM' (24h)
 */
export const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
];

/** Thông tin thương hiệu */
export const BRAND = {
  username: 'nguyen.anh.man',
  displayName: 'Mẫnthợtóc',
  facebook: 'https://www.facebook.com/man.nguyen.528647',
  tiktok: 'https://www.tiktok.com/@man.tho.toc',
  instagram: 'https://www.instagram.com/nguyen.anh.man/',
  phone: '+84869947020',
  address: 'Chung cư hacom, toà A1, phường Phan Rang, tỉnh Khánh Hoà',
};

/** Validation rules */
export const VALIDATION = {
  name: {
    minLength: 2,
    maxLength: 100,
  },
  phone: {
    /** Regex: số VN bắt đầu bằng 0, 10-11 chữ số */
    pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
    maxLength: 11,
  },
  note: {
    maxLength: 500,
  },
};

/** Timeout cho API requests (ms) */
export const API_TIMEOUT_MS = 10_000;

/**
 * IMAGES — Đường dẫn tập trung toàn bộ ảnh trong dự án.
 *
 * Khi muốn đổi ảnh, chỉ cần sửa URL tại đây.
 * HTML và JS sẽ đọc từ các biến này thay vì hardcode path.
   * Cấu trúc thư mục:
   *   public/
   *   └── assets/
   *       └── images/
   *           ├── avatar.jpg               ← Ảnh chân dung chính (hero)
   *           └── gallery/
   *               ├── mot.jpeg             ← Ảnh mẫu tóc (slot 1, hiển thị to hơn 2x2)
   *               ├── hai.jpeg
   *               ├── ba.jpeg
   *               ├── bon.jpeg
   *               ├── nam.jpeg
   *               ├── sau.jpeg
   *               ├── bay.jpg
   *               ├── tam.jpg
   *               └── chin.jpg
   */
export const IMAGES = {
  /** Ảnh chân dung chính hiển thị ở hero section */
  AVATAR: '/public/assets/images/avatar.jpg',

  /** Bộ sưu tập mẫu tóc — Lookbook tóc nam (9 ảnh) */
  GALLERY: [
    '/public/assets/images/gallery/bay.jpg',
    '/public/assets/images/gallery/tam.jpg',
    '/public/assets/images/gallery/chin.jpg',
    '/public/assets/images/gallery/bon.jpeg',
    '/public/assets/images/gallery/nam.jpeg',
    '/public/assets/images/gallery/sau.jpeg',
    '/public/assets/images/gallery/mot.jpeg',
    '/public/assets/images/gallery/hai.jpeg',
    '/public/assets/images/gallery/ba.jpeg',
  ],

  /** Ảnh phong cách / cuộc sống cá nhân — My Life */
  LIFE: [
    '/public/assets/images/life/life-01.webp',
    '/public/assets/images/life/life-02.webp',
  ],
};
