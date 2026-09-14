/**
 * response.js — Standard API Response Helpers
 * Mẫnthợtóc API
 */

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type':                 'application/json',
};

/**
 * Gửi response thành công (tương thích cả Express res và Fetch Response)
 */
export function ok(resOrData, dataOrStatus, status = 200) {
  // Nếu resOrData là Express res object
  if (resOrData && typeof resOrData.status === 'function') {
    const res = resOrData;
    const data = dataOrStatus;
    const statusCode = typeof status === 'number' ? status : 200;
    
    Object.entries(CORS_HEADERS).forEach(([key, val]) => {
      res.setHeader(key, val);
    });
    return res.status(statusCode).json(data);
  }

  // Trường hợp dùng Web Response API (Edge / Fetch)
  const data = resOrData;
  const statusCode = typeof dataOrStatus === 'number' ? dataOrStatus : status;
  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: CORS_HEADERS,
  });
}

/**
 * Gửi response lỗi
 */
export function error(resOrMessage, messageOrStatus, statusOrCode = 400, code = 'BAD_REQUEST') {
  // Express res mode
  if (resOrMessage && typeof resOrMessage.status === 'function') {
    const res = resOrMessage;
    const message = messageOrStatus;
    const statusCode = typeof statusOrCode === 'number' ? statusOrCode : 400;
    const errCode = typeof statusOrCode === 'string' ? statusOrCode : code;

    Object.entries(CORS_HEADERS).forEach(([key, val]) => {
      res.setHeader(key, val);
    });
    return res.status(statusCode).json({ success: false, code: errCode, message });
  }

  // Web Response mode
  const message = resOrMessage;
  const statusCode = typeof messageOrStatus === 'number' ? messageOrStatus : 400;
  const errCode = typeof statusOrCode === 'string' ? statusOrCode : 'BAD_REQUEST';

  return new Response(
    JSON.stringify({ success: false, code: errCode, message }),
    { status: statusCode, headers: CORS_HEADERS }
  );
}

/**
 * Xử lý OPTIONS preflight request (CORS)
 */
export function handleOptions(res) {
  if (res && typeof res.status === 'function') {
    Object.entries(CORS_HEADERS).forEach(([key, val]) => {
      res.setHeader(key, val);
    });
    return res.status(204).end();
  }
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
