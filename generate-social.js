// api/generate-social.js
// كيولّد خطة محتوى سوشيال ميديا (أسبوع كامل) — مدعوم بـ Gemini (مجاني)

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

  const prompt = `أنت مدير محتوى سوشيال ميديا. اقترح خطة محتوى لمدة أسبوع (4 منشورات) لبزنس.
البزنس — الاسم: ${name}. القطاع: ${sector}. المدينة: ${city}. الكابشن يكون بالدارجة المغربية، طبيعي وقريب من الزبون.
رجّع الجواب بصيغة JSON بالضبط بهاد الشكل:
{"week":[{"day":"الاثنين","platform":"Instagram","idea":"فكرة المنشور","caption":"كابشن قصير جاهز (سطرين)"},{"day":"الأربعاء","platform":"...","idea":"...","caption":"..."},{"day":"الجمعة","platform":"...","idea":"...","caption":"..."},{"day":"الأحد","platform":"...","idea":"...","caption":"..."}]}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 900,
        temperature: 0.8,
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
