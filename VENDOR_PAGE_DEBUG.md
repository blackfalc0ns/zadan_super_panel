# تشخيص مشكلة صفحة التاجر

## المشكلة
صفحة التاجر لا تفتح عند الوصول إلى الرابط:
`http://localhost:4200/vendors/d1831c83-ad97-4fb1-988e-4d41cf40a422`

## خطوات التشخيص

### 1. فحص Console في المتصفح
افتح Developer Tools (اضغط F12) وتحقق من وجود أخطاء في Console:

```
- هل يوجد أخطاء JavaScript؟
- هل يوجد أخطاء في تحميل الملفات (404)؟
- هل يوجد أخطاء في API calls؟
```

### 2. فحص Network Tab
في Developer Tools، افتح تبويب Network:

```
- هل يتم استدعاء API للحصول على بيانات التاجر؟
- ما هو status code للـ API call؟
- هل يوجد CORS errors؟
```

### 3. فحص Angular Router
في Console، اكتب:

```javascript
// Check if route is registered
console.log(window.location.pathname);

// Check if Angular is loaded
console.log(typeof ng !== 'undefined');
```

### 4. التحقق من Authentication
```
- هل أنت مسجل دخول؟
- هل الـ token صالح؟
- تحقق من localStorage:
  localStorage.getItem('token')
```

## الحلول المحتملة

### إذا كانت المشكلة في API:
1. تأكد من أن Backend يعمل
2. تأكد من أن الـ vendor ID موجود في قاعدة البيانات
3. تحقق من الـ API endpoint في environment files

### إذا كانت المشكلة في Routing:
1. تأكد من أن Angular dev server يعمل
2. جرب الذهاب إلى `/vendors` أولاً ثم اضغط على أحد التجار
3. تحقق من أن الـ route مسجل في `app.routes.ts`

### إذا كانت المشكلة في Component:
1. تحقق من أن جميع child components موجودة
2. تحقق من أن جميع imports صحيحة
3. جرب تعطيل الـ modals مؤقتاً

## الملفات المتأثرة
- `src/app/features/vendors/vendor-detail/vendor-detail.component.ts`
- `src/app/features/vendors/vendor-detail/vendor-detail.component.html`
- `src/app/app.routes.ts`
- `src/app/shared/components/ui/cr-viewer-modal/cr-viewer-modal.component.ts`
- `src/app/shared/components/ui/financial-statement-modal/financial-statement-modal.component.ts`

## الخطوة التالية
أرسل لي:
1. أي أخطاء من Console
2. أي أخطاء من Network tab
3. screenshot للصفحة الفارغة
