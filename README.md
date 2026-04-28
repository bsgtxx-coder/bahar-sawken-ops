# Bahar Sawken OPS

نسخة ويب ثابتة (`HTML/CSS/JS`) جاهزة للتجربة والرفع على أي استضافة static، ومهيأة أيضاً لتعمل لاحقاً كنظام حقيقي عبر `Supabase`.

## الملفات الأساسية

- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `assets/js/config.js`
- `assets/js/data-service.js`
- `supabase/schema.sql`

## التجربة المحلية

### الطريقة الأسرع

افتح ملف `index.html` مباشرة في المتصفح.

### الطريقة الأفضل

شغل سيرفر محلي داخل المجلد:

```powershell
python -m http.server 8080
```

ثم افتح:

```text
http://localhost:8080
```

## أوضاع التشغيل

### 1. الوضع المحلي

الملف:

```text
assets/js/config.js
```

يكون فيه:

```js
dataMode: "local"
```

هذا مناسب للتطوير اليومي السريع.

### 2. الوضع الحقيقي المنشور

انسخ إعدادات:

```text
assets/js/config.example.js
```

إلى:

```text
assets/js/config.js
```

ثم عدلها إلى:

```js
dataMode: "supabase"
```

وأضف:

- `Supabase URL`
- `Supabase anon key`

بعدها سيقرأ النظام البيانات من قاعدة البيانات بدل `localStorage`.

## إعداد Supabase

### 1. أنشئ مشروع Supabase

من:

[Supabase](https://supabase.com/docs/guides/getting-started)

### 2. أنشئ الجداول

افتح SQL Editor ثم نفذ الملف:

[schema.sql](C:\Users\gojaw\Documents\Codex\2026-04-24\https-chatgpt-com-share-69eb211f-c3b4\supabase\schema.sql)

### 3. ضع إعدادات المشروع

في:

```text
assets/js/config.js
```

### 4. فعل النشر

ارفع الموقع إلى `Cloudflare Pages` أو `Netlify`

## كيف تشتغل الخطة كاملة

- محلياً: تطور على `local`
- قبل الإطلاق: تربط `supabase`
- عند النشر: كل الأجهزة تقرأ نفس البيانات من القاعدة
- أي تعديل لاحق على الواجهة يبقى سهل لأن طبقة البيانات منفصلة

## النشر على Cloudflare Pages

1. افتح [Cloudflare Pages](https://pages.cloudflare.com/)
2. اختر `Upload assets`
3. ارفع هذا المجلد بالكامل
4. اجعل ملف البداية هو `index.html`
5. بعد النشر اربط الدومين إن أردت

لا تحتاج build command لأن المشروع static جاهز.

## النشر على Netlify

1. افتح [Netlify](https://app.netlify.com/)
2. اختر `Add new site`
3. اسحب المجلد كامل أو اربطه من Git
4. اجعل `Publish directory` = `.`
5. انشر الموقع

## ملاحظات مهمة

- في الوضع المحلي: البيانات محفوظة داخل نفس المتصفح
- في وضع Supabase: البيانات تصبح مشتركة بين كل الأجهزة
- ملف `config.js` هو مفتاح التحويل بين التطوير المحلي والنظام الحقيقي

## الخطوة التالية المقترحة

إضافة:

- تسجيل دخول حقيقي
- صلاحيات حسب المستخدم
- سجل حركة لكل طلب
- رفع ملفات مرفقة

حتى يصبح النظام جاهزاً للتشغيل الفعلي.
