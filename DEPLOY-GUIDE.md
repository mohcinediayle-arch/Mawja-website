# 🌊 MAWJA PWA — دليل النشر الكامل

## الملفات الموجودة
```
mawja-pwa/
├── public/
│   ├── index.html       ← الصفحة الرئيسية + PWA setup
│   ├── manifest.json    ← إعدادات التطبيق
│   ├── sw.js            ← Service Worker (offline + cache)
│   ├── icon-192.png     ← أيقونة التطبيق
│   └── icon-512.png     ← أيقونة كبيرة
└── src/
    └── App.jsx          ← كود التطبيق (MAWJA-App.jsx)
```

---

## 🚀 خطوة 1: GitHub

1. سجّل في https://github.com
2. "New Repository" ← اسمه: `mawja-app`
3. Public ← Create
4. ارفع كل الملفات

---

## 🌐 خطوة 2: Vercel (الأسهل والأسرع)

1. روح على https://vercel.com
2. "Import Git Repository" ← اختر `mawja-app`
3. Framework: **Vite** أو **Create React App**
4. اضغط Deploy

✅ رابطك سيكون: `mawja-app.vercel.app`

---

## 📱 خطوة 3: باش ينزل التطبيق على الهاتف

### Android:
- افتح الرابط في Chrome
- ستظهر رسالة "إضافة إلى الشاشة الرئيسية"
- أو: القائمة (⋮) ← "Install App"

### iPhone (iOS):
- افتح في Safari
- اضغط Share (□↑)
- "Add to Home Screen"
- اضغط "Add"

---

## ⚙️ خطوة 4: Setup React Project

```bash
# إنشاء مشروع Vite
npm create vite@latest mawja-app -- --template react
cd mawja-app

# نسخ الملفات
cp ../public/manifest.json public/
cp ../public/sw.js public/
cp ../public/icon-*.png public/
cp ../src/App.jsx src/

# تشغيل محلياً
npm install
npm run dev

# Build للنشر
npm run build
```

---

## 🎯 النتيجة النهائية

✅ تطبيق يفتح Fullscreen بدون شريط المتصفح  
✅ يعمل بدون إنترنت (offline)  
✅ أيقونة على الشاشة الرئيسية  
✅ Splash screen تلقائي  
✅ Push notifications جاهزة  
✅ مجاناً 100% بدون متجر  

---

## 🔗 الروابط المفيدة
- GitHub: https://github.com
- Vercel: https://vercel.com  
- Netlify: https://netlify.com
