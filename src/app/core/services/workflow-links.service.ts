import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Brand, Category, MasterProduct } from '../models/catalog.model';
import { Driver } from '../models/driver';
import { CustomerDetailRecord } from '../../features/customers/customers.models';
import { buildDriverDetailRecord } from '../../features/drivers/drivers.mock';
import { DriverDetailRecord } from '../../features/drivers/drivers.models';
import { DisputeRow } from '../../features/disputes/disputes.models';
import { getWorkflowStageKey } from '../../features/orders/orders.mock';
import { OrderDetail } from '../../features/orders/orders.models';
import { CustomersService } from './customers.service';
import { DisputesService } from './disputes.service';
import { DriverService } from './driver.service';
import { OrdersService } from './orders.service';

export type WorkflowLinkVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'processing'
  | 'paused'
  | 'high-risk'
  | 'overdue';

export interface WorkflowLinkCard {
  id: string;
  entityLabel: string;
  title: string;
  reference?: string;
  referenceDir?: 'rtl' | 'ltr';
  subtitle?: string;
  contextLabel: string;
  statusLabel: string;
  statusVariant: WorkflowLinkVariant;
  summary: string;
  nextStep: string;
  routeCommands: string[];
  queryParams?: Params;
}

export interface VendorWorkflowSnapshot {
  id: string;
  displayName: string;
  location: string;
  category: string;
  phone: string;
  email: string;
  workflowStateLabel: string;
  workflowVariant: WorkflowLinkVariant;
  queueLabel: string;
  ownerTeamLabel: string;
  summary: string;
  nextStep: string;
  blockers: string[];
  alerts: string[];
  linkedOrders: OrderDetail[];
}

interface LocalizedText {
  ar: string;
  en: string;
}

interface VendorWorkflowSeed {
  id: string;
  merchantNames: string[];
  displayName: LocalizedText;
  location: LocalizedText;
  category: LocalizedText;
  phone: string;
  email: string;
  workflowStateLabel: LocalizedText;
  workflowVariant: WorkflowLinkVariant;
  queueLabel: LocalizedText;
  ownerTeamLabel: LocalizedText;
  summary: LocalizedText;
  nextStep: LocalizedText;
  blockers: LocalizedText[];
  alerts: LocalizedText[];
  linkedOrderIds: string[];
}

const CUSTOMER_WORKFLOW_STATE_KEYS: Record<CustomerDetailRecord['workflow']['state'], string> = {
  healthy: 'CUSTOMERS.DETAIL.WORKFLOW.STATE.HEALTHY',
  monitoring: 'CUSTOMERS.DETAIL.WORKFLOW.STATE.MONITORING',
  retention: 'CUSTOMERS.DETAIL.WORKFLOW.STATE.RETENTION',
  under_review: 'CUSTOMERS.DETAIL.WORKFLOW.STATE.UNDER_REVIEW',
  suspended: 'CUSTOMERS.DETAIL.WORKFLOW.STATE.SUSPENDED'
};

const VENDOR_WORKFLOW_SEEDS: VendorWorkflowSeed[] = [
  {
    id: 'VND-24001',
    merchantNames: ['لولو هايبر ماركت', 'لولو'],
    displayName: { ar: 'لولو هايبر ماركت', en: 'LuLu Hypermarket' },
    location: { ar: 'الرياض، حي الياسمين', en: 'Riyadh, Al Yasmin' },
    category: { ar: 'هايبر ماركت', en: 'Hypermarket' },
    phone: '+966 11 200 4400',
    email: 'ops@lulu.sa',
    workflowStateLabel: { ar: 'تشغيل مستقر', en: 'Stable Operations' },
    workflowVariant: 'success',
    queueLabel: { ar: 'لوحة المورد النشط', en: 'Active Vendor Queue' },
    ownerTeamLabel: { ar: 'تشغيل الموردين + المالية', en: 'Vendor Operations + Finance' },
    summary: {
      ar: 'الفرع يعمل بصورة مستقرة ولا توجد ملاحظات تمنع استقبال الطلبات أو تسوية المدفوعات الحالية.',
      en: 'The branch is operating steadily with no blockers on intake or current settlements.'
    },
    nextStep: {
      ar: 'استمر في مراقبة SLA وسرعة تجهيز الفرع مع مراجعة أي تنبيه مالي جديد فور ظهوره.',
      en: 'Keep monitoring SLA and branch prep speed, and review any new finance alert immediately.'
    },
    blockers: [],
    alerts: [
      {
        ar: 'ارتفاع طفيف في حجم الطلبات الصباحية ويتطلب مراقبة الطاقة الاستيعابية.',
        en: 'Morning order volume is slightly elevated and needs capacity monitoring.'
      }
    ],
    linkedOrderIds: ['ZD-94821']
  },
  {
    id: 'VND-24002',
    merchantNames: ['بنده'],
    displayName: { ar: 'بنده', en: 'Panda' },
    location: { ar: 'الرياض، حي النخيل', en: 'Riyadh, Al Nakheel' },
    category: { ar: 'سوبر ماركت', en: 'Supermarket' },
    phone: '+966 11 221 5500',
    email: 'dispatch@panda.sa',
    workflowStateLabel: { ar: 'متابعة تشغيلية', en: 'Operational Follow-up' },
    workflowVariant: 'warning',
    queueLabel: { ar: 'طابور التأخير التشغيلي', en: 'Operational Delay Queue' },
    ownerTeamLabel: { ar: 'تشغيل الموردين', en: 'Vendor Operations' },
    summary: {
      ar: 'هناك تأخير تجهيز على الفرع ويجب ضبط سرعة الالتقاط قبل اتساع التأخير في الطلبات القادمة.',
      en: 'The branch has a prep delay that should be corrected before it affects upcoming orders.'
    },
    nextStep: {
      ar: 'راجع الفريق المناوب في الفرع واربطه بخطة إسراع التجهيز قبل تعيين سائق إضافي.',
      en: 'Review the on-shift branch team and align on a faster prep plan before adding driver capacity.'
    },
    blockers: [
      {
        ar: 'تجهيز الطلبات أبطأ من المستهدف التشغيلي خلال الساعة الحالية.',
        en: 'Order prep is slower than the current operational target.'
      }
    ],
    alerts: [],
    linkedOrderIds: ['ZD-94820']
  },
  {
    id: 'VND-24003',
    merchantNames: ['العثيم'],
    displayName: { ar: 'العثيم', en: 'Othaim' },
    location: { ar: 'جدة، حي الروضة', en: 'Jeddah, Al Rawdah' },
    category: { ar: 'سوبر ماركت', en: 'Supermarket' },
    phone: '+966 12 445 8800',
    email: 'finance@othaim.sa',
    workflowStateLabel: { ar: 'تعليق دفع', en: 'Payment Hold' },
    workflowVariant: 'danger',
    queueLabel: { ar: 'طابور مراجعة المدفوعات', en: 'Payment Review Queue' },
    ownerTeamLabel: { ar: 'المالية + الموردين', en: 'Finance + Vendor Ops' },
    summary: {
      ar: 'يوجد خلل في مسار الدفع على الطلبات المفتوحة ويجب حسمه قبل عودة التدفق الطبيعي.',
      en: 'There is a payment-path issue on open orders that needs to be resolved before normal flow resumes.'
    },
    nextStep: {
      ar: 'راجع بوابة الدفع والمرجع المالي للطلب المفتوح ثم أكد السماح بإعادة المحاولة.',
      en: 'Review the payment gateway and order finance reference, then confirm retry eligibility.'
    },
    blockers: [
      {
        ar: 'فشل دفع مفتوح يؤثر على السماح بإطلاق الطلب.',
        en: 'An open payment failure is blocking order release.'
      }
    ],
    alerts: [],
    linkedOrderIds: ['ZD-94819']
  },
  {
    id: 'VND-24004',
    merchantNames: ['كارفور'],
    displayName: { ar: 'كارفور', en: 'Carrefour' },
    location: { ar: 'الرياض، حي الصحافة', en: 'Riyadh, Al Sahafah' },
    category: { ar: 'هايبر ماركت', en: 'Hypermarket' },
    phone: '+966 11 520 9910',
    email: 'care@carrefour.sa',
    workflowStateLabel: { ar: 'إغلاق بعد الإلغاء', en: 'Closure After Cancellation' },
    workflowVariant: 'info',
    queueLabel: { ar: 'طابور الإلغاءات والتسويات', en: 'Cancellation & Settlement Queue' },
    ownerTeamLabel: { ar: 'المالية + الدعم', en: 'Finance + Support' },
    summary: {
      ar: 'الفرع أنهى إلغاء الطلب مع استرداد كامل، والحالة تحتاج فقط متابعة الإغلاق النهائي.',
      en: 'The branch completed the cancellation with a full refund, and the case only needs final closure follow-up.'
    },
    nextStep: {
      ar: 'أكد اكتمال الاسترداد وتوثيق سبب الإلغاء في السجل قبل أرشفة الحالة.',
      en: 'Confirm refund completion and log the cancellation reason before archiving the case.'
    },
    blockers: [],
    alerts: [
      {
        ar: 'يلزم توثيق سبب نفاد المخزون ضمن تقارير الأداء الأسبوعية.',
        en: 'The stockout reason should be documented in the weekly performance report.'
      }
    ],
    linkedOrderIds: ['ZD-94818']
  },
  {
    id: 'VND-24005',
    merchantNames: ['دانوب'],
    displayName: { ar: 'دانوب', en: 'Danube' },
    location: { ar: 'الرياض، حي حطين', en: 'Riyadh, Hittin' },
    category: { ar: 'سوبر ماركت', en: 'Supermarket' },
    phone: '+966 11 334 2121',
    email: 'store.ops@danube.sa',
    workflowStateLabel: { ar: 'مغلق بنجاح', en: 'Closed Successfully' },
    workflowVariant: 'success',
    queueLabel: { ar: 'لوحة المورد المستقر', en: 'Stable Vendor Board' },
    ownerTeamLabel: { ar: 'تشغيل الموردين', en: 'Vendor Operations' },
    summary: {
      ar: 'آخر الطلبات أغلقت دون ملاحظات، والفرع يعمل ضمن المؤشرات التشغيلية الطبيعية.',
      en: 'Recent orders closed cleanly and the branch is operating within normal metrics.'
    },
    nextStep: {
      ar: 'استمر على نفس الإيقاع مع مراجعة القدرة الاستيعابية في أوقات الذروة فقط.',
      en: 'Keep the current rhythm and review branch capacity only during peak periods.'
    },
    blockers: [],
    alerts: [],
    linkedOrderIds: ['ZD-94817']
  },
  {
    id: 'VND-24006',
    merchantNames: ['تميمي'],
    displayName: { ar: 'تميمي', en: 'Tamimi Markets' },
    location: { ar: 'الرياض، حي قرطبة', en: 'Riyadh, Qurtubah' },
    category: { ar: 'سوبر ماركت', en: 'Supermarket' },
    phone: '+966 11 480 7000',
    email: 'support@tamimi.sa',
    workflowStateLabel: { ar: 'نزاع مفتوح', en: 'Open Dispute' },
    workflowVariant: 'warning',
    queueLabel: { ar: 'طابور النزاعات الجزئية', en: 'Partial Dispute Queue' },
    ownerTeamLabel: { ar: 'الدعم + المالية', en: 'Support + Finance' },
    summary: {
      ar: 'هناك نزاع مفتوح مرتبط بعنصر مفقود واسترداد جزئي، والفرع يحتاج متابعة دقيقة حتى الإغلاق.',
      en: 'There is an open dispute around a missing item and partial refund, so the branch needs close follow-up.'
    },
    nextStep: {
      ar: 'راجع تذكرة الدعم وأكد التسوية النهائية قبل تحرير الحالة من المتابعة.',
      en: 'Review the support ticket and confirm final settlement before clearing the case.'
    },
    blockers: [],
    alerts: [
      {
        ar: 'يوجد استرداد جزئي يحتاج إغلاقًا ماليًا بعد إقفال النزاع.',
        en: 'A partial refund still needs finance closure after the dispute is resolved.'
      }
    ],
    linkedOrderIds: ['ZD-94816']
  },
  {
    id: 'VND-24007',
    merchantNames: ['مطاعم الرومانسية'],
    displayName: { ar: 'مطاعم الرومانسية', en: 'Al Romansiah Restaurants' },
    location: { ar: 'الرياض', en: 'Riyadh' },
    category: { ar: 'مطاعم', en: 'Restaurants' },
    phone: '+966 11 722 2000',
    email: 'partners@romansiah.sa',
    workflowStateLabel: { ar: 'تشغيل مباشر', en: 'Live Operations' },
    workflowVariant: 'success',
    queueLabel: { ar: 'لوحة المورد الحي', en: 'Live Vendor Board' },
    ownerTeamLabel: { ar: 'تشغيل الموردين', en: 'Vendor Operations' },
    summary: {
      ar: 'المورد ضمن التشغيل المباشر ويحتاج فقط متابعة زمن التسليم وتجربة الاستلام.',
      en: 'The vendor is in live operations and mainly needs delivery-time and pickup-experience monitoring.'
    },
    nextStep: {
      ar: 'راقب التزام الطهاة بالوقت في أوقات الذروة المسائية.',
      en: 'Monitor kitchen timing during evening peaks.'
    },
    blockers: [],
    alerts: [],
    linkedOrderIds: []
  },
  {
    id: 'VND-24008',
    merchantNames: ['هرفي - العليا', 'هرفي'],
    displayName: { ar: 'هرفي - العليا', en: 'Herfy - Olaya' },
    location: { ar: 'الرياض، العليا', en: 'Riyadh, Olaya' },
    category: { ar: 'مطاعم سريعة', en: 'Quick Service Restaurant' },
    phone: '+966 11 808 1122',
    email: 'ops@herfy.com',
    workflowStateLabel: { ar: 'جاهز للتشغيل', en: 'Ready for Dispatch' },
    workflowVariant: 'info',
    queueLabel: { ar: 'طابور الموردين الجاهزين', en: 'Ready Vendor Queue' },
    ownerTeamLabel: { ar: 'تشغيل الموردين', en: 'Vendor Operations' },
    summary: {
      ar: 'المورد جاهز تشغيليًا ولا توجد حاليًا عراقيل تمنع زيادة الحجم.',
      en: 'The vendor is operationally ready with no blockers on volume growth.'
    },
    nextStep: {
      ar: 'استمر في توزيع الطلبات مع مراقبة جودة التغليف.',
      en: 'Continue dispatching orders while monitoring packaging quality.'
    },
    blockers: [],
    alerts: [],
    linkedOrderIds: []
  },
  {
    id: 'VND-24009',
    merchantNames: ['ماكدونالدز'],
    displayName: { ar: 'ماكدونالدز', en: "McDonald's" },
    location: { ar: 'الرياض', en: 'Riyadh' },
    category: { ar: 'مطاعم سريعة', en: 'Quick Service Restaurant' },
    phone: '+966 11 900 3300',
    email: 'operations@mcd.sa',
    workflowStateLabel: { ar: 'ضغط تشغيل مرتفع', en: 'High Operational Load' },
    workflowVariant: 'warning',
    queueLabel: { ar: 'طابور ضغط الذروة', en: 'Peak Load Queue' },
    ownerTeamLabel: { ar: 'تشغيل الموردين + الدعم', en: 'Vendor Operations + Support' },
    summary: {
      ar: 'أحجام الطلبات مرتفعة ويجب مراقبة الطاقة الاستيعابية مع سرعة رد الفريق على أي شكوى.',
      en: 'Order volume is high, so capacity and fast complaint response both need monitoring.'
    },
    nextStep: {
      ar: 'تابع الصفوف وسرعة تجهيز الوجبات خلال نافذة الذروة الحالية.',
      en: 'Track queue length and meal prep speed during the current peak window.'
    },
    blockers: [],
    alerts: [
      {
        ar: 'احتمال ارتفاع التأخير التشغيلي خلال فترة الغداء.',
        en: 'Operational delays may rise during the lunch window.'
      }
    ],
    linkedOrderIds: []
  },
  {
    id: 'VND-24010',
    merchantNames: ['Barns', 'برغرايززر'],
    displayName: { ar: 'Barns / برغرايززر', en: 'Barns / Burgerizzr' },
    location: { ar: 'السعودية', en: 'Saudi Arabia' },
    category: { ar: 'أغذية ومشروبات', en: 'Food & Beverage' },
    phone: '+966 11 111 9090',
    email: 'partners@foodgroup.sa',
    workflowStateLabel: { ar: 'متابعة اعتيادية', en: 'Routine Monitoring' },
    workflowVariant: 'neutral',
    queueLabel: { ar: 'لوحة المتابعة الروتينية', en: 'Routine Monitoring Board' },
    ownerTeamLabel: { ar: 'تشغيل الموردين', en: 'Vendor Operations' },
    summary: {
      ar: 'لا توجد ملاحظات تشغيلية حرجة، والمطلوب فقط متابعة الأداء الاعتيادي.',
      en: 'There are no critical operational issues and only routine monitoring is needed.'
    },
    nextStep: {
      ar: 'استمر في المراقبة المعتادة مع مراجعة التعليقات السلبية إن ظهرت.',
      en: 'Continue routine monitoring and review any negative feedback if it appears.'
    },
    blockers: [],
    alerts: [],
    linkedOrderIds: []
  },
  {
    id: 'VND-9928',
    merchantNames: ['متجر التقنية الحديثة'],
    displayName: { ar: 'متجر التقنية الحديثة', en: 'Modern Tech Store' },
    location: { ar: 'الرياض، المملكة العربية السعودية', en: 'Riyadh, Saudi Arabia' },
    category: { ar: 'إلكترونيات وتقنية', en: 'Electronics & Technology' },
    phone: '+966 50 123 4567',
    email: 'contact@moderntech.sa',
    workflowStateLabel: { ar: 'مراجعة مستندات', en: 'Documents Review' },
    workflowVariant: 'warning',
    queueLabel: { ar: 'طابور اعتماد المستندات', en: 'Documents Approval Queue' },
    ownerTeamLabel: { ar: 'الامتثال + الموردين', en: 'Compliance + Vendor Ops' },
    summary: {
      ar: 'الملف جاهز تشغيليًا لكن لا يزال يحتاج إقفال بعض متطلبات المستندات والاعتماد البنكي.',
      en: 'The profile is operationally close to ready but still needs document and bank-approval closure.'
    },
    nextStep: {
      ar: 'أكمل مراجعة هوية المالك واعتماد الحساب البنكي قبل تحرير الملف بالكامل.',
      en: 'Complete owner-ID and bank-account review before fully clearing the file.'
    },
    blockers: [
      {
        ar: 'اعتماد الحساب البنكي غير مكتمل.',
        en: 'Bank verification is not complete yet.'
      }
    ],
    alerts: [
      {
        ar: 'تحديث هوية المالك ما زال تحت المراجعة.',
        en: 'The owner ID update is still under review.'
      }
    ],
    linkedOrderIds: []
  }
];

@Injectable({
  providedIn: 'root'
})
export class WorkflowLinksService {
  constructor(
    private readonly customersService: CustomersService,
    private readonly disputesService: DisputesService,
    private readonly driverService: DriverService,
    private readonly ordersService: OrdersService,
    private readonly translate: TranslateService
  ) {}

  getOrderWorkflowLinks(order: OrderDetail | null): WorkflowLinkCard[] {
    if (!order) {
      return [];
    }

    return this.dedupeCards(
      this.buildOrderContextCards(order, {
        includeOrder: false,
        includeCatalog: true
      })
    );
  }

  getCustomerWorkflowLinks(customer: CustomerDetailRecord | null): WorkflowLinkCard[] {
    if (!customer) {
      return [];
    }

    const primaryOrder = this.findPrimaryOrderForCustomer(customer);

    return primaryOrder
      ? this.dedupeCards(
          this.buildOrderContextCards(primaryOrder, {
            includeCustomer: false,
            includeCatalog: true
          })
        )
      : [];
  }

  getDriverWorkflowLinks(driver: Driver | null, driverDetail?: DriverDetailRecord | null): WorkflowLinkCard[] {
    if (!driver) {
      return [];
    }

    const activeOrder = this.findPrimaryOrderForDriver(driver);
    const detail = driverDetail ?? buildDriverDetailRecord(driver);

    if (activeOrder) {
      return this.dedupeCards(
        this.buildOrderContextCards(activeOrder, {
          includeDriver: false,
          includeCatalog: true
        })
      );
    }

    const fallbackVendor = detail.operations.taskAssignments
      .map((assignment) => this.findVendorByMerchantName(assignment.vendor))
      .find((vendor): vendor is VendorWorkflowSnapshot => Boolean(vendor));

    return fallbackVendor ? [this.buildVendorCard(fallbackVendor)] : [];
  }

  getVendorWorkflowLinks(vendorId: string | null): WorkflowLinkCard[] {
    const vendor = this.getVendorSnapshot(vendorId);
    const primaryOrder = vendor.linkedOrders[0];

    return primaryOrder
      ? this.dedupeCards(
          this.buildOrderContextCards(primaryOrder, {
            includeVendor: false,
            includeCatalog: true
          })
        )
      : [];
  }

  getProductWorkflowLinks(
    product: MasterProduct | null,
    context: {
      brandName?: string;
      categoryName?: string;
      vendorIds?: string[];
    } = {}
  ): WorkflowLinkCard[] {
    if (!product) {
      return [];
    }

    const cards: WorkflowLinkCard[] = [];

    if (product.brandId && context.brandName) {
      cards.push(this.buildBrandDetailCard(product.brandId, context.brandName));
    }

    if (product.categoryId && context.categoryName) {
      cards.push(this.buildCategoryDetailCard(product.categoryId, context.categoryName));
    }

    for (const vendorId of context.vendorIds ?? []) {
      cards.push(this.buildVendorCard(this.getVendorSnapshot(vendorId)));
    }

    const relatedOrder = this.findRelatedOrderForCatalog({
      productNames: this.collectProductNames(product),
      brandNames: context.brandName ? [context.brandName] : []
    });

    if (relatedOrder) {
      cards.push(
        ...this.buildOrderContextCards(relatedOrder, {
          includeCatalog: false
        })
      );
    }

    return this.dedupeCards(cards);
  }

  getBrandWorkflowLinks(brand: Brand | null, products: MasterProduct[] = []): WorkflowLinkCard[] {
    if (!brand) {
      return [];
    }

    const cards: WorkflowLinkCard[] = [];
    const leadProduct = products[0];

    if (leadProduct) {
      cards.push(this.buildProductDetailCard(leadProduct));
      const categoryName = this.extractLocalizedField(leadProduct as unknown as Record<string, unknown>, 'categoryNameAr', 'categoryNameEn');
      if (leadProduct.categoryId && categoryName) {
        cards.push(this.buildCategoryDetailCard(leadProduct.categoryId, categoryName));
      }
    }

    const relatedOrder = this.findRelatedOrderForCatalog({
      productNames: this.collectProductNames(...products),
      brandNames: this.collectLocalizedNames(brand)
    });

    if (relatedOrder) {
      cards.push(
        ...this.buildOrderContextCards(relatedOrder, {
          includeCatalog: false
        })
      );
    }

    return this.dedupeCards(cards);
  }

  getCategoryWorkflowLinks(category: Category | null, products: MasterProduct[] = []): WorkflowLinkCard[] {
    if (!category) {
      return [];
    }

    const cards: WorkflowLinkCard[] = [];
    const leadProduct = products[0];

    if (leadProduct) {
      cards.push(this.buildProductDetailCard(leadProduct));

      const brandName = this.extractLocalizedField(leadProduct as unknown as Record<string, unknown>, 'brandNameAr', 'brandNameEn');
      if (leadProduct.brandId && brandName) {
        cards.push(this.buildBrandDetailCard(leadProduct.brandId, brandName));
      }
    }

    const relatedOrder = this.findRelatedOrderForCatalog({
      productNames: this.collectProductNames(...products),
      brandNames: this.collectRelatedBrandNames(products)
    });

    if (relatedOrder) {
      cards.push(
        ...this.buildOrderContextCards(relatedOrder, {
          includeCatalog: false
        })
      );
    }

    return this.dedupeCards(cards);
  }

  getDisputeWorkflowLinks(dispute: DisputeRow | null): WorkflowLinkCard[] {
    if (!dispute) {
      return [];
    }

    const cards: WorkflowLinkCard[] = [];
    const order = this.ordersService.getOrderSnapshotById(dispute.orderId);

    if (order) {
      cards.push(
        ...this.buildOrderContextCards(order, {
          includeDispute: false,
          includeCatalog: true
        })
      );
    }

    if (dispute.workflowContext?.categoryName) {
      cards.push(this.buildCategorySearchCard(dispute.workflowContext.categoryName));
    }

    return this.dedupeCards(cards);
  }

  getVendorSnapshot(vendorId: string | null): VendorWorkflowSnapshot {
    const seed = this.findVendorSeedById(vendorId) ?? this.findVendorSeedById('VND-9928') ?? VENDOR_WORKFLOW_SEEDS[0];
    const linkedOrders = this.resolveVendorOrders(seed);

    return {
      id: seed.id,
      displayName: this.localize(seed.displayName),
      location: this.localize(seed.location),
      category: this.localize(seed.category),
      phone: seed.phone,
      email: seed.email,
      workflowStateLabel: this.localize(seed.workflowStateLabel),
      workflowVariant: seed.workflowVariant,
      queueLabel: this.localize(seed.queueLabel),
      ownerTeamLabel: this.localize(seed.ownerTeamLabel),
      summary: this.localize(seed.summary),
      nextStep: this.localize(seed.nextStep),
      blockers: seed.blockers.map((item) => this.localize(item)),
      alerts: seed.alerts.map((item) => this.localize(item)),
      linkedOrders
    };
  }

  private buildOrderCard(order: OrderDetail): WorkflowLinkCard {
    return {
      id: `order-${order.id}`,
      entityLabel: this.translate.instant('WORKFLOW_LINKS.ENTITY.ORDER'),
      title: order.displayId,
      reference: order.date,
      subtitle: `${order.customerName} • ${order.merchantName}`,
      contextLabel: order.city || order.merchantBranch,
      statusLabel: this.translate.instant(getWorkflowStageKey(order.workflowStage)),
      statusVariant: this.getOrderVariant(order),
      summary: order.alertLabel,
      nextStep: this.translate.instant(order.nextActionLabel),
      routeCommands: ['/orders', order.id]
    };
  }

  private buildCustomerCard(customer: CustomerDetailRecord): WorkflowLinkCard {
    return {
      id: `customer-${customer.id}`,
      entityLabel: this.translate.instant('WORKFLOW_LINKS.ENTITY.CUSTOMER'),
      title: customer.name,
      reference: customer.id,
      referenceDir: 'ltr',
      subtitle: `${customer.city} • ${customer.phone}`,
      contextLabel: this.translate.instant(customer.workflow.queueLabelKey),
      statusLabel: this.translate.instant(CUSTOMER_WORKFLOW_STATE_KEYS[customer.workflow.state]),
      statusVariant: this.getCustomerVariant(customer),
      summary: this.translate.instant(customer.workflow.summaryKey),
      nextStep: this.translate.instant(customer.workflow.nextStepKey),
      routeCommands: ['/customers', customer.id]
    };
  }

  private buildDriverCard(driver: Driver): WorkflowLinkCard {
    const detail = buildDriverDetailRecord(driver);

    return {
      id: `driver-${driver.id}`,
      entityLabel: this.translate.instant('WORKFLOW_LINKS.ENTITY.DRIVER'),
      title: detail.displayName,
      reference: detail.driverId,
      referenceDir: 'ltr',
      subtitle: `${driver.city} • ${driver.status}`,
      contextLabel: detail.workflow.queueLabel,
      statusLabel: detail.workflow.stateLabel,
      statusVariant: this.getDriverVariant(detail),
      summary: detail.workflow.summary,
      nextStep: detail.workflow.nextActionLabel,
      routeCommands: ['/drivers', driver.id]
    };
  }

  private buildVendorCard(vendor: VendorWorkflowSnapshot): WorkflowLinkCard {
    return {
      id: `vendor-${vendor.id}`,
      entityLabel: this.translate.instant('WORKFLOW_LINKS.ENTITY.VENDOR'),
      title: vendor.displayName,
      reference: vendor.id,
      referenceDir: 'ltr',
      subtitle: vendor.location,
      contextLabel: vendor.queueLabel,
      statusLabel: vendor.workflowStateLabel,
      statusVariant: vendor.workflowVariant,
      summary: vendor.summary,
      nextStep: vendor.nextStep,
      routeCommands: ['/vendors', vendor.id]
    };
  }

  private buildDisputeCard(dispute: DisputeRow): WorkflowLinkCard {
    return {
      id: `dispute-${dispute.id}`,
      entityLabel: this.translate.instant('WORKFLOW_LINKS.ENTITY.DISPUTE'),
      title: dispute.id,
      reference: dispute.orderId,
      referenceDir: 'ltr',
      subtitle: `${dispute.customerName} - ${dispute.merchantName}`,
      contextLabel: this.localizeInline('مكتب النزاعات', 'Dispute Desk'),
      statusLabel: this.getDisputeStatusLabel(dispute),
      statusVariant: this.getDisputeVariant(dispute),
      summary: dispute.reason,
      nextStep: this.getDisputeNextStep(dispute),
      routeCommands: ['/disputes'],
      queryParams: { focus: dispute.id }
    };
  }

  private buildProductDetailCard(product: MasterProduct): WorkflowLinkCard {
    return {
      id: `product-${product.id}`,
      entityLabel: this.translate.instant('WORKFLOW_LINKS.ENTITY.PRODUCT'),
      title: this.isArabic ? product.nameAr : product.nameEn,
      reference: product.barcode || product.id,
      referenceDir: 'ltr',
      subtitle: this.localizeInline('سجل المنتج الرئيسي', 'Master product record'),
      contextLabel: this.localizeInline('الكتالوج', 'Catalog'),
      statusLabel: product.status,
      statusVariant: this.getCatalogVariant(product.status),
      summary: this.localizeInline(
        'المنتج مرتبط بالكتالوج ويمكن تتبع الطلبات والكيانات التشغيلية المرتبطة به من نفس المسار.',
        'This product is part of the catalog and can be traced to related operational entities.'
      ),
      nextStep: this.localizeInline(
        'راجع علاقة المنتج بالطلبات المفتوحة والتجار النشطين قبل أي تعديل مؤثر.',
        'Review open-order and vendor relationships before making impactful changes.'
      ),
      routeCommands: ['/catalog/products/view', product.id]
    };
  }

  private buildBrandDetailCard(brandId: string, brandName: string): WorkflowLinkCard {
    return {
      id: `brand-${brandId}`,
      entityLabel: this.translate.instant('WORKFLOW_LINKS.ENTITY.BRAND'),
      title: brandName,
      reference: brandId,
      referenceDir: 'ltr',
      subtitle: this.localizeInline('ملف العلامة التجارية', 'Brand profile'),
      contextLabel: this.localizeInline('الكتالوج', 'Catalog'),
      statusLabel: this.localizeInline('مرجع معتمد', 'Approved Reference'),
      statusVariant: 'info',
      summary: this.localizeInline(
        'العلامة التجارية مرتبطة بسجلات المنتجات والتشغيل الحالية داخل نفس المسار.',
        'The brand is connected to current product and operational records.'
      ),
      nextStep: this.localizeInline(
        'راجع المنتجات التابعة لهذه العلامة قبل تحديثها أو إيقافها.',
        'Review the linked products before editing or pausing this brand.'
      ),
      routeCommands: ['/catalog/brands/view', brandId]
    };
  }

  private buildCategoryDetailCard(categoryId: string, categoryName: string): WorkflowLinkCard {
    return {
      id: `category-${categoryId}`,
      entityLabel: this.translate.instant('WORKFLOW_LINKS.ENTITY.CATEGORY'),
      title: categoryName,
      reference: categoryId,
      referenceDir: 'ltr',
      subtitle: this.localizeInline('عقدة تصنيف تشغيلية', 'Operational category node'),
      contextLabel: this.localizeInline('الكتالوج', 'Catalog'),
      statusLabel: this.localizeInline('تصنيف فعال', 'Active Taxonomy'),
      statusVariant: 'neutral',
      summary: this.localizeInline(
        'هذا التصنيف يحدد مكان المنتجات ضمن هيكل الكتالوج ومسار الربط التشغيلي.',
        'This category anchors products inside the catalog and operational linking flow.'
      ),
      nextStep: this.localizeInline(
        'راجع المنتجات التابعة ثم تحقق من أي طلبات أو نزاعات متأثرة بهذا التصنيف.',
        'Review linked products, then verify any orders or disputes affected by this category.'
      ),
      routeCommands: ['/catalog/categories', categoryId]
    };
  }

  private buildProductSearchCard(productName: string, brandName?: string, sku?: string): WorkflowLinkCard {
    return {
      id: `product-search-${this.normalizeName(productName)}-${this.normalizeName(sku)}`,
      entityLabel: this.translate.instant('WORKFLOW_LINKS.ENTITY.PRODUCT'),
      title: productName,
      reference: sku,
      referenceDir: 'ltr',
      subtitle: brandName,
      contextLabel: this.localizeInline('طلب/نزاع مرتبط', 'Linked Demand'),
      statusLabel: this.localizeInline('عرض مرتبط', 'Linked Listing'),
      statusVariant: 'processing',
      summary: this.localizeInline(
        'تم رصد هذا المنتج داخل سجل تشغيلي أو نزاع ويُنصح بمراجعته من الكتالوج.',
        'This product was detected in an operational record or dispute and should be reviewed in the catalog.'
      ),
      nextStep: this.localizeInline(
        'افتح قائمة المنتجات المفلترة لمراجعة بياناته وسعره وصوره ووحدته.',
        'Open the filtered product list to review its data, pricing, imagery, and unit.'
      ),
      routeCommands: ['/catalog/products'],
      queryParams: { search: productName }
    };
  }

  private buildBrandSearchCard(brandName: string, productName?: string): WorkflowLinkCard {
    return {
      id: `brand-search-${this.normalizeName(brandName)}`,
      entityLabel: this.translate.instant('WORKFLOW_LINKS.ENTITY.BRAND'),
      title: brandName,
      subtitle: productName,
      contextLabel: this.localizeInline('مرجع الطلب', 'Order Reference'),
      statusLabel: this.localizeInline('عرض مرتبط', 'Linked Listing'),
      statusVariant: 'info',
      summary: this.localizeInline(
        'هذه العلامة ظهرت داخل سياق تشغيلي وترتبط بمنتجات تحتاج متابعة داخل الكتالوج.',
        'This brand appears in an operational context and links to products that need catalog follow-up.'
      ),
      nextStep: this.localizeInline(
        'افتح قائمة العلامات المفلترة لمراجعة حالة العلامة والمنتجات التابعة لها.',
        'Open the filtered brands list to review the brand and its linked products.'
      ),
      routeCommands: ['/catalog/brands'],
      queryParams: { search: brandName }
    };
  }

  private buildCategorySearchCard(categoryName: string): WorkflowLinkCard {
    return {
      id: `category-search-${this.normalizeName(categoryName)}`,
      entityLabel: this.translate.instant('WORKFLOW_LINKS.ENTITY.CATEGORY'),
      title: categoryName,
      contextLabel: this.localizeInline('نزاع مرتبط', 'Linked Dispute'),
      statusLabel: this.localizeInline('مرجع تصنيف', 'Category Reference'),
      statusVariant: 'neutral',
      summary: this.localizeInline(
        'التصنيف مرتبط بهذه الحالة ويستحق مراجعة سريعة من هيكل الكتالوج.',
        'This category is associated with the current case and deserves a quick catalog review.'
      ),
      nextStep: this.localizeInline(
        'افتح قائمة التصنيفات المفلترة لمراجعة الهيكل والمنتجات التابعة.',
        'Open the filtered categories list to review the hierarchy and linked products.'
      ),
      routeCommands: ['/catalog/categories'],
      queryParams: { search: categoryName }
    };
  }

  private buildOrderContextCards(
    order: OrderDetail,
    options: {
      includeOrder?: boolean;
      includeCustomer?: boolean;
      includeDriver?: boolean;
      includeVendor?: boolean;
      includeDispute?: boolean;
      includeCatalog?: boolean;
    } = {}
  ): WorkflowLinkCard[] {
    const cards: WorkflowLinkCard[] = [];
    const includeOrder = options.includeOrder ?? true;
    const includeCustomer = options.includeCustomer ?? true;
    const includeDriver = options.includeDriver ?? true;
    const includeVendor = options.includeVendor ?? true;
    const includeDispute = options.includeDispute ?? true;
    const includeCatalog = options.includeCatalog ?? false;

    if (includeOrder) {
      cards.push(this.buildOrderCard(order));
    }

    if (includeCustomer) {
      const customer = this.findCustomerByOrderId(order.id);
      if (customer) {
        cards.push(this.buildCustomerCard(customer));
      }
    }

    if (includeDriver) {
      const driver = this.driverService.findDriverByIdentity({
        fullName: order.driverName,
        phoneNumber: order.driverPhone
      });
      if (driver) {
        cards.push(this.buildDriverCard(driver));
      }
    }

    if (includeVendor) {
      const vendor = this.findVendorByMerchantName(order.merchantName);
      if (vendor) {
        cards.push(this.buildVendorCard(vendor));
      }
    }

    if (includeDispute) {
      const dispute = this.disputesService.findPrimaryDisputeByOrderId(order.id);
      if (dispute) {
        cards.push(this.buildDisputeCard(dispute));
      }
    }

    if (includeCatalog) {
      const primaryItem = order.items[0];
      if (primaryItem?.name) {
        cards.push(this.buildProductSearchCard(primaryItem.name, primaryItem.brand, primaryItem.sku));
      }

      if (primaryItem?.brand) {
        cards.push(this.buildBrandSearchCard(primaryItem.brand, primaryItem.name));
      }
    }

    return cards;
  }

  private findCustomerByOrderId(orderId: string): CustomerDetailRecord | undefined {
    return this.customersService
      .getCustomers()
      .find((customer) => customer.recentOrders.some((order) => order.id === orderId));
  }

  private findPrimaryOrderForCustomer(customer: CustomerDetailRecord): OrderDetail | undefined {
    for (const recentOrder of customer.recentOrders) {
      const order = this.ordersService.getOrderSnapshotById(recentOrder.id);

      if (order) {
        return order;
      }
    }

    return undefined;
  }

  private findPrimaryOrderForDriver(driver: Driver): OrderDetail | undefined {
    const orders = this.ordersService
      .getOrdersSnapshot()
      .filter((order) => this.matchesDriver(order, driver));

    return orders.find((order) => order.status !== 'COMPLETED' && order.status !== 'CANCELLED') ?? orders[0];
  }

  private matchesDriver(order: OrderDetail, driver: Driver): boolean {
    return this.normalizeName(order.driverName) === this.normalizeName(`${driver.firstName} ${driver.lastName}`)
      || this.normalizePhone(order.driverPhone) === this.normalizePhone(driver.phoneNumber);
  }

  private findVendorByMerchantName(name: string | null | undefined): VendorWorkflowSnapshot | undefined {
    if (!name) {
      return undefined;
    }

    const seed = VENDOR_WORKFLOW_SEEDS.find((item) =>
      item.merchantNames.some((merchantName) => this.normalizeName(merchantName) === this.normalizeName(name))
    );

    return seed ? this.getVendorSnapshot(seed.id) : undefined;
  }

  private findVendorSeedById(vendorId: string | null | undefined): VendorWorkflowSeed | undefined {
    return VENDOR_WORKFLOW_SEEDS.find((seed) => seed.id === vendorId);
  }

  private resolveVendorOrders(seed: VendorWorkflowSeed): OrderDetail[] {
    const explicitOrders = seed.linkedOrderIds
      .map((orderId) => this.ordersService.getOrderSnapshotById(orderId))
      .filter((order): order is OrderDetail => Boolean(order));

    if (explicitOrders.length) {
      return explicitOrders;
    }

    return this.ordersService
      .getOrdersSnapshot()
      .filter((order) =>
        seed.merchantNames.some((merchantName) => this.normalizeName(merchantName) === this.normalizeName(order.merchantName))
      );
  }

  private findRelatedOrderForCatalog(criteria: { productNames?: string[]; brandNames?: string[] }): OrderDetail | undefined {
    const productNames = (criteria.productNames ?? []).filter(Boolean);
    const brandNames = (criteria.brandNames ?? []).filter(Boolean);

    if (!productNames.length && !brandNames.length) {
      return undefined;
    }

    return this.ordersService
      .getOrdersSnapshot()
      .find((order) =>
        order.items.some((item) =>
          productNames.some((name) => this.namesLooselyMatch(item.name, name))
          || brandNames.some((name) => this.namesLooselyMatch(item.brand, name))
        )
      );
  }

  private collectProductNames(...products: MasterProduct[]): string[] {
    return products.flatMap((product) => this.collectLocalizedNames(product));
  }

  private collectLocalizedNames(entity: { nameAr?: string; nameEn?: string }): string[] {
    return [entity.nameAr, entity.nameEn].filter((value): value is string => Boolean(value?.trim()));
  }

  private collectRelatedBrandNames(products: MasterProduct[]): string[] {
    return products
      .map((product) => this.extractLocalizedField(product as unknown as Record<string, unknown>, 'brandNameAr', 'brandNameEn'))
      .filter((value): value is string => Boolean(value));
  }

  private extractLocalizedField(
    source: Record<string, unknown>,
    arabicKey: string,
    englishKey: string
  ): string | undefined {
    const arabicValue = typeof source[arabicKey] === 'string' ? source[arabicKey] as string : '';
    const englishValue = typeof source[englishKey] === 'string' ? source[englishKey] as string : '';
    return this.isArabic ? arabicValue || englishValue || undefined : englishValue || arabicValue || undefined;
  }

  private namesLooselyMatch(left: string | null | undefined, right: string | null | undefined): boolean {
    const normalizedLeft = this.normalizeName(left);
    const normalizedRight = this.normalizeName(right);

    if (!normalizedLeft || !normalizedRight) {
      return false;
    }

    return normalizedLeft === normalizedRight
      || normalizedLeft.includes(normalizedRight)
      || normalizedRight.includes(normalizedLeft);
  }

  private getDisputeVariant(dispute: DisputeRow): WorkflowLinkVariant {
    switch (dispute.status) {
      case 'resolved':
        return 'success';
      case 'merchant':
        return 'paused';
      case 'review':
        return dispute.priority === 'critical' ? 'high-risk' : 'warning';
      case 'open':
      default:
        return dispute.priority === 'critical' ? 'high-risk' : 'danger';
    }
  }

  private getDisputeStatusLabel(dispute: DisputeRow): string {
    switch (dispute.status) {
      case 'resolved':
        return this.localizeInline('مغلق', 'Resolved');
      case 'merchant':
        return this.localizeInline('بانتظار التاجر', 'Waiting on Merchant');
      case 'review':
        return this.localizeInline('قيد المراجعة', 'Under Review');
      case 'open':
      default:
        return this.localizeInline('نزاع مفتوح', 'Open Dispute');
    }
  }

  private getDisputeNextStep(dispute: DisputeRow): string {
    switch (dispute.status) {
      case 'resolved':
        return this.localizeInline(
          'راجع الإغلاق النهائي ثم أرشف الحالة إن لم توجد متابعة مالية مفتوحة.',
          'Review the final closure, then archive the case if no finance follow-up remains open.'
        );
      case 'merchant':
        return this.localizeInline(
          'تابع رد التاجر وأغلق المسار التشغيلي أو المالي حسب النتيجة.',
          'Follow up on the merchant response and close the operational or finance track accordingly.'
        );
      case 'review':
        return this.localizeInline(
          'استكمل التحقق من الأدلة واربط القرار النهائي مع المالية أو الدعم.',
          'Finish evidence review and align the final decision with finance or support.'
        );
      case 'open':
      default:
        return this.localizeInline(
          'ابدأ التحقق من الأطراف المرتبطة ثم حدد جهة التصعيد المناسبة.',
          'Start validating the involved parties, then route the case to the correct escalation desk.'
        );
    }
  }

  private getCatalogVariant(status: MasterProduct['status'] | string | undefined): WorkflowLinkVariant {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Draft':
        return 'warning';
      case 'Inactive':
        return 'paused';
      case 'Discontinued':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  private dedupeCards(cards: WorkflowLinkCard[]): WorkflowLinkCard[] {
    const seen = new Set<string>();

    return cards.filter((card) => {
      if (seen.has(card.id)) {
        return false;
      }

      seen.add(card.id);
      return true;
    });
  }

  private getOrderVariant(order: OrderDetail): WorkflowLinkVariant {
    if (order.hasActiveIssue || order.operationalCase?.status === 'OPEN') {
      return 'warning';
    }

    if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
      return 'success';
    }

    if (order.status === 'CANCELLED') {
      return 'info';
    }

    return 'processing';
  }

  private getCustomerVariant(customer: CustomerDetailRecord): WorkflowLinkVariant {
    switch (customer.workflow.state) {
      case 'healthy':
        return 'success';
      case 'monitoring':
        return 'warning';
      case 'retention':
        return 'info';
      case 'under_review':
        return 'paused';
      case 'suspended':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  private getDriverVariant(detail: DriverDetailRecord): WorkflowLinkVariant {
    switch (detail.workflow.readiness) {
      case 'READY':
        return 'success';
      case 'LIMITED':
        return 'warning';
      case 'BLOCKED':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  private localize(text: LocalizedText): string {
    return this.isArabic ? text.ar : text.en;
  }

  private localizeInline(ar: string, en: string): string {
    return this.isArabic ? ar : en;
  }

  private get isArabic(): boolean {
    return (this.translate.currentLang || 'ar') === 'ar';
  }

  private normalizeName(value: string | null | undefined): string {
    return (value || '')
      .toLowerCase()
      .replace(/[^a-z\u0600-\u06ff0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizePhone(value: string | null | undefined): string {
    return (value || '').replace(/\D+/g, '');
  }
}
