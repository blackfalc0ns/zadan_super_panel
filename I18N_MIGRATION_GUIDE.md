# دليل تحويل المشروع لدعم اللغتين (عربي/إنجليزي)

## الحالة الحالية
- ✅ ملف `ar.json` محدث بكل الترجمات
- ✅ ملف `en.json` تم إنشاؤه مع الترجمات الأساسية
- ⏳ Components تحتاج تحديث لاستخدام الترجمات

## خطوات تحديث أي Component

### 1. التأكد من وجود TranslateModule في الـ imports

```typescript
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule], // ✅ TranslateModule
  // ...
})
```

### 2. إضافة دعم RTL/LTR في الـ TypeScript

```typescript
import { TranslateService } from '@ngx-translate/core';

export class ExampleComponent {
  constructor(private translate: TranslateService) {}
  
  get isRTL(): boolean {
    return this.translate.currentLang === 'ar';
  }
  
  get currentLang(): string {
    return this.translate.currentLang || 'ar';
  }
}
```

### 3. تحديث HTML Template

#### قبل:
```html
<h1>إنشاء تسوية مالية</h1>
<p>تجهيز تسوية جديدة للتاجر</p>
<button>إلغاء</button>
```

#### بعد:
```html
<h1>{{ 'MODALS.CREATE_SETTLEMENT.TITLE' | translate }}</h1>
<p>{{ 'MODALS.CREATE_SETTLEMENT.SUBTITLE' | translate }}</p>
<button>{{ 'MODALS.CREATE_SETTLEMENT.CANCEL' | translate }}</button>
```

### 4. إضافة dir attribute للـ RTL

```html
<!-- للـ modal كامل -->
<div [attr.dir]="isRTL ? 'rtl' : 'ltr'">
  <!-- content -->
</div>

<!-- أو لأقسام محددة -->
<section dir="rtl">
  <!-- Arabic content -->
</section>
```

### 5. التعامل مع الأرقام والعملات

```html
<!-- قبل -->
<span>{{ amount }} ر.س</span>

<!-- بعد -->
<span>{{ amount | number:'1.2-2' }} {{ 'COMMON.SAR' | translate }}</span>
```

## قائمة الـ Components المطلوب تحديثها

### Modals (Priority 1)
- [x] Translation keys added to ar.json
- [x] Translation keys added to en.json
- [ ] create-settlement-modal.component.html
- [ ] financial-statement-modal.component.html
- [ ] payouts-review-modal.component.html
- [ ] payment-detail-modal.component.html
- [ ] cr-viewer-modal.component.html

### Vendor Pages (Priority 2)
- [ ] vendor-detail.component.html
- [ ] vendor-finance.component.html
- [ ] vendor-products.component.html
- [ ] vendor-orders.component.html
- [ ] vendor-compliance.component.html
- [ ] vendor-activity-log.component.html
- [ ] vendor-overview.component.html

### Other Components (Priority 3)
- [ ] vendors-list.component.html
- [ ] vendor-detail-header.component.html
- [ ] edit-owner-modal.component.html
- [ ] edit-store-modal.component.html
- [ ] edit-legal-bank-modal.component.html

## مثال كامل: Create Settlement Modal

### الملفات المطلوب تحديثها:
1. `create-settlement-modal.component.ts` - إضافة TranslateService
2. `create-settlement-modal.component.html` - استبدال النصوص بـ translation keys

### الكود المحدث:

#### TypeScript:
```typescript
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-settlement-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './create-settlement-modal.component.html',
  styleUrls: ['./create-settlement-modal.component.scss']
})
export class CreateSettlementModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  
  constructor(private translate: TranslateService) {}
  
  get isRTL(): boolean {
    return this.translate.currentLang === 'ar';
  }
  
  // ... rest of the code
}
```

## ملاحظات مهمة

### 1. الأولويات
- ابدأ بالـ Modals لأنها مستقلة وسهلة الاختبار
- ثم صفحات الـ Vendors
- ثم باقي الصفحات

### 2. الاختبار
بعد كل تحديث:
```typescript
// في الـ console
localStorage.setItem('language', 'en'); // للإنجليزي
localStorage.setItem('language', 'ar'); // للعربي
location.reload();
```

### 3. التنسيق والـ RTL
- استخدم `[attr.dir]` بدلاً من `dir` الثابت
- تأكد من أن الـ Tailwind classes تدعم RTL (مثل `mr-2` تصبح `me-2`)

### 4. الترجمات المفقودة
إذا وجدت نص مفقود من ملفات الترجمة:
1. أضفه في `ar.json`
2. أضف الترجمة الإنجليزية في `en.json`
3. استخدمه في الـ template

## أدوات مساعدة

### بحث عن النصوص الثابتة
```bash
# في PowerShell
Select-String -Path "*.html" -Pattern "إنشاء|تسوية|مالية" -Recurse
```

### عد الملفات المتبقية
```bash
Get-ChildItem -Path "src/app" -Filter "*.html" -Recurse | Measure-Object
```

## الخطوات التالية

1. ✅ إنشاء هذا الدليل
2. ⏳ تحديث Create Settlement Modal كمثال كامل
3. ⏳ تحديث باقي الـ Modals
4. ⏳ تحديث صفحات الـ Vendors
5. ⏳ تحديث باقي الصفحات
6. ⏳ اختبار شامل للغتين

## الوقت المتوقع
- كل modal: 15-20 دقيقة
- كل صفحة: 20-30 دقيقة
- إجمالي: 4-6 ساعات عمل

---

**ملاحظة**: هذا الدليل يمكن استخدامه كمرجع لأي developer يعمل على المشروع.
