# كيفاش تخدم الـ API — خطوة بخطوة

## 1. رفع الملفات لـ GitHub
زيد فولدر `api/` فجذر المشروع (نفس المستوى ديال `index.html`)، وحط فيه هاد 5 ملفات:
- `api/mawja-mirror.js`
- `api/generate-website.js`
- `api/generate-social.js`
- `api/save-request.js`
- `api/get-request.js`

فـ GitHub: **Add file → Upload files** → فخانة اسم الملف اكتب المسار كامل (مثلاً `api/mawja-mirror.js`) → **Commit changes**. كرر لكل ملف.

## 2. زيد ANTHROPIC_API_KEY
1. سير لـ [console.anthropic.com](https://console.anthropic.com) → API Keys → دير مفتاح جديد
2. فمشروع Vercel ديالك: **Settings → Environment Variables**
3. زيد: `ANTHROPIC_API_KEY` = المفتاح ديالك، فـ Production + Preview
4. **Redeploy** المشروع باش التغيير يتفعل

## 3. زيد قاعدة البيانات (Postgres)
1. فمشروع Vercel: **Storage → Create Database → Postgres** (أو Neon)
2. Vercel كيزيد أوتوماتيكياً `POSTGRES_URL` ومتغيرات مشابهة للمشروع
3. زيد فـ `package.json` ديالك السطر: `"@vercel/postgres": "latest"` فـ dependencies، أو دير:
   ```
   npm install @vercel/postgres
   ```
4. الجدول (`mirror_requests`) كيتخلق وحدو أول مرة تستعمل `save-request` — ما خاصكش تديرو يدوياً

## 4. زيد ADMIN_KEY (للحماية)
فـ Environment Variables زيد: `ADMIN_KEY` = كود سري ديالك (مثلاً كلمة طويلة عشوائية). هادشي كيحمي `/api/get-request` باش حتى واحد ما يقدرش يشوف بيانات الزبناء بلا الكود هادا.

باش تشوف الطلبات المسجلة: `https://mawja-website.vercel.app/api/get-request?key=الكود_السري`

## 5. تأكد أنها خدامة
بعد الـ Redeploy، دخل للتطبيق → تاب **Mirror** → دوز اسم بزنس تجريبي → ضغط "حلل بزنسي دابا". إلى ظهر ليك التحليل = خدامة. إلى ظهر رسالة حمراء = رجع تأكد من الخطوة 2 و3.

## 6. ربط WhatsApp (Meta Cloud API)

### أ. زيد الملفات
زيد فولدر `lib/` الملف `lib/whatsapp.js`، وفولدر `api/` هاد 2 الملفات الجداد:
- `api/whatsapp-send.js`
- `api/whatsapp-webhook.js`

### ب. دير حساب Meta Business + WhatsApp
1. سير لـ [developers.facebook.com](https://developers.facebook.com) → دير تطبيق جديد → نوع "Business"
2. زيد منتج **WhatsApp** للتطبيق
3. من صفحة WhatsApp → API Setup: غادي تلقى:
   - **Temporary access token** (مؤقت 24 ساعة للتجربة) — للإنتاج خاصك **System User Token** دائم من Business Settings
   - **Phone Number ID**
4. **Business Verification**: باش تصيفط رسائل لأرقام برا لائحة التجربة، خاص Meta يتحقق من البزنس ديالك (Business Manager → Business Settings → Security Center) — كتاخد بين يوم ليومين عادةً

### ج. زيد Environment Variables فـ Vercel
| المتغير | القيمة |
|---|---|
| `WHATSAPP_TOKEN` | الـ Access Token (المؤقت أو الدائم) |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone Number ID |
| `WHATSAPP_VERIFY_TOKEN` | كود كتخترعو أنت (مثلاً `mawja2026verify`) — غادي تحتاجو فالخطوة اللي جاية |
| `MAWJA_TEAM_PHONE` | رقم واتساب ديال الفريق باش يتوصل بإشعارات الـ Leads (بصيغة 2126XXXXXXXX) |

### د. فعّل الـ Webhook
1. فـ Meta App Dashboard → WhatsApp → Configuration → Webhook
2. Callback URL: `https://mawja-website.vercel.app/api/whatsapp-webhook`
3. Verify Token: نفس القيمة ديال `WHATSAPP_VERIFY_TOKEN`
4. اشترك (Subscribe) فـ `messages`

### هـ. دير 3 Templates فـ Meta Business Manager (WhatsApp Manager → Message Templates)
الرسائل التلقائية (business-initiated) خاصها تكون بـ Template معتمد من Meta — ما تقدرش تصيفط نص حر للزبون قبل ما هو يبدا المحادثة. دير هاد الـ 3:

**1. `mirror_result_ready`** (Category: Utility, Language: Arabic)
```
مرحبا {{1}}، التحليل الذكي ديال البزنس ديالك (MAWJA Mirror) جاهز.
أهم نقطة: {{2}}
زور التطبيق باش تشوف التفاصيل كاملة 🪞
```

**2. `booking_confirmation`** (Category: Utility, Language: Arabic)
```
مرحبا {{1}}، تأكدنا الرونديفو ديالك يوم {{2}} على الساعة {{3}}.
شكراً على ثقتك فـ MAWJA 🙏
```

**3. `lead_notification`** (Category: Utility, Language: Arabic)
```
طلب جديد فـ MAWJA Mirror 🔔
الاسم: {{1}}
القطاع: {{2}}
المدينة: {{3}}
الهاتف: {{4}}
```

كل Template كيتصادق عليه Meta فدقائق لساعات. حيت غادي يخدم غير من بعد الموافقة.

### و. ملاحظة مهمة على التسعير والحدود
- Meta Cloud API عندها **باقة مجانية** (1000 محادثة/شهر تقريباً)، من بعد كل محادثة بثمن صغير
- إلى الزبون هو اللي بدا المحادثة (كتب ليكم على واتساب) → عندكم 24 ساعة نافذة تجاوبو بنص حر بلا Template
- إلى راه أنتم اللي بغيتو تبداو (تأكيد رونديفو، نتيجة Mirror) → خاص Template معتمد، ديما

## ملاحظة مهمة
مفاتيح الـ API (Anthropic و WhatsApp) **ما خاصهمش يكونو فالمتصفح أبداً** (يعني ماشي فـ index.html ولا فـ mawja-dashboard.html). خاصهم يبقاو غير فالسيرفر (Environment Variables) — ملفات `api/` و `lib/` هي اللي كتخبيهم وتخدم بيهم بالنيابة عن التطبيق. هادشي معيار أمان أساسي فأي تطبيق احترافي.
