# حالة تحويل المشروع لدعم اللغتين

## ✅ ما تم إنجازه

### 1. ملفات الترجمة
- ✅ `public/assets/i18n/ar.json` - محدث بكل الترجمات للـ modals
- ✅ `public/assets/i18n/en.json` - تم إنشاؤه مع الترجمات الأساسية

### 2. الوثائق
- ✅ `I18N_MIGRATION_GUIDE.md` - دليل شامل لتحديث أي component
- ✅ `I18N_STATUS.md` - هذا الملف (تتبع الحالة)

### 3. Components المحدثة
- ✅ `create-settlement-modal.component.ts` - أضيف TranslateService و isRTL

## ⏳ ما يحتاج إنجاز

### المرحلة 1: تحديث HTML Templates للـ Modals (Priority: High)

#### 1. Create Settlement Modal
**الملف**: `src/app/shared/components/ui/create-settlement-modal/create-settlement-modal.component.html`

**النصوص المطلوب استبدالها**:
```
إنشاء تسوية مالية → MODALS.CREATE_SETTLEMENT.TITLE
تجهيز تسوية جديدة للتاجر → MODALS.CREATE_SETTLEMENT.SUBTITLE
اسم المتجر / المعرف → MODALS.CREATE_SETTLEMENT.STORE_NAME
الرصيد الحالي → MODALS.CREATE_SETTLEMENT.CURRENT_BALANCE
متاح للتسوية → MODALS.CREATE_SETTLEMENT.AVAILABLE_BALANCE
محظور جزئياً → MODALS.CREATE_SETTLEMENT.PARTIALLY_BLOCKED
فترة التسوية → MODALS.CREATE_SETTLEMENT.SETTLEMENT_PERIOD
من: → MODALS.CREATE_SETTLEMENT.FROM
إلى: → MODALS.CREATE_SETTLEMENT.TO
هذا الشهر → MODALS.CREATE_SETTLEMENT.THIS_MONTH
الشهر الماضي → MODALS.CREATE_SETTLEMENT.LAST_MONTH
آخر 7 أيام → MODALS.CREATE_SETTLEMENT.LAST_7_DAYS
إعدادات التسوية والأولوية → MODALS.CREATE_SETTLEMENT.SETTINGS_PRIORITY
يدوي (Manual) → MODALS.CREATE_SETTLEMENT.MANUAL
تلقائي (Auto) → MODALS.CREATE_SETTLEMENT.AUTO
أولوية: عادية → MODALS.CREATE_SETTLEMENT.PRIORITY_NORMAL
أولوية: عالية → MODALS.CREATE_SETTLEMENT.PRIORITY_HIGH
أولوية: منخفضة → MODALS.CREATE_SETTLEMENT.PRIORITY_LOW
تطبيق عمولة استثنائية → MODALS.CREATE_SETTLEMENT.EXCEPTIONAL_FEE
المبلغ أو % → MODALS.CREATE_SETTLEMENT.AMOUNT_OR_PERCENT
تفاصيل الحساب المالي → MODALS.CREATE_SETTLEMENT.FINANCIAL_DETAILS
عرض تفاصيل الطلبات → MODALS.CREATE_SETTLEMENT.VIEW_ORDER_DETAILS
إجمالي المبيعات → MODALS.CREATE_SETTLEMENT.TOTAL_SALES
المرتجعات → MODALS.CREATE_SETTLEMENT.RETURNS
رسوم إضافية → MODALS.CREATE_SETTLEMENT.ADDITIONAL_FEES
تعديلات مالية → MODALS.CREATE_SETTLEMENT.FINANCIAL_ADJUSTMENTS
صافي المستحق → MODALS.CREATE_SETTLEMENT.NET_AMOUNT
الحساب البنكي المرتبط → MODALS.CREATE_SETTLEMENT.LINKED_BANK
موثق → MODALS.CREATE_SETTLEMENT.VERIFIED
تحذيرات المخاطر → MODALS.CREATE_SETTLEMENT.RISK_WARNINGS
إرسال للمراجعة المالية → MODALS.CREATE_SETTLEMENT.FINANCE_APPROVAL
إلغاء → MODALS.CREATE_SETTLEMENT.CANCEL
حفظ كمسودة → MODALS.CREATE_SETTLEMENT.SAVE_DRAFT
إنشاء واعتماد التسوية → MODALS.CREATE_SETTLEMENT.CREATE_APPROVE
ر.س → MODALS.CREATE_SETTLEMENT.SAR
```

**التعديلات المطلوبة على الـ dir attributes**:
```html
<!-- استبدل -->
<header dir="rtl">
<!-- بـ -->
<header [attr.dir]="isRTL ? 'rtl' : 'ltr'">
```

#### 2. Financial Statement Modal
**الملف**: `src/app/shared/components/ui/financial-statement-modal/financial-statement-modal.component.html`
- ⏳ يحتاج تحديث TypeScript أولاً
- ⏳ ثم تحديث HTML

#### 3. Payouts Review Modal
**الملف**: `src/app/shared/components/ui/payouts-review-modal/payouts-review-modal.component.html`
- ⏳ يحتاج تحديث TypeScript أولاً
- ⏳ ثم تحديث HTML

#### 4. Payment Detail Modal
**الملف**: `src/app/shared/components/ui/payment-detail-modal/payment-detail-modal.component.html`
- ⏳ يحتاج تحديث TypeScript أولاً
- ⏳ ثم تحديث HTML

#### 5. CR Viewer Modal
**الملف**: `src/app/shared/components/ui/cr-viewer-modal/cr-viewer-modal.component.html`
- ⏳ يحتاج تحديث TypeScript أولاً
- ⏳ ثم تحديث HTML

### المرحلة 2: صفحات الـ Vendors (Priority: Medium)

- ⏳ vendor-finance.component (TypeScript + HTML)
- ⏳ vendor-detail.component (TypeScript + HTML)
- ⏳ vendor-products.component (TypeScript + HTML)
- ⏳ vendor-orders.component (TypeScript + HTML)
- ⏳ vendor-compliance.component (TypeScript + HTML)
- ⏳ vendor-activity-log.component (TypeScript + HTML)
- ⏳ vendor-overview.component (TypeScript + HTML)

### المرحلة 3: Components الأخرى (Priority: Low)

- ⏳ vendors-list.component
- ⏳ vendor-detail-header.component
- ⏳ edit-owner-modal.component
- ⏳ edit-store-modal.component
- ⏳ edit-legal-bank-modal.component

## 📋 خطة العمل المقترحة

### الخطوة التالية الفورية:
1. تحديث `create-settlement-modal.component.html` لاستخدام الترجمات
2. اختبار المودال باللغتين
3. إذا نجح، استخدامه كـ template لباقي الـ modals

### الأولويات:
1. **High**: الـ 5 modals (لأنها مستقلة وسهلة الاختبار)
2. **Medium**: صفحات الـ Vendors (لأنها الأكثر استخداماً)
3. **Low**: باقي الـ components

## 🔧 أدوات مساعدة

### للبحث عن نص معين في كل الملفات:
```powershell
Select-String -Path "src/app/**/*.html" -Pattern "إنشاء تسوية" -Recurse
```

### لعد الملفات HTML المتبقية:
```powershell
Get-ChildItem -Path "src/app" -Filter "*.html" -Recurse | Measure-Object
```

## 📊 الإحصائيات

- **إجمالي الـ Modals**: 5
- **Modals المحدثة**: 0 (TypeScript فقط: 1)
- **إجمالي صفحات Vendors**: 7
- **صفحات Vendors المحدثة**: 0

## 🎯 الهدف النهائي

جعل كل نص في التطبيق يدعم اللغتين (عربي/إنجليزي) مع:
- ✅ تبديل سلس بين اللغات
- ✅ دعم RTL/LTR تلقائي
- ✅ ترجمات كاملة ودقيقة
- ✅ تجربة مستخدم متسقة

## 📝 ملاحظات

- كل component يحتاج تحديث في ملفين: `.ts` و `.html`
- الـ TypeScript يحتاج إضافة `TranslateService` و `isRTL` getter
- الـ HTML يحتاج استبدال كل النصوص الثابتة بـ `{{ 'KEY' | translate }}`
- الـ `dir` attributes يجب أن تكون dynamic: `[attr.dir]="isRTL ? 'rtl' : 'ltr'"`

---

**آخر تحديث**: الآن
**الحالة**: جاري العمل على Create Settlement Modal
