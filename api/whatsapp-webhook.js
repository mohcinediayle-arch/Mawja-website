// api/whatsapp-webhook.js
// خاص Meta يتأكد من الرابط هادا فـ Business Manager (webhook URL).
// GET: للتحقق أول مرة. POST: كيوصلها كل رسالة/حالة توصل من واتساب.

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    // هنا تقدر تعالج ردود الزبناء إلى بغيتي تبني شات بوت أوتوماتيكي فالمستقبل
    console.log('WhatsApp webhook event:', JSON.stringify(req.body));
    return res.status(200).json({ received: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
