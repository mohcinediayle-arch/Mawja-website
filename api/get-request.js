// api/get-request.js
// كيرجع لائحة الطلبات المسجلة — لفريق MAWJA فقط.
// محمي بـ ADMIN_KEY باش حتى واحد ما يقدرش يشوف بيانات الزبناء بلا صلاحية.

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminKey = process.env.ADMIN_KEY;
  const providedKey = req.query.key || req.headers['x-admin-key'];

  if (!adminKey) {
    return res.status(500).json({ error: 'ADMIN_KEY ماشي مضافة فـ Environment Variables' });
  }
  if (providedKey !== adminKey) {
    return res.status(401).json({ error: 'غير مصرح — خاصك المفتاح الصحيح' });
  }

  try {
    const result = await sql`
      SELECT id, name, sector, city, phone, payload, created_at
      FROM mirror_requests
      ORDER BY created_at DESC
      LIMIT 200;
    `;
    return res.status(200).json({ ok: true, count: result.rows.length, requests: result.rows });
  } catch (e) {
    return res.status(500).json({ error: 'خطأ فقاعدة البيانات', detail: String(e) });
  }
}
