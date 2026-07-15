// api/save-request.js
// كيسجل كل طلب/زبون محتمل فقاعدة بيانات Postgres باش فريق MAWJA يتابعه.
// خاصك تزيد Postgres database من Vercel (Storage tab) — كيزيد POSTGRES_URL أوتوماتيكياً.

import { sql } from '@vercel/postgres';
import { sendWhatsAppTemplate } from '../lib/whatsapp.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, sector, city, phone, payload } = req.body || {};
  if (!name || !sector || !city) {
    return res.status(400).json({ error: 'خاصك تبعت name, sector, city على الأقل' });
  }

  try {
    // كيخلق الجدول إلى ما كانش موجود (أول مرة غير)
    await sql`
      CREATE TABLE IF NOT EXISTS mirror_requests (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        sector TEXT NOT NULL,
        city TEXT NOT NULL,
        phone TEXT,
        payload JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    const result = await sql`
      INSERT INTO mirror_requests (name, sector, city, phone, payload)
      VALUES (${name}, ${sector}, ${city}, ${phone || null}, ${JSON.stringify(payload || {})})
      RETURNING id, created_at;
    `;

    // نخبرو فريق MAWJA بواتساب — إلى فشلت ما كتوقفش العملية
    if (process.env.MAWJA_TEAM_PHONE) {
      try {
        await sendWhatsAppTemplate(
          process.env.MAWJA_TEAM_PHONE,
          'lead_notification',
          'ar',
          [name, sector, city, phone || 'ما تزادش']
        );
      } catch (whatsappErr) {
        console.error('WhatsApp notify failed:', whatsappErr);
      }
    }

    return res.status(200).json({ ok: true, id: result.rows[0].id, created_at: result.rows[0].created_at });
  } catch (e) {
    return res.status(500).json({ error: 'خطأ فقاعدة البيانات', detail: String(e) });
  }
}
