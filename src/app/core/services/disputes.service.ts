import { Injectable } from '@angular/core';
import { OrdersService } from './orders.service';
import { DisputeRow, TimelineItem } from '../../features/disputes/disputes.models';

interface DisputeSeed {
  id: string;
  orderId: string;
  type: string;
  reason: string;
  amount: number;
  status: DisputeRow['status'];
  priority: DisputeRow['priority'];
  owner: string;
  risk: DisputeRow['risk'];
  createdAt: string;
  sla: string;
  note: string;
  paymentMask: string;
  customerSummary: string;
  merchantSummary: string;
  evidence: DisputeRow['evidence'];
  timeline: TimelineItem[];
  workflowContext?: DisputeRow['workflowContext'];
}

const DISPUTE_SEEDS: DisputeSeed[] = [
  {
    id: 'DIS-9902',
    orderId: 'ZD-94816',
    type: 'نزاع عنصر مفقود',
    reason: 'أبلغ العميل عن عنصر مفقود وتم فتح متابعة دعم مع استرداد جزئي لحين إقفال الحالة.',
    amount: 72,
    status: 'review',
    priority: 'critical',
    owner: 'سارة فهد',
    risk: 'high',
    createdAt: 'منذ 12 دقيقة',
    sla: '4 ساعات متبقية',
    note: 'الطلب مرتبط بحالة دعم مفتوحة ويحتاج مراجعة التاجر والسائق قبل اعتماد الإقفال المالي.',
    paymentMask: '**** 4421',
    customerSummary: 'عميل موثق، مع طلبات ناجحة سابقة، وتحتاج الحالة متابعة تجربة الاستلام.',
    merchantSummary: 'الفرع تحت متابعة بسبب نزاعات عناصر مفقودة متكررة خلال نفس النافذة التشغيلية.',
    evidence: [
      {
        type: 'image',
        label: 'صورة الطلب',
        preview: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80'
      },
      {
        type: 'pdf',
        label: 'MISSING-ITEM-REPORT.PDF'
      }
    ],
    timeline: [
      { titleKey: 'DISPUTES_DASHBOARD.TIMELINE.DIS9902.OPENED_BY_CUSTOMER', timeKey: 'DISPUTES_DASHBOARD.TIMELINE.TIME_1024_AM', tone: 'primary' },
      { titleKey: 'DISPUTES_DASHBOARD.TIMELINE.DIS9902.ASSIGNED_TO_SARAH', timeKey: 'DISPUTES_DASHBOARD.TIMELINE.TIME_1115_AM', tone: 'muted' },
      { titleKey: 'DISPUTES_DASHBOARD.TIMELINE.DIS9902.ESCALATED_CRITICAL', timeKey: 'DISPUTES_DASHBOARD.TIMELINE.TIME_22_MIN_AGO', tone: 'warning' }
    ],
    workflowContext: {
      productName: 'حفاضات أطفال',
      brandName: 'بامبرز',
      categoryName: 'العناية بالأطفال',
      sku: 'SKU-331102'
    }
  },
  {
    id: 'REF-8812',
    orderId: 'ZD-94819',
    type: 'مراجعة فشل دفع',
    reason: 'الدفع فشل بعد اعتماد الطلب ويحتاج مراجعة مالية قبل إعادة المحاولة أو الإلغاء.',
    amount: 85,
    status: 'merchant',
    priority: 'high',
    owner: 'بانتظار المالية',
    risk: 'high',
    createdAt: 'منذ 36 دقيقة',
    sla: '11 ساعة متبقية',
    note: 'تم ربط الحالة ببوابة الدفع مع متابعة للتاجر لأن الطلب لم يدخل التنفيذ بعد.',
    paymentMask: '**** 9912',
    customerSummary: 'عميلة موثقة، لم تسجل نزاعات متكررة، لكن لديها حساسية من تأخير الدفع.',
    merchantSummary: 'فرع مستقر تشغيليًا لكن يحتاج تنسيق أسرع مع المالية في حالات الدفع الفاشل.',
    evidence: [
      {
        type: 'image',
        label: 'محاولة الدفع',
        preview: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80'
      },
      {
        type: 'pdf',
        label: 'PAYMENT-TRACE.PDF'
      }
    ],
    timeline: [
      { titleKey: 'DISPUTES_DASHBOARD.TIMELINE.REF8812.REFUND_REQUEST_RECEIVED', timeKey: 'DISPUTES_DASHBOARD.TIMELINE.TIME_0910_AM', tone: 'primary' },
      { titleKey: 'DISPUTES_DASHBOARD.TIMELINE.REF8812.EVIDENCE_SENT_TO_MERCHANT', timeKey: 'DISPUTES_DASHBOARD.TIMELINE.TIME_0921_AM', tone: 'muted' },
      { titleKey: 'DISPUTES_DASHBOARD.TIMELINE.REF8812.WAITING_FOR_MERCHANT', timeKey: 'DISPUTES_DASHBOARD.TIMELINE.TIME_NOW', tone: 'warning' }
    ],
    workflowContext: {
      productName: 'عصير برتقال',
      brandName: 'المراعي',
      categoryName: 'المشروبات',
      sku: 'SKU-410011'
    }
  },
  {
    id: 'DIS-7721',
    orderId: 'ZD-94820',
    type: 'تعويض تأخير تجهيز',
    reason: 'الطلب متأخر عن الـ SLA وتم فتح متابعة مع التاجر لاحتمال تعويض العميل.',
    amount: 35,
    status: 'open',
    priority: 'medium',
    owner: 'عبدالله خالد',
    risk: 'medium',
    createdAt: 'منذ ساعة',
    sla: '19 ساعة متبقية',
    note: 'الحالة تشغيلية بالأساس، لكن تم رفعها كنزاع خدمة لتوثيق أي تعويض أو قسيمة لاحقة.',
    paymentMask: '**** 1204',
    customerSummary: 'عميل نشط مع طلبات متكررة ويهتم بسرعة التجهيز والالتزام بالوقت.',
    merchantSummary: 'الفرع تحت ضغط تشغيلي ويحتاج تحسين سرعة التجهيز قبل التصعيد.',
    evidence: [
      {
        type: 'image',
        label: 'لقطة متابعة التشغيل',
        preview: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=900&q=80'
      },
      {
        type: 'pdf',
        label: 'SLA-EXCEPTION.PDF'
      }
    ],
    timeline: [
      { titleKey: 'DISPUTES_DASHBOARD.TIMELINE.DIS7721.DISPUTE_REGISTERED', timeKey: 'DISPUTES_DASHBOARD.TIMELINE.TIME_0842_AM', tone: 'primary' },
      { titleKey: 'DISPUTES_DASHBOARD.TIMELINE.DIS7721.INVOICE_REVIEWED', timeKey: 'DISPUTES_DASHBOARD.TIMELINE.TIME_0905_AM', tone: 'muted' },
      { titleKey: 'DISPUTES_DASHBOARD.TIMELINE.DIS7721.COUPON_MATCH_REQUIRED', timeKey: 'DISPUTES_DASHBOARD.TIMELINE.TIME_0916_AM', tone: 'warning' }
    ],
    workflowContext: {
      productName: 'زيت زيتون',
      brandName: 'الجوف',
      categoryName: 'البقالة',
      sku: 'SKU-552102'
    }
  },
  {
    id: 'REF-6404',
    orderId: 'ZD-94818',
    type: 'إغلاق استرداد كامل',
    reason: 'تم إلغاء الطلب بسبب نفاد المخزون مع استرداد كامل ويجري إقفال الحالة النهائية.',
    amount: 340,
    status: 'resolved',
    priority: 'low',
    owner: 'تم الإغلاق',
    risk: 'low',
    createdAt: 'أمس',
    sla: 'مغلق',
    note: 'تم توثيق سبب الإلغاء واسترداد كامل للعميل، والحالة جاهزة للأرشفة.',
    paymentMask: '**** 8755',
    customerSummary: 'عميل متكرر مع سجل جيد، وتم احتواء الحالة سريعًا دون تصعيد إضافي.',
    merchantSummary: 'الحالة مغلقة، لكن الفرع يحتاج متابعة مخزون للحد من إلغاءات مماثلة.',
    evidence: [
      {
        type: 'image',
        label: 'صورة الطلب',
        preview: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'
      }
    ],
    timeline: [
      { titleKey: 'DISPUTES_DASHBOARD.TIMELINE.REF6404.REFUND_OPENED', timeKey: 'DISPUTES_DASHBOARD.TIMELINE.TIME_YESTERDAY_0712_PM', tone: 'primary' },
      { titleKey: 'DISPUTES_DASHBOARD.TIMELINE.REF6404.PARTIAL_REFUND_APPROVED', timeKey: 'DISPUTES_DASHBOARD.TIMELINE.TIME_YESTERDAY_0802_PM', tone: 'muted' },
      { titleKey: 'DISPUTES_DASHBOARD.TIMELINE.REF6404.CASE_SETTLED_AND_CLOSED', timeKey: 'DISPUTES_DASHBOARD.TIMELINE.TIME_YESTERDAY_0807_PM', tone: 'warning' }
    ],
    workflowContext: {
      productName: 'لحوم طازجة',
      brandName: 'الوادي',
      categoryName: 'الأغذية الطازجة',
      sku: 'SKU-992222'
    }
  }
];

@Injectable({
  providedIn: 'root'
})
export class DisputesService {
  constructor(private readonly ordersService: OrdersService) {}

  getDisputesSnapshot(): DisputeRow[] {
    return DISPUTE_SEEDS.map((seed) => this.toDisputeRow(seed));
  }

  getDisputeById(id: string | null): DisputeRow | undefined {
    if (!id) {
      return undefined;
    }

    const seed = DISPUTE_SEEDS.find((item) => item.id === id);
    return seed ? this.toDisputeRow(seed) : undefined;
  }

  findPrimaryDisputeByOrderId(orderId: string | null | undefined): DisputeRow | undefined {
    if (!orderId) {
      return undefined;
    }

    const seed = DISPUTE_SEEDS.find((item) => item.orderId === orderId);
    return seed ? this.toDisputeRow(seed) : undefined;
  }

  private toDisputeRow(seed: DisputeSeed): DisputeRow {
    const order = this.ordersService.getOrderSnapshotById(seed.orderId);
    const customerName = order?.customerName || 'عميل غير معروف';
    const customerEmail = order?.customerEmail || 'customer@zadna.com';
    const merchantName = order?.merchantName || 'تاجر غير معروف';

    return {
      id: seed.id,
      orderId: seed.orderId,
      customerName,
      customerEmail,
      customerInitials: this.buildInitials(customerName),
      merchantName,
      type: seed.type,
      reason: seed.reason,
      amount: seed.amount,
      status: seed.status,
      priority: seed.priority,
      owner: seed.owner,
      risk: seed.risk,
      createdAt: seed.createdAt,
      sla: seed.sla,
      note: seed.note,
      paymentMask: seed.paymentMask,
      customerSummary: seed.customerSummary,
      merchantSummary: seed.merchantSummary,
      evidence: seed.evidence,
      timeline: seed.timeline,
      workflowContext: seed.workflowContext
    };
  }

  private buildInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('');
  }
}
