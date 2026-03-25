import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Driver } from '../models/driver';
import { CustomerDetailRecord } from '../../features/customers/customers.models';
import { buildDriverDetailRecord } from '../../features/drivers/drivers.mock';
import { DriverDetailRecord } from '../../features/drivers/drivers.models';
import { getWorkflowStageKey } from '../../features/orders/orders.mock';
import { OrderDetail } from '../../features/orders/orders.models';
import { CustomersService } from './customers.service';
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
    private readonly driverService: DriverService,
    private readonly ordersService: OrdersService,
    private readonly translate: TranslateService
  ) {}

  getOrderWorkflowLinks(order: OrderDetail | null): WorkflowLinkCard[] {
    if (!order) {
      return [];
    }

    const cards: WorkflowLinkCard[] = [];
    const customer = this.findCustomerByOrderId(order.id);
    const driver = this.driverService.findDriverByIdentity({
      fullName: order.driverName,
      phoneNumber: order.driverPhone
    });
    const vendor = this.findVendorByMerchantName(order.merchantName);

    if (customer) {
      cards.push(this.buildCustomerCard(customer));
    }

    if (driver) {
      cards.push(this.buildDriverCard(driver));
    }

    if (vendor) {
      cards.push(this.buildVendorCard(vendor));
    }

    return cards;
  }

  getCustomerWorkflowLinks(customer: CustomerDetailRecord | null): WorkflowLinkCard[] {
    if (!customer) {
      return [];
    }

    const cards: WorkflowLinkCard[] = [];
    const primaryOrder = this.findPrimaryOrderForCustomer(customer);

    if (primaryOrder) {
      cards.push(this.buildOrderCard(primaryOrder));

      const driver = this.driverService.findDriverByIdentity({
        fullName: primaryOrder.driverName,
        phoneNumber: primaryOrder.driverPhone
      });
      const vendor = this.findVendorByMerchantName(primaryOrder.merchantName);

      if (driver) {
        cards.push(this.buildDriverCard(driver));
      }

      if (vendor) {
        cards.push(this.buildVendorCard(vendor));
      }
    }

    return cards;
  }

  getDriverWorkflowLinks(driver: Driver | null, driverDetail?: DriverDetailRecord | null): WorkflowLinkCard[] {
    if (!driver) {
      return [];
    }

    const cards: WorkflowLinkCard[] = [];
    const activeOrder = this.findPrimaryOrderForDriver(driver);
    const detail = driverDetail ?? buildDriverDetailRecord(driver);

    if (activeOrder) {
      cards.push(this.buildOrderCard(activeOrder));

      const customer = this.findCustomerByOrderId(activeOrder.id);
      const vendor = this.findVendorByMerchantName(activeOrder.merchantName);

      if (customer) {
        cards.push(this.buildCustomerCard(customer));
      }

      if (vendor) {
        cards.push(this.buildVendorCard(vendor));
      }

      return cards;
    }

    const fallbackVendor = detail.operations.taskAssignments
      .map((assignment) => this.findVendorByMerchantName(assignment.vendor))
      .find((vendor): vendor is VendorWorkflowSnapshot => Boolean(vendor));

    return fallbackVendor ? [this.buildVendorCard(fallbackVendor)] : [];
  }

  getVendorWorkflowLinks(vendorId: string | null): WorkflowLinkCard[] {
    const vendor = this.getVendorSnapshot(vendorId);
    const cards: WorkflowLinkCard[] = [];
    const primaryOrder = vendor.linkedOrders[0];

    if (primaryOrder) {
      cards.push(this.buildOrderCard(primaryOrder));

      const customer = this.findCustomerByOrderId(primaryOrder.id);
      const driver = this.driverService.findDriverByIdentity({
        fullName: primaryOrder.driverName,
        phoneNumber: primaryOrder.driverPhone
      });

      if (customer) {
        cards.push(this.buildCustomerCard(customer));
      }

      if (driver) {
        cards.push(this.buildDriverCard(driver));
      }
    }

    return cards;
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
