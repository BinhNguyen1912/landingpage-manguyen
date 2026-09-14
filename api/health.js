/**
 * /api/health.js — Health Check Endpoint
 * Mẫnthợtóc API
 */

import { ok, handleOptions } from './_lib/response.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  return ok(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Mẫnthợtóc API',
  });
}
