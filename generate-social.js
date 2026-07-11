// api/generate-social.js
// كيولّد خطة محتوى سوشيال ميديا (أسبوع كامل) حسب القطاع والمدينة.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY ماشي مضافة فـ Environment Variables' });
  }

  const { name, sector, city } = req.body || {};
  if (!name || !sector || !city) {
    return res.status(400).json({ error: 'خاصك تبعت name, sector, city' });
  }

  const prompt = `أنت مدير محتوى سوشيال ميديا. اقترح خطة محتوى لمدة أسبوع (4 منشورات) لبزنس. جاوب JSON فقط بلا markdown بهاد الشكل:
{"week":[{"day":"الاثنين","platform":"Instagram","idea":"فكرة المنشور","caption":"كابشن قصير جاهز (سطرين)"},{"day":"الأربعاء","platform":"...","idea":"...","caption":"..."},{"day":"الجمعة","platform":"...","idea":"...","caption":"..."},{"day":"الأحد","platform":"...","idea":"...","caption":"..."}]}
البزنس — الاسم: ${name}. القطاع: ${sector}. المدينة: ${city}. جاوب بالدارجة المغربية، الكابشن يكون طبيعي وقريب من الزبون، بلا أي نص خارج الـ JSON.`;

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
        max_tokens: 900,
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
