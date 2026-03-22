# دليل استخدام Mobile Components

## نظرة عامة

تم إنشاء مجموعة من الـ components المخصصة للعرض على الأجهزة المحمولة لتحسين تجربة المستخدم وتنظيم الكود بشكل أفضل.

## الـ Components المتاحة

### 1. Mobile Vendor Card Component

Component منفصل لعرض بيانات المورد الواحد في شكل card على الأجهزة المحمولة.

#### الاستخدام:

```typescript
import { MobileVendorCardComponent, VendorCardData } from './mobile-vendor-card/mobile-vendor-card.component';

// في الـ component
@Component({
  imports: [MobileVendorCardComponent]
})
```

```html
<app-mobile-vendor-card
  [vendor]="vendorData"
  [isSelected]="false"
  [activeLang]="'ar'"
  (cardClick)="onCardClick($event)"
  (selectionChange)="onSelectionChange($event)"
  (quickApprove)="onQuickApprove($event)"
  (requestDocuments)="onRequestDocuments($event)">
</app-mobile-vendor-card>
```

#### الخصائص (Inputs):
- `vendor: VendorCardData` - بيانات المورد
- `isSelected: boolean` - حالة التحديد
- `activeLang: string` - اللغة النشطة

#### الأحداث (Outputs):
- `cardClick` - عند النقر على الـ card
- `selectionChange` - عند تغيير حالة التحديد
- `quickApprove` - عند الموافقة السريعة
- `requestDocuments` - عند طلب المستندات

### 2. Mobile Vendor Cards Component

Component لعرض قائمة من الـ vendor cards مع إدارة الحالات المختلفة.

#### الاستخدام:

```typescript
import { MobileVendorCardsComponent } from './mobile-vendor-cards/mobile-vendor-cards.component';
```

```html
<app-mobile-vendor-cards
  [vendors]="vendorsList"
  [selectedVendorIds]="selectedIds"
  [isLoading]="loading"
  [showError]="hasError"
  [errorMessage]="errorMsg"
  [activeLang]="currentLang"
  (cardClick)="onCardClick($event)"
  (selectionChange)="onSelectionChange($event)"
  (quickApprove)="onQuickApprove($event)"
  (requestDocuments)="onRequestDocuments($event)"
  (retry)="onRetry()"
  (refresh)="onRefresh()">
</app-mobile-vendor-cards>
```

#### المميزات:
- عرض قائمة الـ vendors
- إدارة حالات التحميل والأخطاء
- حالة فارغة عند عدم وجود بيانات
- دعم التحديد المتعدد
- إجراءات سريعة

### 3. Mobile Product Card Component

Component مشابه للـ vendor card لكن مخصص للمنتجات.

#### الاستخدام:

```typescript
import { MobileProductCardComponent, ProductCardData } from './mobile-product-card/mobile-product-card.component';
```

```html
<app-mobile-product-card
  [product]="productData"
  [isSelected]="false"
  [activeLang]="'ar'"
  (cardClick)="onCardClick($event)"
  (selectionChange)="onSelectionChange($event)"
  (quickApprove)="onQuickApprove($event)"
  (edit)="onEdit($event)">
</app-mobile-product-card>
```

## الفوائد من هذا التنظيم

### 1. إعادة الاستخدام (Reusability)
- يمكن استخدام الـ components في أي مكان في التطبيق
- سهولة الصيانة والتطوير

### 2. الفصل بين الاهتمامات (Separation of Concerns)
- كل component مسؤول عن جزء محدد من الواجهة
- سهولة اختبار كل component بشكل منفصل

### 3. التنظيم الأفضل
- كود أكثر تنظيماً وقابلية للقراءة
- سهولة إضافة مميزات جديدة

### 4. الأداء
- تحميل أسرع للصفحات
- إمكانية تحسين كل component بشكل منفصل

## كيفية إضافة component جديد

### 1. إنشاء الـ Component

```bash
ng generate component shared/components/ui/mobile-[name]-card --standalone
```

### 2. تعريف الـ Interface

```typescript
export interface [Name]CardData {
  id: string;
  // باقي الخصائص
}
```

### 3. إضافة الـ Component للـ Index

```typescript
// في shared/components/ui/index.ts
export * from './mobile-[name]-card/mobile-[name]-card.component';
```

### 4. الاستخدام في الصفحة الرئيسية

```typescript
import { Mobile[Name]CardComponent } from '../../../shared/components/ui';

@Component({
  imports: [Mobile[Name]CardComponent]
})
```

## أفضل الممارسات

### 1. التسمية
- استخدم أسماء واضحة ومعبرة
- اتبع نمط التسمية الموحد

### 2. الخصائص
- استخدم Input properties للبيانات
- استخدم Output events للأحداث

### 3. التصميم
- حافظ على التصميم المتسق
- استخدم Tailwind classes الموحدة

### 4. الأداء
- استخدم OnPush change detection عند الإمكان
- تجنب العمليات المعقدة في الـ template

## مثال كامل للاستخدام

```typescript
// في vendors-list.component.ts
export class VendorsListComponent {
  // تحويل البيانات للشكل المطلوب
  get vendorCardsData(): VendorCardData[] {
    return this.vendors.map(vendor => ({
      id: vendor.id,
      businessNameAr: vendor.businessNameAr,
      businessNameEn: vendor.businessNameEn,
      contactEmail: vendor.contactEmail,
      status: vendor.status as any,
      documentsCompleteness: vendor.documentsCompleteness,
      riskLevel: vendor.riskLevel as any,
      commissionRate: vendor.commissionRate,
      commissionType: 'Percentage',
      alerts: this.getAlertsList(vendor)
    }));
  }

  // معالجة الأحداث
  onMobileCardClick(vendor: VendorCardData): void {
    this.openPreview(vendor as Vendor);
  }

  onMobileSelectionChange(event: { vendorId: string; selected: boolean }): void {
    if (event.selected) {
      this.selectedVendorIds.add(event.vendorId);
    } else {
      this.selectedVendorIds.delete(event.vendorId);
    }
    this.updateBulkActionsVisibility();
  }
}
```

```html
<!-- في vendors-list.component.html -->
<app-mobile-vendor-cards
  [vendors]="vendorCardsData"
  [selectedVendorIds]="selectedVendorIdsArray"
  [isLoading]="isLoading"
  [showError]="showError"
  [errorMessage]="errorMessage"
  [activeLang]="activeLang"
  (cardClick)="onMobileCardClick($event)"
  (selectionChange)="onMobileSelectionChange($event)"
  (quickApprove)="onMobileQuickApprove($event)"
  (requestDocuments)="onMobileRequestDocuments($event)"
  (retry)="onMobileRetry()"
  (refresh)="onMobileRefresh()">
</app-mobile-vendor-cards>
```

هذا التنظيم يجعل الكود أكثر تنظيماً وقابلية للصيانة والتطوير.