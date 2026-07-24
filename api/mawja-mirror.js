// api/mawja-mirror.js
// نقطة النهاية ديال التحليل الذكي (MAWJA Mirror) — مدعوم بـ Google Gemini (مجاني)

import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY ماشي مضافة فـ Environment Variables' });
  }

  const { name, sector, city } = req.body || {};
  if (!name || !sector || !city) {
    return res.status(400).json({ error: 'خاصك تبعت name, sector, city' });
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `أنت مستشار أعمال رقمي خبير فالسوق المغربي. حلل هاد البزنس وجاوبني بالدارجة المغربية.
معلومات البزنس — الاسم: ${name}. القطاع: ${sector}. المدينة: ${city}.
رجّع الجواب بصيغة JSON بالضبط بهاد الشكل:
{"diagnosis":["مشكلة 1","مشكلة 2","مشكلة 3","مشكلة 4"],"competition":"فقرة قصيرة عن المنافسة المتوقعة فهاد المدينة لهاد القطاع","strategy_map":["خطوة 1","خطوة 2","خطوة 3","خطوة 4"],"ad_channels":["قناة: سبب مختصر","قناة: سبب مختصر","قناة: سبب مختصر"],"content_plan":[{"day":"الاثنين","idea":"..."},{"day":"الأربعاء","idea":"..."},{"day":"الجمعة","idea":"..."}]}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const text = (response.text || '').trim();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ error: 'ما قدرناش نفهمو جواب الذكاء الاصطناعي', raw: text });
    }

    return res.status(200).json(parsed);
  } catch (e) {
    console.error('Gemini API Error:', e);
    return res.status(500).json({ error: 'خطأ فالسيرفر', detail: String(e) });
  }
}
