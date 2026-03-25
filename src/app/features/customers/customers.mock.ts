import { OrderDetail } from '../orders/orders.models';
import { createMockOrders } from '../orders/orders.mock';
import {
  CustomerAccountState,
  CustomerDetailRecord,
  CustomerEngagementState,
  CustomerInternalNote,
  CustomerLifecycleStage,
  CustomerPaymentState,
  CustomerRecord,
  CustomerReviewState,
  CustomerRisk,
  CustomerStatus,
  CustomerTrustState,
  CustomerWorkflowAction,
  CustomerWorkflowSummary
} from './customers.models';

const MOCK_ORDERS = createMockOrders();
const ORDER_LOOKUP = new Map<string, OrderDetail>(MOCK_ORDERS.map((order) => [order.id, order]));
const ORDER_IDS = MOCK_ORDERS.map((order) => order.id);

const LINKED_ORDER_IDS_BY_CUSTOMER: Record<string, string[]> = {
  'CUS-44012': ['ZD-94821', 'ZD-94820', 'ZD-94816'],
  'CUS-44013': ['ZD-94820', 'ZD-94821', 'ZD-94819'],
  'CUS-44014': ['ZD-94817', 'ZD-94818', 'ZD-94816'],
  'CUS-44015': ['ZD-94819', 'ZD-94821', 'ZD-94820'],
  'CUS-44016': ['ZD-94818', 'ZD-94821', 'ZD-94816'],
  'CUS-44017': ['ZD-94820', 'ZD-94818', 'ZD-94819'],
  'CUS-44018': ['ZD-94817', 'ZD-94816', 'ZD-94818'],
  'CUS-44019': ['ZD-94816', 'ZD-94817', 'ZD-94821'],
  'CUS-44020': ['ZD-94819', 'ZD-94820', 'ZD-94821'],
  'CUS-44021': ['ZD-94821', 'ZD-94818', 'ZD-94819'],
  'CUS-44022': ['ZD-94817', 'ZD-94820', 'ZD-94816'],
  'CUS-44023': ['ZD-94816', 'ZD-94819', 'ZD-94818']
};

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
    notes: 'عميل مرتفع القيمة مع استجابة سريعة للعروض الموسمية.',
    preferredLanguage: 'ar'
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
    notes: 'حساب أعمال مستقر مع نمط طلبات متكرر ومنخفض المخاطر.',
    preferredLanguage: 'ar'
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
    notes: 'الحساب تحت المتابعة بسبب نزاعات متكررة وارتفاع طلبات الاسترجاع.',
    preferredLanguage: 'ar'
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
    notes: 'عميلة جديدة بنشاط جيد في أول 30 يوم.',
    preferredLanguage: 'ar'
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
    notes: 'الإنفاق مرتفع لكن النشاط انخفض مؤخرًا ويحتاج حملة استبقاء.',
    preferredLanguage: 'ar'
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
    notes: 'عميل أعمال منتظم مع متوسط سلة ثابت.',
    preferredLanguage: 'ar'
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
    notes: 'خامل حاليًا مع تاريخ دعم متوسط ويحتاج مراجعة قبل إعادة التنشيط.',
    preferredLanguage: 'ar'
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
    notes: 'نشاط منخفض ومعدل استرجاع أعلى من المتوسط.',
    preferredLanguage: 'ar'
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
    notes: 'عميل جديد واعد مع رحلة شراء نظيفة حتى الآن.',
    preferredLanguage: 'ar'
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
    notes: 'من أكثر العملاء استقرارًا وارتباطًا بالمنصة.',
    preferredLanguage: 'ar'
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
    notes: 'الحساب يحتاج مراجعة تشغيلية قبل استعادة الصلاحيات الكاملة.',
    preferredLanguage: 'ar'
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
    notes: 'خمول واضح يحتاج تنشيط تسويقي أكثر من تدخل تشغيلي.',
    preferredLanguage: 'ar'
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

const REGISTRATION_DATE_MAP: Record<string, string> = {
  'CUS-44012': '2023/10/24',
  'CUS-44013': '2023/09/14',
  'CUS-44014': '2024/05/18',
  'CUS-44015': '2026/02/06',
  'CUS-44016': '2023/08/12',
  'CUS-44017': '2023/12/21',
  'CUS-44018': '2024/06/05',
  'CUS-44019': '2024/11/02',
  'CUS-44020': '2026/03/08',
  'CUS-44021': '2023/10/02',
  'CUS-44022': '2024/04/17',
  'CUS-44023': '2025/01/12'
};

const ACCOUNT_MANAGER_MAP: Record<CustomerRecord['segment'], string> = {
  vip: 'سارة أحمد',
  business: 'محمد جابر',
  new: 'فريق النمو',
  watchlist: 'مكتب الثقة والمخاطر',
  dormant: 'فريق الاستبقاء'
};

const OWNER_TEAM_LABEL_MAP: Record<CustomerWorkflowSummary['state'], string> = {
  healthy: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.SUCCESS',
  monitoring: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.MONITORING',
  retention: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.RETENTION',
  under_review: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.RISK',
  suspended: 'CUSTOMERS.DETAIL.WORKFLOW.OWNERS.RISK'
};

const QUEUE_LABEL_MAP: Record<CustomerWorkflowSummary['state'], string> = {
  healthy: 'CUSTOMERS.DETAIL.WORKFLOW.QUEUES.GROWTH',
  monitoring: 'CUSTOMERS.DETAIL.WORKFLOW.QUEUES.MONITORING',
  retention: 'CUSTOMERS.DETAIL.WORKFLOW.QUEUES.RETENTION',
  under_review: 'CUSTOMERS.DETAIL.WORKFLOW.QUEUES.TRUST_REVIEW',
  suspended: 'CUSTOMERS.DETAIL.WORKFLOW.QUEUES.SUSPENSION'
};

const WORKFLOW_SUMMARY_MAP: Record<CustomerWorkflowSummary['state'], string> = {
  healthy: 'CUSTOMERS.DETAIL.WORKFLOW.SUMMARY.HEALTHY',
  monitoring: 'CUSTOMERS.DETAIL.WORKFLOW.SUMMARY.MONITORING',
  retention: 'CUSTOMERS.DETAIL.WORKFLOW.SUMMARY.RETENTION',
  under_review: 'CUSTOMERS.DETAIL.WORKFLOW.SUMMARY.UNDER_REVIEW',
  suspended: 'CUSTOMERS.DETAIL.WORKFLOW.SUMMARY.SUSPENDED'
};

const WORKFLOW_NEXT_STEP_MAP: Record<CustomerWorkflowSummary['state'], string> = {
  healthy: 'CUSTOMERS.DETAIL.WORKFLOW.NEXT_STEP.HEALTHY',
  monitoring: 'CUSTOMERS.DETAIL.WORKFLOW.NEXT_STEP.MONITORING',
  retention: 'CUSTOMERS.DETAIL.WORKFLOW.NEXT_STEP.RETENTION',
  under_review: 'CUSTOMERS.DETAIL.WORKFLOW.NEXT_STEP.UNDER_REVIEW',
  suspended: 'CUSTOMERS.DETAIL.WORKFLOW.NEXT_STEP.SUSPENDED'
};

function emptyWorkflow(): CustomerWorkflowSummary {
  return {
    state: 'healthy',
    ownerTeamLabelKey: OWNER_TEAM_LABEL_MAP.healthy,
    queueLabelKey: QUEUE_LABEL_MAP.healthy,
    summaryKey: WORKFLOW_SUMMARY_MAP.healthy,
    nextStepKey: WORKFLOW_NEXT_STEP_MAP.healthy,
    blockers: [],
    alerts: [],
    actions: []
  };
}

function getInitialReviewState(customer: CustomerRecord): CustomerReviewState {
  if (customer.risk === 'critical') {
    return 'escalated';
  }

  if (
    customer.risk === 'high' ||
    customer.watchFlags.includes('CUSTOMERS.SUPPORT.COMPLIANCE_REVIEW') ||
    customer.refundsCount >= 4 ||
    customer.disputesCount >= 3
  ) {
    return 'flagged';
  }

  return 'none';
}

function getInitialAccountState(customer: CustomerRecord, reviewState: CustomerReviewState): CustomerAccountState {
  if (customer.status === 'dormant') {
    return 'dormant';
  }

  if (customer.status === 'restricted' && customer.risk === 'critical') {
    return 'suspended';
  }

  if (customer.status === 'restricted' || reviewState === 'escalated') {
    return 'under_review';
  }

  return 'active';
}

function getInitialTrustState(customer: CustomerRecord, accountState: CustomerAccountState, reviewState: CustomerReviewState): CustomerTrustState {
  if (accountState === 'suspended' || customer.risk === 'critical') {
    return 'blocked';
  }

  if (accountState === 'under_review' || reviewState !== 'none' || customer.risk === 'high') {
    return 'watch';
  }

  return 'clear';
}

function getInitialPaymentState(customer: CustomerRecord, accountState: CustomerAccountState): CustomerPaymentState {
  if (accountState === 'suspended' || (customer.refundsCount >= 5 && customer.disputesCount >= 3)) {
    return 'blocked';
  }

  if (customer.refundsCount >= 3 || customer.disputesCount >= 2 || customer.risk === 'high') {
    return 'monitoring';
  }

  return 'healthy';
}

function getInitialEngagementState(customer: CustomerRecord): CustomerEngagementState {
  if (customer.status === 'dormant' || customer.segment === 'dormant') {
    return 'dormant';
  }

  if (customer.segment === 'new') {
    return 'new';
  }

  if (customer.status === 'low_activity' || customer.activeDays30 <= 2) {
    return 'at_risk';
  }

  if (customer.loyaltyScore >= 90) {
    return 'loyal';
  }

  return 'growing';
}

function getDerivedStatus(customer: CustomerDetailRecord): CustomerStatus {
  if (customer.accountState === 'dormant' || customer.engagementState === 'dormant') {
    return 'dormant';
  }

  if (customer.accountState === 'suspended' || customer.accountState === 'under_review' || customer.accountState === 'restricted') {
    return 'restricted';
  }

  if (customer.engagementState === 'at_risk' || customer.activeDays30 <= 2) {
    return 'low_activity';
  }

  return 'active';
}

function getLastSeenLabel(status: CustomerStatus): string {
  const map: Record<CustomerStatus, string> = {
    active: 'اليوم، 10:45 ص',
    low_activity: 'قبل 6 أيام',
    restricted: 'قبل يومين',
    dormant: 'قبل 21 يومًا'
  };

  return map[status];
}

function getComplaintRateLabel(customer: CustomerDetailRecord): string {
  if (customer.disputesCount >= 3 || customer.refundsCount >= 4) {
    return 'مرتفعة';
  }

  if (customer.disputesCount > 0 || customer.refundsCount > 1) {
    return 'متوسطة';
  }

  return 'منخفضة جدًا';
}

function getAnalysisSummary(customer: CustomerDetailRecord): string {
  switch (customer.workflow.state) {
    case 'suspended':
      return 'الحساب موقوف مؤقتًا حتى إغلاق ملاحظات الثقة والمخاطر والتأكد من استقرار السجل المالي والدعمي.';
    case 'under_review':
      return 'العميل تحت مراجعة تشغيلية وثقة، ويجب التعامل بحذر مع الطلبات القادمة إلى حين إقفال الملاحظات المفتوحة.';
    case 'retention':
      return 'الإشارات الحالية لا تظهر خطرًا حادًا، لكن الهبوط في النشاط يستدعي تدخل استبقاء سريع قبل تحوّل الحساب إلى خامل.';
    case 'monitoring':
      return 'الملف قابل للتشغيل لكن يحتاج متابعة لصيقة لأن مؤشرات الاسترجاع أو الدعم ارتفعت في الدورة الأخيرة.';
    default:
      return 'عميل مستقر تشغيليًا مع مؤشرات صحة جيدة ويمكن الاكتفاء بالمراقبة الروتينية.';
  }
}

function getLastSupportContact(customer: CustomerDetailRecord): string {
  if (customer.disputesCount >= 3) {
    return 'منذ 3 أيام';
  }

  if (customer.disputesCount > 0 || customer.refundsCount > 1) {
    return 'منذ أسبوعين';
  }

  return 'لا يوجد تواصل حديث';
}

function getAccountTeam(customer: CustomerDetailRecord): string {
  switch (customer.workflow.state) {
    case 'suspended':
    case 'under_review':
      return 'Risk & Trust Ops';
    case 'retention':
      return 'Retention Team';
    case 'monitoring':
      return customer.segment === 'business' ? 'Enterprise Success Team' : 'Customer Health Desk';
    default:
      return customer.segment === 'business' ? 'Enterprise Success Team' : 'Customer Success Team';
  }
}

function getRefundsInProgressCount(customer: CustomerDetailRecord): number {
  if (customer.refundsCount === 0) {
    return 0;
  }

  return customer.paymentState === 'healthy' ? 0 : 1;
}

function getRefundsClosedCount(customer: CustomerDetailRecord): number {
  return Math.max(0, customer.refundsCount - getRefundsInProgressCount(customer));
}

function getRefundsTotalAmount(customer: CustomerDetailRecord): number {
  const refundedOrdersTotal = customer.recentOrders
    .filter((order) => order.status === 'REFUNDED')
    .reduce((sum, order) => sum + order.total, 0);

  return Math.max(refundedOrdersTotal, customer.refundsCount * customer.averageBasket);
}

function getComplaintsSolvedCount(customer: CustomerDetailRecord): number {
  if (customer.disputesCount === 0) {
    return 0;
  }

  return Math.max(0, customer.disputesCount - (customer.reviewState === 'none' ? 0 : 1));
}

function getSupportAlerts(customer: CustomerDetailRecord): string[] {
  const alerts: string[] = [];

  if (customer.engagementState === 'at_risk') {
    alerts.push('CUSTOMERS.DETAIL.WORKFLOW.ALERTS.ACTIVITY_DROP');
  }

  if (customer.paymentState === 'monitoring') {
    alerts.push('CUSTOMERS.DETAIL.WORKFLOW.ALERTS.PAYMENT_RETRIES');
  }

  if (customer.segment === 'new') {
    alerts.push('CUSTOMERS.DETAIL.WORKFLOW.ALERTS.NEW_CUSTOMER');
  }

  if (customer.watchFlags.includes('CUSTOMERS.SUPPORT.VIP_PRIORITY') && customer.status !== 'active') {
    alerts.push('CUSTOMERS.DETAIL.WORKFLOW.ALERTS.VIP_ATTENTION');
  }

  if (customer.disputesCount > 0) {
    alerts.push('CUSTOMERS.DETAIL.WORKFLOW.ALERTS.SUPPORT_PATTERN');
  }

  return alerts;
}

function getWorkflowBlockers(customer: CustomerDetailRecord): string[] {
  const blockers: string[] = [];

  if (customer.accountState === 'suspended') {
    blockers.push('CUSTOMERS.DETAIL.WORKFLOW.BLOCKERS.ACCOUNT_SUSPENDED');
  }

  if (customer.reviewState === 'escalated') {
    blockers.push('CUSTOMERS.DETAIL.WORKFLOW.BLOCKERS.ESCALATED_REVIEW');
  }

  if (customer.trustState === 'blocked') {
    blockers.push('CUSTOMERS.DETAIL.WORKFLOW.BLOCKERS.TRUST_BLOCK');
  }

  if (customer.paymentState === 'blocked') {
    blockers.push('CUSTOMERS.DETAIL.WORKFLOW.BLOCKERS.PAYMENT_BLOCK');
  }

  if (customer.status === 'restricted' && customer.accountState !== 'suspended') {
    blockers.push('CUSTOMERS.DETAIL.WORKFLOW.BLOCKERS.RESTRICTED_OPERATIONS');
  }

  return blockers;
}

function getWorkflowState(customer: CustomerDetailRecord): CustomerWorkflowSummary['state'] {
  if (customer.accountState === 'suspended') {
    return 'suspended';
  }

  if (
    customer.accountState === 'under_review' ||
    customer.reviewState === 'escalated' ||
    customer.trustState === 'blocked'
  ) {
    return 'under_review';
  }

  if (customer.engagementState === 'at_risk' || customer.engagementState === 'dormant' || customer.accountState === 'dormant') {
    return 'retention';
  }

  if (customer.reviewState === 'flagged' || customer.trustState === 'watch' || customer.paymentState === 'monitoring') {
    return 'monitoring';
  }

  return 'healthy';
}

function buildWorkflowActions(customer: CustomerDetailRecord): CustomerWorkflowAction[] {
  const actions: CustomerWorkflowAction[] = [
    {
      id: 'open_orders',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.OPEN_ORDERS.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.OPEN_ORDERS.HELPER',
      tone: 'neutral',
      icon: 'shopping_bag'
    },
    {
      id: 'open_support',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.OPEN_SUPPORT.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.OPEN_SUPPORT.HELPER',
      tone: 'primary',
      icon: 'support_agent'
    }
  ];

  if (customer.reviewState === 'none' && customer.accountState !== 'suspended') {
    actions.push({
      id: 'flag_review',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.FLAG_REVIEW.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.FLAG_REVIEW.HELPER',
      tone: 'warning',
      icon: 'flag'
    });
  }

  if (customer.reviewState === 'flagged') {
    actions.push({
      id: 'escalate_review',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.ESCALATE_REVIEW.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.ESCALATE_REVIEW.HELPER',
      tone: 'danger',
      icon: 'gpp_maybe'
    });
    actions.push({
      id: 'clear_review',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.CLEAR_REVIEW.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.CLEAR_REVIEW.HELPER',
      tone: 'success',
      icon: 'task_alt'
    });
  }

  if (customer.reviewState === 'escalated' && customer.accountState !== 'suspended') {
    actions.push({
      id: 'clear_review',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.CLEAR_REVIEW.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.CLEAR_REVIEW.HELPER',
      tone: 'success',
      icon: 'task_alt'
    });
  }

  if (customer.accountState === 'suspended') {
    actions.push({
      id: 'reactivate_account',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.REACTIVATE_ACCOUNT.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.REACTIVATE_ACCOUNT.HELPER',
      tone: 'success',
      icon: 'restart_alt'
    });
  } else if (customer.workflow.state === 'under_review' || customer.workflow.state === 'monitoring') {
    actions.push({
      id: 'suspend_account',
      labelKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.SUSPEND_ACCOUNT.LABEL',
      helperKey: 'CUSTOMERS.DETAIL.WORKFLOW.ACTIONS.SUSPEND_ACCOUNT.HELPER',
      tone: 'danger',
      icon: 'block'
    });
  }

  return actions;
}

function buildWorkflow(customer: CustomerDetailRecord): CustomerWorkflowSummary {
  const state = getWorkflowState(customer);

  customer.workflow = {
    state,
    ownerTeamLabelKey: OWNER_TEAM_LABEL_MAP[state],
    queueLabelKey: QUEUE_LABEL_MAP[state],
    summaryKey: WORKFLOW_SUMMARY_MAP[state],
    nextStepKey: WORKFLOW_NEXT_STEP_MAP[state],
    blockers: getWorkflowBlockers(customer),
    alerts: getSupportAlerts(customer),
    actions: []
  };
  customer.workflow.actions = buildWorkflowActions(customer);

  return customer.workflow;
}

function getLifecycleValueKey(
  group: CustomerLifecycleStage['id'],
  state: CustomerAccountState | CustomerTrustState | CustomerPaymentState | CustomerEngagementState
): string {
  return `CUSTOMERS.DETAIL.LIFECYCLE.${group.toUpperCase()}.VALUE.${state.toUpperCase()}`;
}

function getLifecycleHintKey(stage: CustomerLifecycleStage['id'], tone: CustomerLifecycleStage['tone']): string {
  return `CUSTOMERS.DETAIL.LIFECYCLE.${stage.toUpperCase()}.HINT.${tone.toUpperCase()}`;
}

function buildLifecycle(customer: CustomerDetailRecord): CustomerLifecycleStage[] {
  const accountTone: CustomerLifecycleStage['tone'] =
    customer.accountState === 'active'
      ? 'success'
      : customer.accountState === 'dormant'
        ? 'neutral'
        : customer.accountState === 'under_review'
          ? 'warning'
          : 'danger';

  const trustTone: CustomerLifecycleStage['tone'] =
    customer.trustState === 'clear' ? 'success' : customer.trustState === 'watch' ? 'warning' : 'danger';
  const paymentTone: CustomerLifecycleStage['tone'] =
    customer.paymentState === 'healthy' ? 'success' : customer.paymentState === 'monitoring' ? 'warning' : 'danger';
  const engagementTone: CustomerLifecycleStage['tone'] =
    customer.engagementState === 'loyal'
      ? 'success'
      : customer.engagementState === 'growing' || customer.engagementState === 'new'
        ? 'info'
        : customer.engagementState === 'at_risk'
          ? 'warning'
          : 'neutral';

  return [
    {
      id: 'account',
      labelKey: 'CUSTOMERS.DETAIL.LIFECYCLE.ACCOUNT.LABEL',
      valueKey: getLifecycleValueKey('account', customer.accountState),
      hintKey: getLifecycleHintKey('account', accountTone),
      tone: accountTone
    },
    {
      id: 'trust',
      labelKey: 'CUSTOMERS.DETAIL.LIFECYCLE.TRUST.LABEL',
      valueKey: getLifecycleValueKey('trust', customer.trustState),
      hintKey: getLifecycleHintKey('trust', trustTone),
      tone: trustTone
    },
    {
      id: 'payments',
      labelKey: 'CUSTOMERS.DETAIL.LIFECYCLE.PAYMENTS.LABEL',
      valueKey: getLifecycleValueKey('payments', customer.paymentState),
      hintKey: getLifecycleHintKey('payments', paymentTone),
      tone: paymentTone
    },
    {
      id: 'engagement',
      labelKey: 'CUSTOMERS.DETAIL.LIFECYCLE.ENGAGEMENT.LABEL',
      valueKey: getLifecycleValueKey('engagement', customer.engagementState),
      hintKey: getLifecycleHintKey('engagement', engagementTone),
      tone: engagementTone
    }
  ];
}

function mapOrderStatus(order: OrderDetail): 'DELIVERED' | 'REFUNDED' | 'PROCESSING' {
  if (
    order.status === 'CANCELLED' ||
    order.paymentStatus === 'REFUNDED' ||
    order.paymentStatus === 'PARTIALLY_REFUNDED'
  ) {
    return 'REFUNDED';
  }

  if (order.status === 'DELIVERED' || order.status === 'COMPLETED') {
    return 'DELIVERED';
  }

  return 'PROCESSING';
}

function getFallbackOrderIds(customerId: string): string[] {
  const seed = Number(customerId.replace(/\D/g, '')) % ORDER_IDS.length;

  return [ORDER_IDS[seed], ORDER_IDS[(seed + 1) % ORDER_IDS.length], ORDER_IDS[(seed + 2) % ORDER_IDS.length]];
}

function buildRecentOrders(customer: CustomerDetailRecord) {
  const linkedOrderIds = LINKED_ORDER_IDS_BY_CUSTOMER[customer.id] ?? getFallbackOrderIds(customer.id);

  return linkedOrderIds
    .map((orderId) => ORDER_LOOKUP.get(orderId))
    .filter((order): order is OrderDetail => Boolean(order))
    .slice(0, 3)
    .map((order) => ({
      id: order.id,
      displayId: order.displayId,
      date: order.date,
      total: order.total,
      status: mapOrderStatus(order)
    }));
}

function buildNotes(customer: CustomerDetailRecord) {
  const notes: CustomerInternalNote[] = [
    {
      author: customer.accountManager,
      role: customer.accountTeam,
      createdAt: '2026/03/18 09:15 AM',
      message: customer.notes,
      tone: 'info' as const
    }
  ];

  if (customer.reviewState === 'flagged' || customer.reviewState === 'escalated') {
    notes.unshift({
      author: 'مكتب الثقة والمخاطر',
      role: 'Risk & Trust Ops',
      createdAt: '2026/03/22 11:40 AM',
      message: 'تم رصد إشارات تستدعي مراقبة إضافية على الطلبات القادمة ومراجعة الاسترجاعات الأخيرة.',
      tone: customer.reviewState === 'escalated' ? 'danger' as const : 'warning' as const,
      isSystem: true
    });
  }

  if (customer.engagementState === 'at_risk' || customer.engagementState === 'dormant') {
    notes.unshift({
      author: 'فريق الاستبقاء',
      role: 'Retention Team',
      createdAt: '2026/03/20 03:10 PM',
      message: 'النشاط هبط عن المستوى الطبيعي ويُنصح بخطوة استبقاء قبل فقدان العميل نهائيًا.',
      tone: 'warning',
      isSystem: true
    });
  }

  return notes;
}

function buildDetailRecord(customer: CustomerRecord): CustomerDetailRecord {
  const reviewState = getInitialReviewState(customer);
  const accountState = getInitialAccountState(customer, reviewState);
  const trustState = getInitialTrustState(customer, accountState, reviewState);
  const paymentState = getInitialPaymentState(customer, accountState);
  const engagementState = getInitialEngagementState(customer);

  const detail: CustomerDetailRecord = {
    ...customer,
    registrationDate: REGISTRATION_DATE_MAP[customer.id] ?? '2024/01/18',
    riskScore: RISK_SCORE_MAP[customer.risk],
    riskSummary: RISK_SUMMARY_MAP[customer.risk],
    lastSeenAt: '',
    preferredLanguageLabel: customer.preferredLanguage === 'en' ? 'English' : 'العربية',
    isVerified: true,
    suspiciousLoginAttempts: '',
    repeatedPaymentFailureRate: '',
    complaintRateLabel: '',
    analysisSummary: '',
    refundsClosedCount: 0,
    refundsInProgressCount: 0,
    refundsTotalAmount: 0,
    complaintsSolvedCount: 0,
    lastSupportContact: '',
    accountTeam: '',
    accountManager: ACCOUNT_MANAGER_MAP[customer.segment],
    accountState,
    trustState,
    paymentState,
    engagementState,
    reviewState,
    workflow: emptyWorkflow(),
    lifecycle: [],
    recentOrders: [],
    internalNotes: []
  };

  refreshCustomerDetailRecord(detail);
  detail.internalNotes = buildNotes(detail);

  return detail;
}

export function refreshCustomerDetailRecord(customer: CustomerDetailRecord): CustomerDetailRecord {
  customer.status = getDerivedStatus(customer);
  customer.riskScore = RISK_SCORE_MAP[customer.risk];
  customer.riskSummary = RISK_SUMMARY_MAP[customer.risk];
  customer.lastSeenAt = getLastSeenLabel(customer.status);
  customer.isVerified = customer.accountState !== 'suspended' && customer.trustState !== 'blocked';
  customer.suspiciousLoginAttempts =
    customer.trustState === 'blocked'
      ? '5 خلال آخر 30 يومًا'
      : customer.trustState === 'watch'
        ? '2 خلال آخر 30 يومًا'
        : 'لا يوجد';
  customer.repeatedPaymentFailureRate =
    customer.paymentState === 'blocked' ? '9%' : customer.paymentState === 'monitoring' ? '4%' : '2%';
  customer.recentOrders = buildRecentOrders(customer);
  customer.workflow = buildWorkflow(customer);
  customer.lifecycle = buildLifecycle(customer);
  customer.complaintRateLabel = getComplaintRateLabel(customer);
  customer.analysisSummary = getAnalysisSummary(customer);
  customer.refundsInProgressCount = getRefundsInProgressCount(customer);
  customer.refundsClosedCount = getRefundsClosedCount(customer);
  customer.refundsTotalAmount = getRefundsTotalAmount(customer);
  customer.complaintsSolvedCount = getComplaintsSolvedCount(customer);
  customer.lastSupportContact = getLastSupportContact(customer);
  customer.accountTeam = getAccountTeam(customer);
  customer.accountManager = ACCOUNT_MANAGER_MAP[customer.segment];

  return customer;
}

export function createCustomerDetailRecords(): CustomerDetailRecord[] {
  return CUSTOMER_RECORDS.map(buildDetailRecord);
}

export const CUSTOMER_DETAIL_RECORDS: CustomerDetailRecord[] = createCustomerDetailRecords();

export function getCustomerById(id: string | null): CustomerRecord | undefined {
  return CUSTOMER_RECORDS.find((customer) => customer.id === id);
}

export function getCustomerDetailById(id: string | null): CustomerDetailRecord | undefined {
  return CUSTOMER_DETAIL_RECORDS.find((customer) => customer.id === id);
}
