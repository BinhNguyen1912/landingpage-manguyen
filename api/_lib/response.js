/**
 * response.js — Standard API Response Helpers
 * Mẫnthợtóc API
 */

/**
 * CORS headers cho tất cả API responses.
 * Thay đổi 'Access-Control-Allow-Origin' sang domain thật khi deploy production.
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type':                 'application/json',
};

/**
 * Trả về response thành công.
 * @param {object} data
 * @param {number} [status=200]
 * @returns {Response}
 */
export function ok(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS,
  });
}

/**
 * Trả về response lỗi.
 * @param {string} message
 * @param {number} [status=400]
 * @param {string} [code]
 * @returns {Response}
 */
export function error(message, status = 400, code = 'BAD_REQUEST') {
  return new Response(
    JSON.stringify({ success: false, code, message }),
    { status, headers: CORS_HEADERS }
  );
}

/**
 * Xử lý OPTIONS preflight request (CORS).
 * @returns {Response}
 */
export function handleOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
