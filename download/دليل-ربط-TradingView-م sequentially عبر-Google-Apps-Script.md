# دليل ربط تطبيق ForexYemeni Pro مع TradingView
## عبر Google Apps Script و Webhook

---

## 📋 المحتويات
1. [نظرة عامة](#نظرة-عامة)
2. [المتطلبات](#المتطلبات)
3. [إعداد Google Apps Script](#إعداد-google-apps-script)
4. [نشر Google Apps Script كويب أب](#نشر-google-apps-script-كويب-أب)
5. [إعداد TradingView Webhook](#إعداد-tradingview-webhook)
6. [إعداد المؤشر في TradingView](#إعداد-المؤشر-في-tradingview)
7. [اختبار الربط](#اختبار-الربط)
8. [حل المشاكل](#حل-المشاكل)

---

## نظرة عامة

يعمل النظام على النحو التالي:

```
TradingView (المؤشر) ──→ Google Apps Script (جسر) ──→ تطبيق ForexYemeni Pro
       │                          │                            │
  يرسل إشارة التنبيه      يستقبل ويعيد توجيه           يستقبل ويخزن
  عبر webhook URL         الرسالة إلى التطبيق          ويعرض الإشارة
```

**لماذا نستخدم Google Apps Script؟**
- لأن TradingView لا يدعم إرسال webhooks إلى سيرفرات محلية أو التي تحتاج مصادقة
- Google Apps Script يوفر رابط webhook عام مجاني
- يعمل كوسيط (bridge) بين TradingView وتطبيقك

---

## المتطلبات

1. **حساب Google** (Gmail)
2. **حساب TradingView** (نسخة Pro على الأقل لتفعيل Webhooks)
3. **تطبيق ForexYemeni Pro** مستضاف على سيرفر (Vercel, Railway, أو أي سيرفر)

---

## إعداد Google Apps Script

### الخطوة 1: إنشاء المشروع

1. اذهب إلى **https://script.google.com**
2. سجل دخول بحساب Google
3. اضغط **"+ New Project"** (مشروع جديد)
4. سيفتح محرر الكود - احذف أي كود موجود

### الخطوة 2: إضافة الكود

1. الصق الكود الكامل من ملف `google-apps-script-webhook.js` في المحرر
2. ابحث عن هذا السطر في بداية الكود:

```javascript
const APP_URL = 'https://your-app-url.com';
```

3. غيّر `https://your-app-url.com` إلى رابط تطبيقك الفعلي، مثلاً:
```javascript
const APP_URL = 'https://forexyemeni-pro.vercel.app';
```

4. ابحث عن مفتاح الأمان وغيّره:
```javascript
const WEBHOOK_SECRET = 'forexyemeni-2024-secret-key';
```
غيّره إلى أي نص سري تريده (مثلاً: `my-super-secret-key-12345`)

### الخطوة 3: حفظ المشروع

1. اضغط **Ctrl + S** أو **File > Save**
2. سمّي المشروع: **ForexYemeni Webhook Bridge**

---

## نشر Google Apps Script كويب أب

### الخطوة 1: النشر

1. اضغط على زر **Deploy** (نشر) في أعلى اليمين
2. اختر **"New deployment"** (نشر جديد)
3. في النافذة التي تظهر:
   - بجانب **"Select type"** اضغط على السهم واختر **"Web app"**
4. في إعدادات النشر:
   - **Description**: اكتب "ForexYemeni Webhook Bridge v1"
   - **Execute as**: اختر **"Me"** (أنت)
   - **Who has access**: اختر **"Anyone"** (أي شخص) ← مهم جداً!
5. اضغط **"Deploy"**

### الخطوة 2: التفويض

1. ستظهر رسالة **"Authorization required"** - اضغط **"Continue"**
2. اختر حساب Google الخاص بك
3. ستظهر رسالة تحذير **"Google hasn't verified this app"** - اضغط **"Advanced"**
4. اضغط **"Go to ForexYemeni Webhook Bridge (unsafe)"**
5. اضغط **"Allow"** للسماح بالوصول

### الخطوة 3: نسخ رابط الويب هوك

بعد النشر بنجاح، ستظهر نافذة تعرض **Web app URL** - انسخ هذا الرابط!

الرابط سيكون شكله هكذا:
```
https://script.google.com/macros/s/xxxxxxx/exec
```

**احفظ هذا الرابط** - ستحتاجه في TradingView!

---

## إعداد TradingView Webhook

### الخطوة 1: فتح إعدادات التنبيهات

1. افتح **TradingView** في المتصفح
2. اذهب إلى الرسم البياني الذي عليه المؤشر
3. اضغط على **ساعة التنبيهات** ⏰ في شريط الأدوات السفلي
   أو اذهب إلى **Alerts** من القائمة الجانبية

### الخطوة 2: إنشاء تنبيه جديد

1. اضغط **"+ Create Alert"** (إنشاء تنبيه جديد)
2. في قسم **Condition** اختر:
   - اختر المؤشر: **FOREXYEMENI-PRO-v1.10**
   - اختر الشرط: **Alert condition** (سيكون تلقائياً من المؤشر)
3. في قسم **Alert actions** (إجراءات التنبيه):
   - فعّل خيار **"Webhook URL"**
   - الصق رابط Google Apps Script الذي نسخته سابقاً:
   ```
   https://script.google.com/macros/s/xxxxxxx/exec
   ```
4. في قسم **Message** (الرسالة):
   - اتركها فارغة! المؤشر يرسل الرسالة تلقائياً
   - أو اكتب: `{{strategy.order.action}} {{ticker}}`
5. اضغط **"Create"** لإنشاء التنبيه

### ⚠️ ملاحظة مهمة عن TradingView

TradingView في إعدادات التنبيه يتيح لك اختيار:
- **"Only once per bar close"** - مرة واحدة عند إغلاق الشمعة (يُنصح به)
- **"Once Per Bar Close"** - مرة لكل شمعة

---

## إعداد المؤشر في TradingView

### في إعدادات المؤشر (Settings):

1. افتح إعدادات المؤشر من **القائمة > Settings** أو بالضغط مرتين على اسم المؤشر
2. تأكد من هذه الإعدادات:

| الإعداد | القيمة المقترحة |
|---------|----------------|
| Alert Style | العادي (Normal) أو المحسن (Enhanced/Iraqi) |
| Number of Targets | 10 |
| Target Mode | ATR / RR / Fibonacci / Swings |
| Stop Loss Mode | ATR / Swing / FVG |
| Risk Amount | حسب رأس مالك |
| Risk Percent | 1-5% |

### إنشاء تنبيه من المؤشر مباشرة:

بعد تحميل المؤشر على الرسم البياني، ستجد زر **"Alert"** في إعدادات المؤشر نفسها:
1. افتح إعدادات المؤشر
2. اذهب إلى تاب **"Alerts"**
3. اختر نوع التنبيه المناسب
4. اضغط **"Create Alert"**

---

## اختبار الربط

### اختبار 1: التحقق من Google Apps Script

1. افتح رابط الويب هوك في المتصفح:
   ```
   https://script.google.com/macros/s/xxxxxxx/exec
   ```
2. يجب أن ترى:
   ```json
   {
     "status": "active",
     "service": "ForexYemeni Pro Webhook Bridge",
     "message": "الجسر يعمل بنجاح ✅"
   }
   ```

### اختبار 2: التحقق من تطبيقك

1. افتح في المتصفح:
   ```
   https://your-app-url.com/api/webhook
   ```
2. يجب أن ترى:
   ```json
   {
     "status": "active",
     "service": "ForexYemeni Pro Webhook",
     "message": "الويب هوك يعمل بنجاح ✅"
   }
   ```

### اختبار 3: إرسال إشارة تجريبية

في محرر Google Apps Script:
1. من القائمة العلوية اختر **"Select function"**
2. اختر **"testWebhook"**
3. اضغط **▶️ Run**
4. سيظهر **"Execution log"** في الأسفل مع النتيجة
5. افتح تطبيقك - يجب أن تظهر إشارة XAUUSD جديدة!

### اختبار 4: من TradingView فعلياً

1. افتح الرسم البياني مع المؤشر
2. انتظر ظهور إشارة جديدة من المؤشر
3. تحقق من ظهور الإشارة في تطبيقك
4. أو أرسل تنبيه يدوي من TradingView للتجربة

---

## حل المشاكل

### مشكلة: TradingView يرسل ولكن الإشارة لا تظهر

**الحلول:**
1. تأكد من رابط Google Apps Script صحيح في TradingView
2. افتح **Executions** في Google Apps Script وتحقق من وجود أخطاء
3. تحقق أن رابط تطبيقك في كود Google Apps Script صحيح
4. تأكد أن تطبيقك يعمل وأن `/api/webhook` يستجيب

### مشكلة: "Google hasn't verified this app"

**الحل:**
هذا تحذير طبيعي - اضغط **Advanced > Go to (unsafe)** للمتابعة.

### مشكلة: خطأ 401 أو 403

**الحل:**
1. أعد نشر Google Apps Script
2. تأكد أن **"Who has access"** = **"Anyone"**
3. احذف النشر القديم وأنشئ نشر جديد

### مشكلة: TradingView لا يرسل الويب هوك

**الحلول:**
1. تأكد أن لديك اشتراك TradingView Pro (Webhook ميزة مدفوعة)
2. تحقق من أن خيار Webhook URL مفعّل في التنبيه
3. جرب إنشاء تنبيه جديد من الصفر

### مشكلة: الإشارة تظهر بدون أهداف

**الحل:**
تأكد من أن المؤشر مُعد بـ 10 أهداف في إعداداته. افتح إعدادات المؤشر وتأكد:
- **Number of Targets = 10**
- إذا استمرت المشكلة، تحقق من النص الأصلي في الإشارة (زر "الإشارة الأصلية")

### مشكلة: الإشارة تظهر باللغة الأصلية (Emoji) بشكل غير صحيح

**الحل:**
هذه مشكلة ترميز عادية. النص الأصلي محفوظ كاملاً في الحقل `alertText` ويعرض بشكل صحيح.

---

## 📞 الدعم

- تحقق من سجلات Google Apps Script: **Executions tab**
- تحقق من سجلات التطبيق: سيرفر اللوجز
- تحقق من سجل Webhook: شيت "Webhook Log" في Google Sheets (يُنشأ تلقائياً)

---

## 🔒 ملاحظات أمنية

1. **غيّر مفتاح الأمان الافتراضي** في كود Google Apps Script
2. **لا تشارك رابط Google Apps Script** publicly إذا لم تكن بحاجة لذلك
3. يمكنك إضافة تحقق IP في تطبيقك لمنع الوصول غير المصرح به
4. فعّل HTTPS دائماً على تطبيقك (Vercel وRailway يفعّلونه تلقائياً)
