// api/profile.js
// كيخلي بيانات الزبون (البروفايل، الرونديفوهات، التشخيص...) مربوطة برقم الهاتف
// باش يقدر يدخل ليها من أي جهاز أو متصفح.
// GET  ?phone=XXX  → كيرجع البيانات المحفوظة
// POST { phone, name, sector, city, data }  → كيسجل/كيحدث البيانات

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS business_accounts (
        phone TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sector TEXT NOT NULL,
        city TEXT NOT NULL,
        data JSONB DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    if (req.method === 'GET') {
      const phone = (req.query.phone || '').trim();
      if (!phone) return res.status(400).json({ error: 'خاصك تبعت phone' });
      const result = await sql`SELECT * FROM business_accounts WHERE phone = ${phone};`;
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'ما لقيناش حساب بهاد الرقم' });
      }
      return res.status(200).json({ ok: true, account: result.rows[0] });
    }

    if (req.method === 'POST') {
      const { phone, name, sector, city, data } = req.body || {};
      if (!phone || !name || !sector || !city) {
        return res.status(400).json({ error: 'خاصك تبعت phone, name, sector, city' });
      }
      await sql`
        INSERT INTO business_accounts (phone, name, sector, city, data, updated_at)
        VALUES (${phone}, ${name}, ${sector}, ${city}, ${JSON.stringify(data || {})}, NOW())
        ON CONFLICT (phone) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          city = EXCLUDED.city,
          data = EXCLUDED.data,
          updated_at = NOW();
      `;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'خطأ فقاعدة البيانات', detail: String(e) });
  }
}
