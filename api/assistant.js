// api/assistant.js
// مساعد ذكي عام — MAWJA Engine مدعوم بـ Google Gemini & Grounding
import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY ماشي مضافة ف Environment Variables' });
  }

  const { question, name, sector, city, history } = req.body || {};
  if (!question) {
    return res.status(400).json({ error: 'خاصك تبعت question' });
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `أنت المساعد الذكي التابع لتطبيق MAWJA — منصة رقمية متكاملة تخدم بها شركات ومتاجر وأصحاب مهن حرة في المغرب والعالم العربي.

مهمتك: تجاوب بذكاء، دقة، واحترافية على أي سؤال استراتيجي أو تجاري يطرحه المستخدم، وتاخد بعين الاعتبار السياق التالي إلا كان متوفر:
- اسم البزنس: ${name || 'غير محدد'}
- القطاع: ${sector || 'غير محدد'}
- المدينة: ${city || 'غير محدد'}

خاصك:
- تجاوب بالدارجة المغربية الواضحة والمفهومة، أو بالعربية الفصحى إلا طلب المستخدم ذلك.
- تعطي نصائح عملية وقابلة للتطبيق، ماشي كلام عام.
- استغل خاصية البحث الحي المتاحة ليك للوصول لأحدث البيانات والمنافسين والأسعار عند الحاجة.
- تبقى مختصر ومباشر إلا كان السؤال بسيط، وتفصل إلا كان معقد.`;

  const contents = [];
  if (Array.isArray(history)) {
    history.slice(-6).forEach((h) => {
      if (h.role && h.content) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        });
      }
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: question }]
    model: 'gemini-2.5-flash',
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 900,
        temperature: 0.7,
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || '';
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.webSearchQueries;
    const usedSearch = Boolean(searchChunks && searchChunks.length > 0);

    return res.status(200).json({
      answer: text,
      searched: usedSearch
    });

  } catch (e) {
    console.error('Gemini API Error:', e);
    return res.status(500).json({ error: 'خطأ فالسيرفر', detail: String(e) });
  }
}
