// api/mawja-mirror.js
// نقطة النهاية ديال التحليل الذكي (MAWJA Mirror)
// كتخدم فالسيرفر فقط — الـ API Key ديال Anthropic خبايا هنا، ماشي فالمتصفح.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY ماشي مضافة فـ Environment Variables ديال Vercel',
    });
  }

  const { name, sector, city } = req.body || {};
  if (!name || !sector || !city) {
    return res.status(400).json({ error: 'خاصك تبعت name, sector, city' });
  }

  const prompt = `أنت مستشار أعمال رقمي خبير فالسوق المغربي. حلل هاد البزنس وجاوبني JSON فقط، بلا أي نص زايد، بلا markdown، بلا backticks، بهاد الشكل بالضبط:
{"diagnosis":["مشكلة 1","مشكلة 2","مشكلة 3","مشكلة 4"],"competition":"فقرة قصيرة (سطرين-3) عن المنافسة المتوقعة فهاد المدينة لهاد القطاع","strategy_map":["خطوة 1","خطوة 2","خطوة 3","خطوة 4"],"ad_channels":["قناة: سبب مختصر","قناة: سبب مختصر","قناة: سبب مختصر"],"content_plan":[{"day":"الاثنين","idea":"..."},{"day":"الأربعاء","idea":"..."},{"day":"الجمعة","idea":"..."}]}
معلومات البزنس — الاسم: ${name}. القطاع: ${sector}. المدينة: ${city}. جاوب بالدارجة المغربية فقط.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: 'Anthropic API error', detail: errText });
    }

    const data = await response.json();
    let text = (data.content || []).map((b) => b.text || '').join('').trim();
    text = text.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ error: 'ما قدرناش نفهمو جواب الذكاء الاصطناعي', raw: text });
    }

    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: 'خطأ فالسيرفر', detail: String(e) });
  }
}
