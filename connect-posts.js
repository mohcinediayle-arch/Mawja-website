// api/connect-posts.js
// لوحة إعلانات MAWJA Connect — مشتركة بين كاع الزبناء، محفوظة فـ Postgres حقيقي.
// GET  → يرجع كاع الإعلانات (آخر 200)
// POST → يزيد إعلان جديد

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS connect_posts (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        city TEXT,
        author_name TEXT,
        author_phone TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    if (req.method === 'GET') {
      const result = await sql`
        SELECT id, type, title, description, city, author_name, author_phone, created_at
        FROM connect_posts ORDER BY created_at DESC LIMIT 200;
      `;
      return res.status(200).json({ posts: result.rows });
    }

    if (req.method === 'POST') {
      const { type, title, description, city, name, phone } = req.body || {};
      if (!type || !title || !description) {
        return res.status(400).json({ error: 'خاصك تبعت type, title, description' });
      }
      const result = await sql`
        INSERT INTO connect_posts (type, title, description, city, author_name, author_phone)
        VALUES (${type}, ${title}, ${description}, ${city || ''}, ${name || ''}, ${phone || ''})
        RETURNING id, created_at;
      `;
      return res.status(200).json({ ok: true, id: result.rows[0].id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'خطأ فقاعدة البيانات', detail: String(e) });
  }
}
