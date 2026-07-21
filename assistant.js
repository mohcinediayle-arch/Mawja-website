// api/assistant.js
// مساعد ذكي عام — كيجاوب على أي سؤال استراتيجي/تجاري، عارف بسياق البزنس (القطاع، المدينة).
// كيقبل تاريخ المحادثة باش يبقى الجواب مترابط.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY ماشي مضافة فـ Environment Variables' });
  }

  const { question, name, sector, city, history } = req.body || {};
  if (!question) {
    return res.status(400).json({ error: 'خاصك تبعت question' });
  }

  const systemPrompt = `أنت المساعد الذكي ديال تطبيق MAWJA — مستشار أعمال خبير فالسوق المغربي والعالمي. كتجاوب بالدارجة المغربية، بشكل مباشر، عملي، ومفيد — بلا كلام عام فارغ. عندك أداة بحث فالإنترنت — استعملها كي السؤال يحتاج معلومة حديثة، رقم دقيق، اسم شركة/منصة حقيقية، أو استراتيجية مبنية على أمثلة حقيقية من شركات كبرى. جاوب فقرة قصيرة أو نقط، حسب السؤال. البزنس اللي كتساعدو الآن: الاسم "${name}"، القطاع "${sector}"، المدينة "${city}". استحضر هاد السياق فكل جواب كي يكون مناسب. إلى ما لقيتيش معلومة مؤكدة، قول ذلك بوضوح — ما تختلقش أرقام هواتف أو عناوين شركات ماشي متأكد منها.`;

  const messages = [];
  if (Array.isArray(history)) {
    history.slice(-6).forEach((h) => {
      if (h.role && h.content) messages.push({ role: h.role, content: h.content });
    });
  }
  messages.push({ role: 'user', content: question });

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
        system: systemPrompt,
        messages,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: 'Anthropic API error', detail: errText });
    }

    const data = await response.json();
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text || '')
      .join('\n')
      .trim();
    const usedSearch = (data.content || []).some((b) => b.type === 'server_tool_use' || b.type === 'web_search_tool_result');
    return res.status(200).json({ answer: text, searched: usedSearch });
  } catch (e) {
    return res.status(500).json({ error: 'خطأ فالسيرفر', detail: String(e) });
  }
}
