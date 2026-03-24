import { CustomerDetailRecord, CustomerRecord, CustomerRisk, CustomerStatus } from './customers.models';

export const CUSTOMER_RECORDS: CustomerRecord[] = [
  {
    id: 'CUS-44012',
    name: 'أحمد محمد العتيبي',
    email: 'ahmad.altibi@zadana.sa',
    phone: '055-231-7788',
    city: 'الرياض',
    segment: 'vip',
    status: 'active',
    risk: 'medium',
    totalOrders: 48,
    totalSpent: 18240,
    averageBasket: 380,
    lifetimeValue: 21450,
    refundsCount: 2,
    disputesCount: 1,
    activeDays30: 11,
    lastOrderAt: 'اليوم 09:35 ص',
    lastOrderValue: 620,
    joinedAt: 'يناير 2024',
    loyaltyScore: 94,
    preferredChannel: 'التطبيق',
    watchFlags: ['CUSTOMERS.SUPPORT.VIP_PRIORITY'],
    notes: 'عميل مرتفع القيمة مع استجابة سريعة للعروض الموسمية.'
  },
  {
    id: 'CUS-44013',
    name: 'شركة سلة الأعمال',
    email: 'ops@sallabusiness.sa',
    phone: '053-885-4401',
    city: 'جدة',
    segment: 'business',
    status: 'active',
    risk: 'low',
    totalOrders: 132,
    totalSpent: 56400,
    averageBasket: 427,
    lifetimeValue: 61280,
    refundsCount: 3,
    disputesCount: 0,
    activeDays30: 18,
    lastOrderAt: 'أمس 08:20 م',
    lastOrderValue: 1450,
    joinedAt: 'سبتمبر 2023',
    loyaltyScore: 97,
    preferredChannel: 'لوحة الأعمال',
    watchFlags: [],
    notes: 'حساب أعمال مستقر مع نمط طلبات متكرر ومنخفض المخاطر.'
  },
  {
    id: 'CUS-44014',
    name: 'سارة فهد المطيري',
    email: 'sara.fm@zadana.sa',
    phone: '050-981-2244',
    city: 'الدمام',
    segment: 'watchlist',
    status: 'restricted',
    risk: 'critical',
    totalOrders: 19,
    totalSpent: 7280,
    averageBasket: 383,
    lifetimeValue: 8010,
    refundsCount: 5,
    disputesCount: 4,
    activeDays30: 3,
    lastOrderAt: 'قبل 3 أيام',
    lastOrderValue: 210,
    joinedAt: 'مايو 2024',
    loyaltyScore: 58,
    preferredChannel: 'التطبيق',
    watchFlags: ['CUSTOMERS.SUPPORT.HIGH_REFUND', 'CUSTOMERS.SUPPORT.FRAUD_SIGNAL'],
    notes: 'الحساب تحت المتابعة بسبب نزاعات متكررة وارتفاع طلبات الاسترجاع.'
  },
  {
    id: 'CUS-44015',
    name: 'نوف الشمري',
    email: 'nouf.alshammari@mail.sa',
    phone: '056-200-1177',
    city: 'الخبر',
    segment: 'new',
    status: 'active',
    risk: 'low',
    totalOrders: 6,
    totalSpent: 980,
    averageBasket: 163,
    lifetimeValue: 1120,
    refundsCount: 0,
    disputesCount: 0,
    activeDays30: 5,
    lastOrderAt: 'اليوم 01:10 م',
    lastOrderValue: 145,
    joinedAt: 'فبراير 2026',
    loyaltyScore: 72,
    preferredChannel: 'الويب',
    watchFlags: ['CUSTOMERS.SUPPORT.NEW_CUSTOMER'],
    notes: 'عميلة جديدة بنشاط جيد في أول 30 يوم.'
  },
  {
    id: 'CUS-44016',
    name: 'عبدالله السبيعي',
    email: 'abdullah.subaie@zadana.sa',
    phone: '054-771-0061',
    city: 'الرياض',
    segment: 'vip',
    status: 'low_activity',
    risk: 'medium',
    totalOrders: 35,
    totalSpent: 14320,
    averageBasket: 409,
    lifetimeValue: 15800,
    refundsCount: 1,
    disputesCount: 1,
    activeDays30: 2,
    lastOrderAt: 'قبل 9 أيام',
    lastOrderValue: 320,
    joinedAt: 'أغسطس 2023',
    loyaltyScore: 88,
    preferredChannel: 'التطبيق',
    watchFlags: ['CUSTOMERS.SUPPORT.RETENTION_NEEDED'],
    notes: 'الإنفاق مرتفع لكن النشاط انخفض مؤخرًا ويحتاج حملة استبقاء.'
  },
  {
    id: 'CUS-44017',
    name: 'مؤسسة نماء الرقمية',
    email: 'procurement@namaa.sa',
    phone: '058-445-3188',
    city: 'مكة',
    segment: 'business',
    status: 'active',
    risk: 'medium',
    totalOrders: 74,
    totalSpent: 28810,
    averageBasket: 389,
    lifetimeValue: 33420,
    refundsCount: 2,
    disputesCount: 1,
    activeDays30: 14,
    lastOrderAt: 'اليوم 11:50 ص',
    lastOrderValue: 890,
    joinedAt: 'ديسمبر 2023',
    loyaltyScore: 91,
    preferredChannel: 'لوحة الأعمال',
    watchFlags: [],
    notes: 'عميل أعمال منتظم مع متوسط سلة ثابت.'
  },
  {
    id: 'CUS-44018',
    name: 'فهد القحطاني',
    email: 'fahad.qht@zadana.sa',
    phone: '057-991-0032',
    city: 'الطائف',
    segment: 'dormant',
    status: 'dormant',
    risk: 'high',
    totalOrders: 14,
    totalSpent: 4120,
    averageBasket: 294,
    lifetimeValue: 4480,
    refundsCount: 3,
    disputesCount: 2,
    activeDays30: 0,
    lastOrderAt: 'قبل 47 يومًا',
    lastOrderValue: 180,
    joinedAt: 'يونيو 2024',
    loyaltyScore: 41,
    preferredChannel: 'التطبيق',
    watchFlags: ['CUSTOMERS.SUPPORT.DORMANT_ACCOUNT'],
    notes: 'خامل حاليًا مع تاريخ دعم متوسط ويحتاج مراجعة قبل إعادة التنشيط.'
  },
  {
    id: 'CUS-44019',
    name: 'هند الدوسري',
    email: 'hind.dosari@mail.sa',
    phone: '051-664-1028',
    city: 'المدينة',
    segment: 'watchlist',
    status: 'low_activity',
    risk: 'high',
    totalOrders: 22,
    totalSpent: 6940,
    averageBasket: 315,
    lifetimeValue: 7420,
    refundsCount: 4,
    disputesCount: 2,
    activeDays30: 1,
    lastOrderAt: 'قبل 12 يومًا',
    lastOrderValue: 265,
    joinedAt: 'نوفمبر 2024',
    loyaltyScore: 53,
    preferredChannel: 'الويب',
    watchFlags: ['CUSTOMERS.SUPPORT.HIGH_REFUND'],
    notes: 'نشاط منخفض ومعدل استرجاع أعلى من المتوسط.'
  },
  {
    id: 'CUS-44020',
    name: 'تركي الشهري',
    email: 'turki@zadana.sa',
    phone: '059-774-9008',
    city: 'أبها',
    segment: 'new',
    status: 'active',
    risk: 'low',
    totalOrders: 4,
    totalSpent: 640,
    averageBasket: 160,
    lifetimeValue: 710,
    refundsCount: 0,
    disputesCount: 0,
    activeDays30: 4,
    lastOrderAt: 'أمس 04:12 م',
    lastOrderValue: 120,
    joinedAt: 'مارس 2026',
    loyaltyScore: 68,
    preferredChannel: 'التطبيق',
    watchFlags: [],
    notes: 'عميل جديد واعد مع رحلة شراء نظيفة حتى الآن.'
  },
  {
    id: 'CUS-44021',
    name: 'لمياء الخالدي',
    email: 'lamya.k@zadana.sa',
    phone: '050-455-2110',
    city: 'الرياض',
    segment: 'vip',
    status: 'active',
    risk: 'low',
    totalOrders: 57,
    totalSpent: 22110,
    averageBasket: 388,
    lifetimeValue: 24900,
    refundsCount: 1,
    disputesCount: 0,
    activeDays30: 16,
    lastOrderAt: 'اليوم 03:05 م',
    lastOrderValue: 740,
    joinedAt: 'أكتوبر 2023',
    loyaltyScore: 96,
    preferredChannel: 'التطبيق',
    watchFlags: ['CUSTOMERS.SUPPORT.VIP_PRIORITY'],
    notes: 'من أكثر العملاء استقرارًا وارتباطًا بالمنصة.'
  },
  {
    id: 'CUS-44022',
    name: 'شركة وادي الإمداد',
    email: 'supply@wadi.sa',
    phone: '053-771-8819',
    city: 'جدة',
    segment: 'business',
    status: 'restricted',
    risk: 'high',
    totalOrders: 28,
    totalSpent: 12380,
    averageBasket: 442,
    lifetimeValue: 13920,
    refundsCount: 4,
    disputesCount: 3,
    activeDays30: 6,
    lastOrderAt: 'قبل 5 أيام',
    lastOrderValue: 960,
    joinedAt: 'أبريل 2024',
    loyaltyScore: 63,
    preferredChannel: 'لوحة الأعمال',
    watchFlags: ['CUSTOMERS.SUPPORT.COMPLIANCE_REVIEW'],
    notes: 'الحساب يحتاج مراجعة تشغيلية قبل استعادة الصلاحيات الكاملة.'
  },
  {
    id: 'CUS-44023',
    name: 'ريم الزهراني',
    email: 'reem.z@zadana.sa',
    phone: '055-807-6671',
    city: 'الدمام',
    segment: 'dormant',
    status: 'dormant',
    risk: 'medium',
    totalOrders: 11,
    totalSpent: 2140,
    averageBasket: 194,
    lifetimeValue: 2390,
    refundsCount: 1,
    disputesCount: 0,
    activeDays30: 0,
    lastOrderAt: 'قبل 39 يومًا',
    lastOrderValue: 95,
    joinedAt: 'يناير 2025',
    loyaltyScore: 46,
    preferredChannel: 'الويب',
    watchFlags: ['CUSTOMERS.SUPPORT.DORMANT_ACCOUNT'],
    notes: 'خمول واضح يحتاج تنشيط تسويقي أكثر من تدخل تشغيلي.'
  }
];

const RISK_SCORE_MAP: Record<CustomerRisk, number> = {
  low: 8,
  medium: 18,
  high: 42,
  critical: 67
};

const RISK_SUMMARY_MAP: Record<CustomerRisk, string> = {
  low: 'CUSTOMERS.DETAIL.RISK_LOW',
  medium: 'CUSTOMERS.DETAIL.RISK_MEDIUM',
  high: 'CUSTOMERS.DETAIL.RISK_HIGH',
  critical: 'CUSTOMERS.DETAIL.RISK_CRITICAL'
};

const LAST_SEEN_MAP: Record<CustomerStatus, string> = {
  active: 'اليوم، 10:45 ص',
  low_activity: 'قبل 6 أيام',
  restricted: 'قبل يومين',
  dormant: 'قبل 21 يومًا'
};

function buildRecentOrders(customer: CustomerRecord) {
  return [
    {
      id: `ORD-${customer.id.slice(-3)}81`,
      date: '2024/05/12',
      total: customer.lastOrderValue + 620,
      status: 'DELIVERED' as const
    },
    {
      id: `ORD-${customer.id.slice(-3)}52`,
      date: '2024/04/28',
      total: Math.max(180, Math.round(customer.averageBasket * 2)),
      status: 'DELIVERED' as const
    },
    {
      id: `ORD-${customer.id.slice(-3)}90`,
      date: '2024/04/15',
      total: Math.max(220, Math.round(customer.averageBasket * 3)),
      status: customer.refundsCount > 1 ? 'REFUNDED' as const : 'PROCESSING' as const
    }
  ];
}

function buildNotes(customer: CustomerRecord) {
  return [
    {
      author: 'سارة أحمد',
      role: 'مدير حسابات',
      createdAt: '2024/05/01 09:15 AM',
      message: customer.notes
    }
  ];
}

function buildDetailRecord(customer: CustomerRecord): CustomerDetailRecord {
  return {
    ...customer,
    registrationDate: customer.id === 'CUS-44012' ? '2023/10/24' : '2024/01/18',
    riskScore: RISK_SCORE_MAP[customer.risk],
    riskSummary: RISK_SUMMARY_MAP[customer.risk],
    lastSeenAt: LAST_SEEN_MAP[customer.status],
    preferredLanguageLabel: 'العربية',
    isVerified: customer.status !== 'restricted',
    suspiciousLoginAttempts: customer.risk === 'critical' ? '3 خلال آخر 30 يومًا' : 'لا يوجد',
    repeatedPaymentFailureRate: customer.risk === 'critical' ? '9%' : customer.risk === 'high' ? '4%' : '2%',
    complaintRateLabel: customer.disputesCount > 2 ? 'مرتفعة' : customer.disputesCount > 0 ? 'منخفضة' : 'منخفضة جداً',
    analysisSummary:
      customer.risk === 'critical'
        ? 'العميل يحتاج مراجعة مكثفة بسبب كثافة النزاعات والاسترجاعات في آخر دورة طلبات.'
        : customer.risk === 'high'
          ? 'هناك مؤشرات ضغط تشغيلي متوسطة إلى مرتفعة وتوصى المتابعة عند الطلبات القادمة.'
          : 'عميل منتظم بمتوسط سلة شراء جيد ولا يوجد تاريخ مالي مقلق في الدورة الأخيرة.',
    refundsClosedCount: Math.max(0, customer.refundsCount - 1),
    refundsInProgressCount: customer.refundsCount > 0 ? 1 : 0,
    refundsTotalAmount: Math.max(customer.lastOrderValue, customer.refundsCount * customer.averageBasket),
    complaintsSolvedCount: customer.disputesCount > 0 ? Math.max(1, customer.disputesCount - 1) : 0,
    lastSupportContact: customer.disputesCount > 0 ? 'منذ أسبوعين' : 'لا يوجد تواصل حديث',
    accountTeam: customer.segment === 'business' ? 'Enterprise Success Team' : 'Customer Success Team',
    accountManager: customer.segment === 'business' ? 'محمد جابر' : 'سارة أحمد',
    recentOrders: buildRecentOrders(customer),
    internalNotes: buildNotes(customer)
  };
}

export const CUSTOMER_DETAIL_RECORDS: CustomerDetailRecord[] = CUSTOMER_RECORDS.map(buildDetailRecord);

export function getCustomerById(id: string | null): CustomerRecord | undefined {
  return CUSTOMER_RECORDS.find((customer) => customer.id === id);
}

export function getCustomerDetailById(id: string | null): CustomerDetailRecord | undefined {
  return CUSTOMER_DETAIL_RECORDS.find((customer) => customer.id === id);
}
