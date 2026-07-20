// api/cron-followup.js
// Vercel كيصيفط طلب لهاد الرابط بشكل دوري (شوف vercel.json).
// كيقلب على الزبناء اللي دازو من MAWJA Mirror من 24-48 ساعة، ما توصلاتش ليهم رسالة متابعة،
// وكيصيفط ليهم واتساب: "شنو ما عجبكش؟"

import { sql } from '@vercel/postgres';
import { sendWhatsAppTemplate } from '../lib/whatsapp.js';

export default async function handler(req, res) {
  // حماية بسيطة باش حتى واحد ما يقدرش يصيفط الرابط هذا يدوياً بلا صلاحية
  const auth = req.headers['authorization'];
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'غير مصرح' });
  }

  try {
    // الزبناء اللي عندهم رقم، دازو من 24 لـ 48 ساعة، وما توصلاتش ليهم رسالة بعد
    const result = await sql`
      SELECT id, name, phone FROM mirror_requests
      WHERE phone IS NOT NULL AND phone != ''
        AND followup_sent = FALSE
        AND created_at <= NOW() - INTERVAL '24 hours'
        AND created_at >= NOW() - INTERVAL '48 hours'
      LIMIT 50;
    `;

    let sent = 0, failed = 0;
    for (const lead of result.rows) {
      try {
        await sendWhatsAppTemplate(lead.phone, 'feedback_followup_24h', 'ar', [lead.name]);
        await sql`UPDATE mirror_requests SET followup_sent = TRUE WHERE id = ${lead.id};`;
        sent++;
      } catch (e) {
        failed++;
      }
    }

    return res.status(200).json({ ok: true, checked: result.rows.length, sent, failed });
  } catch (e) {
    return res.status(500).json({ error: 'خطأ فالسيرفر', detail: String(e) });
  }
}
