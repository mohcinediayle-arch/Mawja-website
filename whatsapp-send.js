// api/whatsapp-send.js
// كيصيفط رسالة واتساب للزبون — نتيجة Mirror أو تأكيد رونديفو.
// كيستعمل Templates معتمدة من Meta (خاصك تخلقهم فـ Business Manager، شوف SETUP-API.md).

import { sendWhatsAppTemplate } from '../lib/whatsapp.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, phone, name, data } = req.body || {};
  if (!type || !phone || !name) {
    return res.status(400).json({ error: 'خاصك تبعت type, phone, name' });
  }

  try {
    let result;

    if (type === 'mirror') {
      const topProblem = (data && data.diagnosis && data.diagnosis[0]) || 'التحليل جاهز فالتطبيق';
      result = await sendWhatsAppTemplate(phone, 'mirror_result_ready', 'ar', [name, topProblem]);
    } else if (type === 'booking') {
      const day = (data && data.day) || '';
      const time = (data && data.time) || '';
      result = await sendWhatsAppTemplate(phone, 'booking_confirmation', 'ar', [name, day, time]);
    } else {
      return res.status(400).json({ error: 'type غير معروف — خاصو يكون mirror أو booking' });
    }

    return res.status(200).json({ ok: true, result });
  } catch (e) {
    return res.status(500).json({
      error: 'ما قدرناش نصيفطو الرسالة. تأكد أن الـ Template معتمد من Meta والرقم صحيح.',
      detail: String(e.message || e),
    });
  }
}
