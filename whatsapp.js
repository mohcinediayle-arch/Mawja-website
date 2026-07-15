// lib/whatsapp.js
// دالة مشتركة للتواصل مع Meta WhatsApp Cloud API — كيستعملوها كاع ملفات api/*.

const GRAPH_VERSION = 'v20.0';

function getConfig() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    throw new Error('WHATSAPP_TOKEN أو WHATSAPP_PHONE_NUMBER_ID ماشي مضافين فـ Environment Variables');
  }
  return { token, phoneNumberId };
}

// كيصيفط الرقم لصيغة دولية (212...) باش يقبلها Meta
function normalizePhone(phone) {
  let digits = String(phone || '').replace(/[^0-9]/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = '212' + digits.slice(1);
  if (!digits.startsWith('212') && digits.length <= 10) digits = '212' + digits;
  return digits;
}

// رسائل بـ Template معتمد من Meta — الوحيدة اللي تقدر تصيفطها لزبون ما بداش هو المحادثة
// (business-initiated message خارج نافذة 24 ساعة خاصها Template معتمد)
export async function sendWhatsAppTemplate(to, templateName, languageCode, params = []) {
  const { token, phoneNumberId } = getConfig();
  const body = {
    messaging_product: 'whatsapp',
    to: normalizePhone(to),
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode || 'ar' },
      components: params.length
        ? [{ type: 'body', parameters: params.map((p) => ({ type: 'text', text: String(p) })) }]
        : [],
    },
  };
  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

// رسالة نص حرة — تخدم غير إلى الزبون هو اللي بدا المحادثة معكم فآخر 24 ساعة
export async function sendWhatsAppText(to, text) {
  const { token, phoneNumberId } = getConfig();
  const body = {
    messaging_product: 'whatsapp',
    to: normalizePhone(to),
    type: 'text',
    text: { body: text },
  };
  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}
