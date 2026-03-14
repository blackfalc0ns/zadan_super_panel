# صفحة تفاصيل التاجر - Vendor Detail Page

## نظرة عامة
تم إنشاء صفحة احترافية وموديرن لعرض تفاصيل التاجر بتصميم خارق يتضمن:

## المميزات الرئيسية

### 1. Hero Section (القسم البطولي)
- خلفية متدرجة بألوان Teal مع تأثيرات ضوئية
- عرض شعار التاجر أو placeholder احترافي
- اسم التاجر ونوع العمل
- Badge للحالة (نشط، قيد المراجعة، موقوف، مرفوض)
- 3 بطاقات إحصائية:
  - عدد الفروع
  - عدد الحسابات البنكية
  - نسبة العمولة

### 2. بطاقات المعلومات (Info Cards)
كل بطاقة تحتوي على:
- أيقونة ملونة في الهيدر
- عنوان واضح
- معلومات منظمة في Grid

#### البطاقات المتوفرة:
1. **معلومات العمل التجاري**
   - الاسم بالعربي والإنجليزي
   - رقم السجل التجاري
   - الرقم الضريبي

2. **معلومات الاتصال**
   - البريد الإلكتروني مع أيقونة
   - رقم الهاتف مع أيقونة

3. **معلومات المالك**
   - اسم المالك
   - بريد المالك
   - هاتف المالك

4. **المستندات** (إذا كانت متوفرة)
   - رابط لوثيقة السجل التجاري
   - تأثير hover احترافي

5. **الجدول الزمني (Timeline)**
   - تاريخ التسجيل
   - تاريخ الموافقة (إذا تمت الموافقة)
   - تصميم Timeline عمودي مع خط متدرج

6. **سبب الرفض** (إذا كان مرفوضاً)
   - بطاقة حمراء خاصة
   - نص سبب الرفض

### 3. التصميم والألوان
- **Primary Color**: Teal (#14b8a6)
- **Gradients**: استخدام تدرجات احترافية
- **Shadows**: ظلال ناعمة وعميقة
- **Hover Effects**: تأثيرات تفاعلية سلسة
- **Responsive**: متجاوب تماماً مع الموبايل

### 4. الأيقونات
استخدام Heroicons SVG لجميع الأيقونات:
- أيقونة المتجر للأعمال
- أيقونة الهاتف للاتصال
- أيقونة المستخدم للمالك
- أيقونة المستندات
- أيقونة الساعة للتايم لاين
- وغيرها...

## الملفات المنشأة

### 1. Component Files
- `vendor-detail.component.ts` - المنطق والبيانات
- `vendor-detail.component.html` - القالب
- `vendor-detail.component.scss` - التصميم الاحترافي

### 2. Model & Service Updates
- إضافة `VendorDetail` interface في `vendor.ts`
- تحديث `getVendorById()` في `vendor.service.ts`

### 3. Routing
- إضافة route: `/vendors/:id`

### 4. Translations
إضافة ترجمات عربية في `ar.json`:
- `vendors.detail.*` - جميع النصوص
- `vendors.status.*` - حالات التاجر

### 5. Navigation
- إضافة RouterLink في قائمة التجار
- زر "عرض التفاصيل" في Desktop و Mobile views

## كيفية الاستخدام

1. من قائمة التجار، اضغط على أيقونة العين 👁️
2. سيتم الانتقال إلى صفحة التفاصيل
3. استخدم زر الرجوع للعودة للقائمة

## API Endpoint
```
GET /admin/vendors/{vendorId}
```

## Response Structure
```typescript
{
  id: string;
  businessNameAr: string;
  businessNameEn: string;
  businessType: string;
  commercialRegistrationNumber: string;
  taxId: string | null;
  contactEmail: string;
  contactPhone: string;
  commissionRate: number | null;
  status: string;
  rejectionReason: string | null;
  logoUrl: string | null;
  commercialRegisterDocumentUrl: string | null;
  approvedAtUtc: string | null;
  approvedBy: string | null;
  createdAtUtc: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  branchesCount: number;
  bankAccountsCount: number;
}
```

## التحسينات المستقبلية المقترحة
- [ ] إضافة قسم لعرض الفروع
- [ ] إضافة قسم لعرض الحسابات البنكية
- [ ] إضافة قسم لعرض المنتجات
- [ ] إضافة أزرار إجراءات (موافقة، رفض، تعليق)
- [ ] إضافة تاريخ التعديلات
- [ ] إضافة رسوم بيانية للإحصائيات

## ملاحظات تقنية
- Component standalone (لا يحتاج module)
- استخدام OnPush change detection للأداء
- Lazy loading للصفحة
- Type-safe مع TypeScript
- Responsive design مع Tailwind CSS
