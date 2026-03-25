import {
  DriverCandidate,
  OrderActivity,
  OrderCancellationSummary,
  OrderDetail,
  OrderFulfillmentStatus,
  OrderOperationalCaseStatus,
  OrderOperationalCaseType,
  OrderPaymentStatus,
  OrderResolutionState,
  OrderStatus,
  OrderWorkflowStage,
  OrderTimelineItem
} from './orders.models';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const DEFAULT_DRIVER_CANDIDATES: DriverCandidate[] = [
  {
    id: 'driver-1',
    name: 'أحمد منصور',
    code: '#DRV-7721',
    phone: '050-111-2211',
    city: 'الرياض',
    area: 'العليا',
    status: 'AVAILABLE',
    distanceKm: 1.2,
    activeOrders: 0,
    rating: 4.8,
    rejectionRate: 2,
    lastActivity: 'الآن',
    initials: 'أم',
    avatarTone: 'from-teal-500 to-cyan-500',
    verified: true
  },
  {
    id: 'driver-2',
    name: 'خالد العتيبي',
    code: '#DRV-8842',
    phone: '050-111-2299',
    city: 'الرياض',
    area: 'الياسمين',
    status: 'DELIVERING',
    distanceKm: 3.5,
    activeOrders: 2,
    rating: 4.5,
    rejectionRate: 5,
    lastActivity: 'قبل 10 دقائق',
    initials: 'خع',
    avatarTone: 'from-amber-500 to-orange-500',
    verified: true
  },
  {
    id: 'driver-3',
    name: 'فهد سليمان',
    code: '#DRV-1109',
    phone: '050-111-3322',
    city: 'الرياض',
    area: 'الملقا',
    status: 'AVAILABLE',
    distanceKm: 0.8,
    activeOrders: 1,
    rating: 3.2,
    rejectionRate: 15,
    lastActivity: 'الآن',
    initials: 'فس',
    avatarTone: 'from-rose-500 to-pink-500',
    lowPerformance: true,
    verified: true
  }
];

type SeedOrder = Omit<OrderDetail, 'timeline' | 'activities' | 'driverCandidates' | 'workflowStage' | 'nextActionLabel' | 'resolutionState'> & {
  createdChannel: string;
  paymentGatewayLabel: string;
  timelinePrepLabel: string;
  timelineFulfillmentLabel: string;
  cancellationSummary: OrderCancellationSummary | null;
};

function deriveWorkflowStage(
  order: Pick<OrderDetail, 'status' | 'paymentStatus' | 'fulfillmentStatus' | 'hasActiveIssue' | 'cancellationSummary' | 'operationalCase'>
): OrderWorkflowStage {
  if (order.operationalCase && order.operationalCase.status !== 'CLOSED') {
    switch (order.operationalCase.type) {
      case 'REFUND':
        return 'REFUND_REVIEW';
      case 'DISPUTE':
      case 'ISSUE':
        return 'ISSUE_REVIEW';
    }
  }

  if (order.operationalCase?.status === 'CLOSED') {
    if (order.status === 'COMPLETED') {
      return 'CLOSED';
    }

    if (order.status === 'CANCELLED') {
      return 'CANCELLED';
    }
  }

  if (order.status === 'COMPLETED') {
    return 'CLOSED';
  }

  if (order.status === 'CANCELLED') {
    return order.paymentStatus === 'REFUNDED' || order.paymentStatus === 'PARTIALLY_REFUNDED' ? 'REFUND_REVIEW' : 'CANCELLED';
  }

  if (order.paymentStatus === 'FAILED' || order.paymentStatus === 'PENDING' || order.paymentStatus === 'COD_PENDING') {
    return 'PAYMENT_REVIEW';
  }

  if (order.paymentStatus === 'REFUNDED' || order.paymentStatus === 'PARTIALLY_REFUNDED') {
    return 'REFUND_REVIEW';
  }

  if (order.fulfillmentStatus === 'FAILED') {
    return 'ISSUE_REVIEW';
  }

  if (order.hasActiveIssue) {
    return 'ISSUE_REVIEW';
  }

  if (order.fulfillmentStatus === 'QUEUED' || order.fulfillmentStatus === 'PREPARING' || order.fulfillmentStatus === 'READY_FOR_PICKUP') {
    return 'PREPARATION';
  }

  if (order.fulfillmentStatus === 'DRIVER_ASSIGNED' || order.fulfillmentStatus === 'PICKED_UP' || order.fulfillmentStatus === 'ON_ROUTE') {
    return 'DISPATCH';
  }

  if (order.status === 'DELIVERED' || order.fulfillmentStatus === 'DELIVERED') {
    return 'READY_TO_CLOSE';
  }

  return 'PREPARATION';
}

function deriveResolutionState(
  order: Pick<OrderDetail, 'status' | 'isLate' | 'hasActiveIssue' | 'paymentStatus' | 'fulfillmentStatus' | 'operationalCase'>
): OrderResolutionState {
  if (order.operationalCase?.status === 'OPEN') {
    return 'ACTION_REQUIRED';
  }

  if (order.operationalCase?.status === 'RESOLVED') {
    return 'MONITORING';
  }

  if (order.status === 'COMPLETED') {
    return 'RESOLVED';
  }

  if (order.status === 'CANCELLED' && !order.hasActiveIssue) {
    return 'RESOLVED';
  }

  if (
    order.hasActiveIssue
    || order.isLate
    || order.paymentStatus === 'FAILED'
    || order.paymentStatus === 'PENDING'
    || order.paymentStatus === 'COD_PENDING'
    || order.fulfillmentStatus === 'FAILED'
  ) {
    return 'ACTION_REQUIRED';
  }

  return 'MONITORING';
}

function deriveNextAction(
  order: Pick<OrderDetail, 'status' | 'paymentStatus' | 'fulfillmentStatus' | 'hasActiveIssue' | 'cancellationSummary' | 'operationalCase'>
): string {
  if (order.operationalCase?.status === 'OPEN') {
    switch (order.operationalCase.type) {
      case 'REFUND':
        return 'ORDERS.WORKFLOW.NEXT_ACTIONS.REVIEW_REFUND';
      case 'DISPUTE':
        return 'ORDERS.WORKFLOW.NEXT_ACTIONS.REVIEW_DISPUTE';
      case 'ISSUE':
        return 'ORDERS.WORKFLOW.NEXT_ACTIONS.REVIEW_ISSUE';
    }
  }

  if (order.operationalCase?.status === 'RESOLVED') {
    return 'ORDERS.WORKFLOW.NEXT_ACTIONS.CLOSE_OPERATIONAL_CASE';
  }

  if (order.operationalCase?.status === 'CLOSED') {
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return 'ORDERS.WORKFLOW.NEXT_ACTIONS.NO_OPEN_ACTION';
    }
  }

  if (order.status === 'COMPLETED') {
    return 'ORDERS.WORKFLOW.NEXT_ACTIONS.NO_OPEN_ACTION';
  }

  if (order.status === 'CANCELLED') {
    return order.cancellationSummary?.refundType && order.cancellationSummary.refundType !== 'none'
      ? 'ORDERS.WORKFLOW.NEXT_ACTIONS.COMPLETE_REFUND_REVIEW'
      : 'ORDERS.WORKFLOW.NEXT_ACTIONS.DOCUMENT_CANCELLATION_CLOSURE';
  }

  if (order.paymentStatus === 'FAILED' || order.paymentStatus === 'PENDING') {
    return 'ORDERS.WORKFLOW.NEXT_ACTIONS.REVIEW_PAYMENT';
  }

  if (order.paymentStatus === 'COD_PENDING') {
    return order.status === 'DELIVERED' || order.fulfillmentStatus === 'DELIVERED'
      ? 'ORDERS.WORKFLOW.NEXT_ACTIONS.CONFIRM_COD_COLLECTION'
      : 'ORDERS.WORKFLOW.NEXT_ACTIONS.MONITOR_COD_DELIVERY';
  }

  if (order.paymentStatus === 'REFUNDED' || order.paymentStatus === 'PARTIALLY_REFUNDED') {
    return 'ORDERS.WORKFLOW.NEXT_ACTIONS.REVIEW_REFUND_AND_CLOSE';
  }

  if (order.fulfillmentStatus === 'FAILED') {
    return 'ORDERS.WORKFLOW.NEXT_ACTIONS.RETRY_OR_CANCEL';
  }

  if (order.hasActiveIssue) {
    return 'ORDERS.WORKFLOW.NEXT_ACTIONS.RESOLVE_OPEN_ISSUE';
  }

  if (order.fulfillmentStatus === 'QUEUED' || order.fulfillmentStatus === 'PREPARING') {
    return 'ORDERS.WORKFLOW.NEXT_ACTIONS.FOLLOW_PREPARATION';
  }

  if (order.fulfillmentStatus === 'READY_FOR_PICKUP') {
    return 'ORDERS.WORKFLOW.NEXT_ACTIONS.ASSIGN_OR_START_PICKUP';
  }

  if (order.fulfillmentStatus === 'DRIVER_ASSIGNED' || order.fulfillmentStatus === 'PICKED_UP' || order.fulfillmentStatus === 'ON_ROUTE') {
    return 'ORDERS.WORKFLOW.NEXT_ACTIONS.MONITOR_DELIVERY';
  }

  if (order.status === 'DELIVERED' || order.fulfillmentStatus === 'DELIVERED') {
    return 'ORDERS.WORKFLOW.NEXT_ACTIONS.CLOSE_AFTER_CONFIRMATION';
  }

  return 'ORDERS.WORKFLOW.NEXT_ACTIONS.REVIEW_CURRENT_STATE';
}

function buildOrderTimeline(order: SeedOrder | OrderDetail): OrderTimelineItem[] {
  const paymentStepState: OrderTimelineItem['status'] =
    order.paymentStatus === 'PAID' || order.paymentStatus === 'REFUNDED' || order.paymentStatus === 'PARTIALLY_REFUNDED' || order.paymentStatus === 'SETTLED'
      ? 'COMPLETED'
      : order.paymentStatus === 'FAILED'
        ? 'IN_PROGRESS'
        : 'PENDING';

  const prepStepState: OrderTimelineItem['status'] =
    order.fulfillmentStatus === 'PREPARING' || order.fulfillmentStatus === 'READY_FOR_PICKUP' || order.fulfillmentStatus === 'DRIVER_ASSIGNED' || order.fulfillmentStatus === 'PICKED_UP' || order.fulfillmentStatus === 'ON_ROUTE' || order.fulfillmentStatus === 'DELIVERED'
      ? 'COMPLETED'
      : order.status === 'IN_PROGRESS'
        ? 'IN_PROGRESS'
        : 'PENDING';

  const fulfillmentStepState: OrderTimelineItem['status'] =
    order.fulfillmentStatus === 'DELIVERED'
      ? 'COMPLETED'
      : order.fulfillmentStatus === 'ON_ROUTE' || order.fulfillmentStatus === 'DRIVER_ASSIGNED' || order.fulfillmentStatus === 'PICKED_UP'
        ? 'IN_PROGRESS'
        : order.status === 'CANCELLED'
          ? 'PENDING'
          : 'PENDING';

  const resolutionStepState: OrderTimelineItem['status'] =
    order.status === 'COMPLETED' || order.status === 'DELIVERED'
      ? 'COMPLETED'
      : order.status === 'CANCELLED'
        ? 'IN_PROGRESS'
        : 'PENDING';

  return [
    {
      title: 'تم إنشاء الطلب',
      subtitle: 'تطبيق العميل',
      time: order.time,
      status: 'COMPLETED',
      current: false
    },
    {
      title: 'تحديث الدفع',
      subtitle: 'بوابة الدفع / التسوية',
      time: order.paymentStatus === 'PENDING' ? '--:--' : '09:16 ص',
      status: paymentStepState,
      current: paymentStepState === 'IN_PROGRESS'
    },
    {
      title: 'تجهيز الطلب',
      subtitle: (order as SeedOrder).timelinePrepLabel || 'المتجر',
      time: prepStepState === 'PENDING' ? '--:--' : '10:05 ص',
      status: prepStepState,
      current: prepStepState === 'IN_PROGRESS'
    },
    {
      title: 'التنفيذ والتسليم',
      subtitle: (order as SeedOrder).timelineFulfillmentLabel || 'التوصيل',
      time: fulfillmentStepState === 'PENDING' ? '--:--' : '10:20 ص',
      status: fulfillmentStepState,
      current: fulfillmentStepState === 'IN_PROGRESS'
    },
    {
      title: order.status === 'CANCELLED' ? 'إغلاق الطلب كملغى' : 'إغلاق الطلب',
      subtitle: order.status === 'CANCELLED' ? 'تم توثيق سبب الإلغاء' : 'بانتظار الإتمام النهائي',
      time: resolutionStepState === 'PENDING' ? '--:--' : order.lastUpdatedAt,
      status: resolutionStepState,
      current: resolutionStepState === 'IN_PROGRESS'
    }
  ];
}

function buildInitialActivities(order: SeedOrder | OrderDetail): OrderActivity[] {
  const activities: OrderActivity[] = [
    {
      title: `حالة الطلب الآن: ${getOrderStatusLabel(order.status)}`,
      actor: 'النظام',
      time: order.lastUpdatedAt,
      tone: 'status'
    }
  ];

  if (order.paymentStatus !== 'PENDING') {
    activities.push({
      title: `حالة الدفع: ${getPaymentStatusLabel(order.paymentStatus)}`,
      actor: (order as SeedOrder).paymentGatewayLabel || 'بوابة الدفع',
      time: '09:16 ص',
      tone: 'payment'
    });
  }

  if (order.cancellationSummary) {
    activities.unshift({
      title: `تم إلغاء الطلب بسبب: ${order.cancellationSummary.reasonLabel}`,
      actor: order.cancellationSummary.cancelledBy,
      time: order.cancellationSummary.cancelledAt,
      tone: 'issue'
    });
  }

  if (order.hasActiveIssue) {
    activities.unshift({
      title: 'يوجد تنبيه تشغيلي مفتوح على الطلب',
      actor: 'مركز العمليات',
      time: order.lastUpdatedAt,
      tone: 'issue'
    });
  }

  if (order.operationalCase) {
    activities.unshift({
      title: `${getOperationalCaseStatusActionLabel(order.operationalCase.status)} ${getOperationalCaseTypeLabel(order.operationalCase.type)}: ${order.operationalCase.title}`,
      actor: order.operationalCase.queueLabel,
      time: order.operationalCase.lastUpdatedAt,
      tone: 'issue'
    });
  }

  return activities;
}

function createOrder(seed: SeedOrder): OrderDetail {
  const order: OrderDetail = {
    ...seed,
    workflowStage: deriveWorkflowStage(seed),
    nextActionLabel: deriveNextAction(seed),
    resolutionState: deriveResolutionState(seed),
    timeline: [],
    activities: [],
    driverCandidates: clone(DEFAULT_DRIVER_CANDIDATES)
  };

  order.timeline = buildOrderTimeline(seed);
  order.activities = buildInitialActivities(seed);
  return order;
}

function createOrderItem(name: string, brand: string, quantity: string, price: number, icon: string, sku: string) {
  return {
    name,
    brand,
    quantity,
    price,
    total: price,
    icon,
    sku
  };
}

function buildSeedOrders(): OrderDetail[] {
  return [
    createOrder({
      id: 'ZD-94821',
      displayId: '#ZD-94821',
      customerName: 'سارة علي حسن',
      customerPhone: '055-123-9988',
      customerEmail: 'sara.a@example.com',
      customerAddress: 'شارع الثمامة، حي العليا، الرياض',
      merchantName: 'لولو هايبر ماركت',
      merchantBranch: 'الياسمين',
      merchantLocation: 'الرياض، حي الياسمين',
      driverName: 'سامي بن خالد',
      driverPhone: '0500-000-001',
      driverVehicleLabel: 'سيارة سيدان',
      driverPlateNumber: 'ر س ب 2145',
      city: 'الرياض',
      district: 'العليا',
      slaScore: 96,
      date: '25 مارس 2026',
      time: '09:00 ص',
      status: 'OUT_FOR_DELIVERY',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'ON_ROUTE',
      paymentMethodLabel: 'مدى',
      lastUpdatedAt: '10:20 ص',
      total: 480,
      subtotal: 404.35,
      deliveryFee: 15,
      tax: 60.65,
      isLate: false,
      hasActiveIssue: false,
      cancellationReason: null,
      operationalCase: null,
      expectedDeliveryWindow: '10:45 ص - 11:05 ص',
      transactionRef: '#TRX-8271039',
      paymentStatusNote: 'الدفع مؤكد ولا توجد محاولة فاشلة مفتوحة.',
      fulfillmentStatusNote: 'السائق في الطريق إلى العميل الآن.',
      supportSummary: 'لا توجد تذاكر دعم مفتوحة على الطلب.',
      alertLabel: 'لا توجد تنبيهات حرجة',
      items: [
        createOrderItem('حليب طازج كامل الدسم', 'المراعي', '2 لتر', 24, 'local_drink', 'SKU-782910'),
        createOrderItem('بيض عضوي فاخر', 'مزارع الرياض', 'طبق 30 حبة', 45, 'egg_alt', 'SKU-992817'),
        createOrderItem('قهوة اسبريسو مطحونة', 'بارنيز', '250 جرام', 38, 'coffee', 'SKU-102933')
      ],
      createdChannel: 'تطبيق العميل',
      paymentGatewayLabel: 'بوابة مدى',
      timelinePrepLabel: 'المتجر',
      timelineFulfillmentLabel: 'السائق سامي بن خالد',
      cancellationSummary: null
    }),
    createOrder({
      id: 'ZD-94820',
      displayId: '#ZD-94820',
      customerName: 'محمد جاسم',
      customerPhone: '050-998-1120',
      customerEmail: 'm.jasim@example.com',
      customerAddress: 'طريق الملك فهد، حي النخيل، الرياض',
      merchantName: 'بنده',
      merchantBranch: 'النخيل',
      merchantLocation: 'الرياض، حي النخيل',
      driverName: '--',
      driverPhone: '--',
      driverVehicleLabel: '--',
      driverPlateNumber: '--',
      city: 'الرياض',
      district: 'النخيل',
      slaScore: 82,
      date: '25 مارس 2026',
      time: '08:40 ص',
      status: 'IN_PROGRESS',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'PREPARING',
      paymentMethodLabel: 'فيزا',
      lastUpdatedAt: '10:11 ص',
      total: 220.5,
      subtotal: 190,
      deliveryFee: 14,
      tax: 16.5,
      isLate: true,
      hasActiveIssue: true,
      cancellationReason: null,
      operationalCase: {
        type: 'ISSUE',
        status: 'OPEN',
        title: 'تأخير تجهيز الطلب',
        queueLabel: 'العمليات',
        openedAt: '10:11 ص',
        lastUpdatedAt: '10:11 ص'
      },
      expectedDeliveryWindow: '09:30 ص - 10:00 ص',
      transactionRef: '#TRX-8271040',
      paymentStatusNote: 'الدفع ناجح لكن الطلب متأخر عن الـ SLA.',
      fulfillmentStatusNote: 'المتجر ما زال في مرحلة التجهيز.',
      supportSummary: 'يوجد تنبيه تأخير مفتوح على الطلب.',
      alertLabel: 'تأخير تجهيز',
      items: [
        createOrderItem('مياه معدنية', 'هنا', 'كرتون', 18, 'water_full', 'SKU-118820'),
        createOrderItem('زيت زيتون', 'الجوف', '750 مل', 44, 'nutrition', 'SKU-552102')
      ],
      createdChannel: 'الويب',
      paymentGatewayLabel: 'فيزا',
      timelinePrepLabel: 'المتجر - بنده',
      timelineFulfillmentLabel: 'بانتظار إسناد سائق',
      cancellationSummary: null
    }),
    createOrder({
      id: 'ZD-94819',
      displayId: '#ZD-94819',
      customerName: 'نوف الخليج',
      customerPhone: '054-554-2210',
      customerEmail: 'nouf@example.com',
      customerAddress: 'حي الروضة، جدة',
      merchantName: 'العثيم',
      merchantBranch: 'الروضة',
      merchantLocation: 'جدة، حي الروضة',
      driverName: '--',
      driverPhone: '--',
      driverVehicleLabel: '--',
      driverPlateNumber: '--',
      city: 'جدة',
      district: 'الروضة',
      slaScore: 71,
      date: '25 مارس 2026',
      time: '08:55 ص',
      status: 'PENDING',
      paymentStatus: 'FAILED',
      fulfillmentStatus: 'QUEUED',
      paymentMethodLabel: 'آبل باي',
      lastUpdatedAt: '09:10 ص',
      total: 85,
      subtotal: 72,
      deliveryFee: 8,
      tax: 5,
      isLate: false,
      hasActiveIssue: true,
      cancellationReason: null,
      operationalCase: {
        type: 'ISSUE',
        status: 'OPEN',
        title: 'مراجعة فشل الدفع',
        queueLabel: 'المالية',
        openedAt: '09:10 ص',
        lastUpdatedAt: '09:10 ص'
      },
      expectedDeliveryWindow: 'بانتظار معالجة الدفع',
      transactionRef: '#TRX-8271041',
      paymentStatusNote: 'آخر محاولة دفع فشلت وتحتاج مراجعة Finance.',
      fulfillmentStatusNote: 'لم يبدأ التنفيذ لأن الدفع غير مؤكد.',
      supportSummary: 'تم تحويل الحالة إلى Finance لمراجعة بوابة الدفع.',
      alertLabel: 'مشكلة دفع',
      items: [
        createOrderItem('عصير برتقال', 'المراعي', '1 لتر', 11, 'nutrition', 'SKU-410011'),
        createOrderItem('خبز توست', 'لورباك', 'عبوة', 9, 'bakery_dining', 'SKU-410022')
      ],
      createdChannel: 'تطبيق العميل',
      paymentGatewayLabel: 'آبل باي',
      timelinePrepLabel: 'المتجر',
      timelineFulfillmentLabel: 'لم يبدأ التنفيذ',
      cancellationSummary: null
    }),
    createOrder({
      id: 'ZD-94818',
      displayId: '#ZD-94818',
      customerName: 'أحمد فهد',
      customerPhone: '056-222-4411',
      customerEmail: 'ahmad.f@example.com',
      customerAddress: 'حي الصحافة، الرياض',
      merchantName: 'كارفور',
      merchantBranch: 'الصحافة',
      merchantLocation: 'الرياض، حي الصحافة',
      driverName: '--',
      driverPhone: '--',
      driverVehicleLabel: '--',
      driverPlateNumber: '--',
      city: 'الرياض',
      district: 'الصحافة',
      slaScore: 0,
      date: '24 مارس 2026',
      time: '07:55 م',
      status: 'CANCELLED',
      paymentStatus: 'REFUNDED',
      fulfillmentStatus: 'CANCELLED',
      paymentMethodLabel: 'مدى',
      lastUpdatedAt: '08:21 م',
      total: 340,
      subtotal: 290,
      deliveryFee: 15,
      tax: 35,
      isLate: false,
      hasActiveIssue: false,
      cancellationReason: 'نفاد مخزون',
      operationalCase: {
        type: 'REFUND',
        status: 'RESOLVED',
        title: 'استرداد كامل بعد الإلغاء',
        queueLabel: 'المالية',
        openedAt: '08:21 م',
        lastUpdatedAt: '08:21 م'
      },
      expectedDeliveryWindow: 'أغلق الطلب',
      transactionRef: '#TRX-8271042',
      paymentStatusNote: 'تم تنفيذ refund كامل على نفس وسيلة الدفع.',
      fulfillmentStatusNote: 'التنفيذ متوقف بعد إلغاء الطلب.',
      supportSummary: 'تم توثيق الإلغاء وإبلاغ العميل.',
      alertLabel: 'ملغي مع استرداد كامل',
      items: [
        createOrderItem('لحوم طازجة', 'الوادي', '2 كجم', 110, 'lunch_dining', 'SKU-992222'),
        createOrderItem('فواكه موسمية', 'موسم', 'صندوق', 80, 'nutrition', 'SKU-992223')
      ],
      createdChannel: 'تطبيق العميل',
      paymentGatewayLabel: 'مدى',
      timelinePrepLabel: 'المتجر',
      timelineFulfillmentLabel: 'أوقف التنفيذ',
      cancellationSummary: {
        reasonLabel: 'نفاد مخزون',
        details: 'الفرع لم يتمكن من تجهيز بندين أساسيين في الطلب.',
        refundType: 'full',
        costBearer: 'merchant',
        cancelledAt: '08:21 م',
        cancelledBy: 'سارة المالي - Finance',
        customerMessage: 'تم إلغاء الطلب لعدم توفر المنتجات وسيعاد المبلغ بالكامل.'
      }
    }),
    createOrder({
      id: 'ZD-94817',
      displayId: '#ZD-94817',
      customerName: 'شركة الوادي',
      customerPhone: '059-333-8822',
      customerEmail: 'ops@wadi.example.com',
      customerAddress: 'حي حطين، الرياض',
      merchantName: 'دانوب',
      merchantBranch: 'حطين',
      merchantLocation: 'الرياض، حي حطين',
      driverName: 'راشد العتيبي',
      driverPhone: '0500-000-009',
      driverVehicleLabel: 'فان مبرد',
      driverPlateNumber: 'س ل د 9011',
      city: 'الرياض',
      district: 'حطين',
      slaScore: 100,
      date: '24 مارس 2026',
      time: '02:00 م',
      status: 'COMPLETED',
      paymentStatus: 'SETTLED',
      fulfillmentStatus: 'DELIVERED',
      paymentMethodLabel: 'تحويل بنكي',
      lastUpdatedAt: '03:08 م',
      total: 1250,
      subtotal: 1100,
      deliveryFee: 20,
      tax: 130,
      isLate: false,
      hasActiveIssue: false,
      cancellationReason: null,
      operationalCase: null,
      expectedDeliveryWindow: 'تم التسليم',
      transactionRef: '#TRX-8271043',
      paymentStatusNote: 'الدفعة settled بالكامل داخل التسوية.',
      fulfillmentStatusNote: 'تم التسليم وإغلاق المهمة بنجاح.',
      supportSummary: 'لا توجد تذاكر دعم على هذا الطلب.',
      alertLabel: 'مغلق بنجاح',
      items: [
        createOrderItem('مياه شرب', 'أكوافينا', '24 عبوة', 72, 'water_full', 'SKU-881201'),
        createOrderItem('مناديل ورقية', 'فاين', 'كرتون', 94, 'inventory_2', 'SKU-881202')
      ],
      createdChannel: 'الويب',
      paymentGatewayLabel: 'تحويل بنكي',
      timelinePrepLabel: 'المتجر - دانوب',
      timelineFulfillmentLabel: 'التسليم تم بواسطة راشد العتيبي',
      cancellationSummary: null
    }),
    createOrder({
      id: 'ZD-94816',
      displayId: '#ZD-94816',
      customerName: 'لمياء عثمان',
      customerPhone: '053-884-1030',
      customerEmail: 'lamia.o@example.com',
      customerAddress: 'حي قرطبة، الرياض',
      merchantName: 'تميمي',
      merchantBranch: 'قرطبة',
      merchantLocation: 'الرياض، حي قرطبة',
      driverName: 'فهد الدوسري',
      driverPhone: '0500-000-006',
      driverVehicleLabel: 'دراجة نارية',
      driverPlateNumber: 'ر ن ب 4112',
      city: 'الرياض',
      district: 'قرطبة',
      slaScore: 64,
      date: '25 مارس 2026',
      time: '10:05 ص',
      status: 'IN_PROGRESS',
      paymentStatus: 'PARTIALLY_REFUNDED',
      fulfillmentStatus: 'DRIVER_ASSIGNED',
      paymentMethodLabel: 'مدى',
      lastUpdatedAt: '10:34 ص',
      total: 310,
      subtotal: 270,
      deliveryFee: 12,
      tax: 28,
      isLate: true,
      hasActiveIssue: true,
      cancellationReason: null,
      operationalCase: {
        type: 'DISPUTE',
        status: 'OPEN',
        title: 'نزاع عنصر مفقود + استرداد جزئي',
        queueLabel: 'الدعم',
        openedAt: '10:34 ص',
        lastUpdatedAt: '10:34 ص'
      },
      expectedDeliveryWindow: '10:50 ص - 11:10 ص',
      transactionRef: '#TRX-8271044',
      paymentStatusNote: 'تم استرداد جزئي لبند مفقود، والحالة ما زالت مفتوحة.',
      fulfillmentStatusNote: 'تم تعيين سائق لكن الطلب لم يُلتقط بعد.',
      supportSummary: 'يوجد تصعيد دعم بسبب عنصر مفقود.',
      alertLabel: 'استرداد جزئي + متابعة دعم',
      items: [
        createOrderItem('منظف أرضيات', 'داك', 'عبوة', 18, 'cleaning_services', 'SKU-331101'),
        createOrderItem('حفاضات أطفال', 'بامبرز', 'عبوة كبيرة', 72, 'inventory_2', 'SKU-331102')
      ],
      createdChannel: 'تطبيق العميل',
      paymentGatewayLabel: 'مدى',
      timelinePrepLabel: 'المتجر - تميمي',
      timelineFulfillmentLabel: 'السائق فهد الدوسري',
      cancellationSummary: null
    })
  ];
}

export function getRouteTeamLabel(team: string): string {
  const labels: Record<string, string> = {
    operations: 'العمليات',
    finance: 'المالية',
    support: 'الدعم',
    risk: 'المخاطر',
    merchant_ops: 'إدارة المتاجر',
    compliance: 'الامتثال',
    legal: 'الشؤون القانونية'
  };

  return labels[team] || 'جهة أخرى';
}

export function getOperationalCaseTypeLabel(type: OrderOperationalCaseType): string {
  const labels: Record<OrderOperationalCaseType, string> = {
    REFUND: 'ملف استرداد',
    DISPUTE: 'نزاع',
    ISSUE: 'تنبيه تشغيلي'
  };

  return labels[type];
}

export function getOperationalCaseTypeKey(type: OrderOperationalCaseType): string {
  const labels: Record<OrderOperationalCaseType, string> = {
    REFUND: 'ORDERS.OPERATIONAL_CASE.TYPE.REFUND',
    DISPUTE: 'ORDERS.OPERATIONAL_CASE.TYPE.DISPUTE',
    ISSUE: 'ORDERS.OPERATIONAL_CASE.TYPE.ISSUE'
  };

  return labels[type];
}

export function getOperationalCaseStatusLabel(status: OrderOperationalCaseStatus): string {
  const labels: Record<OrderOperationalCaseStatus, string> = {
    OPEN: 'مفتوح',
    RESOLVED: 'محلول',
    CLOSED: 'مغلق'
  };

  return labels[status];
}

export function getOperationalCaseStatusKey(status: OrderOperationalCaseStatus): string {
  const labels: Record<OrderOperationalCaseStatus, string> = {
    OPEN: 'ORDERS.OPERATIONAL_CASE.STATUS.OPEN',
    RESOLVED: 'ORDERS.OPERATIONAL_CASE.STATUS.RESOLVED',
    CLOSED: 'ORDERS.OPERATIONAL_CASE.STATUS.CLOSED'
  };

  return labels[status];
}

function getOperationalCaseStatusActionLabel(status: OrderOperationalCaseStatus): string {
  const labels: Record<OrderOperationalCaseStatus, string> = {
    OPEN: 'تم فتح',
    RESOLVED: 'تم حل',
    CLOSED: 'تم إغلاق'
  };

  return labels[status];
}

export function getWorkflowStageLabel(stage: OrderWorkflowStage): string {
  const labels: Record<OrderWorkflowStage, string> = {
    PAYMENT_REVIEW: 'مراجعة الدفع',
    PREPARATION: 'تجهيز الطلب',
    DISPATCH: 'التوصيل والتنفيذ',
    REFUND_REVIEW: 'مراجعة الاسترداد',
    ISSUE_REVIEW: 'معالجة مشكلة مفتوحة',
    READY_TO_CLOSE: 'جاهز للإغلاق',
    CANCELLED: 'ملغي',
    CLOSED: 'مغلق'
  };

  return labels[stage];
}

export function getWorkflowStageKey(stage: OrderWorkflowStage): string {
  const labels: Record<OrderWorkflowStage, string> = {
    PAYMENT_REVIEW: 'ORDERS.WORKFLOW.STAGE.PAYMENT_REVIEW',
    PREPARATION: 'ORDERS.WORKFLOW.STAGE.PREPARATION',
    DISPATCH: 'ORDERS.WORKFLOW.STAGE.DISPATCH',
    REFUND_REVIEW: 'ORDERS.WORKFLOW.STAGE.REFUND_REVIEW',
    ISSUE_REVIEW: 'ORDERS.WORKFLOW.STAGE.ISSUE_REVIEW',
    READY_TO_CLOSE: 'ORDERS.WORKFLOW.STAGE.READY_TO_CLOSE',
    CANCELLED: 'ORDERS.WORKFLOW.STAGE.CANCELLED',
    CLOSED: 'ORDERS.WORKFLOW.STAGE.CLOSED'
  };

  return labels[stage];
}

export function getResolutionStateLabel(state: OrderResolutionState): string {
  const labels: Record<OrderResolutionState, string> = {
    ACTION_REQUIRED: 'يتطلب إجراء',
    MONITORING: 'قيد المتابعة',
    RESOLVED: 'محلول'
  };

  return labels[state];
}

export function getResolutionStateKey(state: OrderResolutionState): string {
  const labels: Record<OrderResolutionState, string> = {
    ACTION_REQUIRED: 'ORDERS.RESOLUTION_STATE.ACTION_REQUIRED',
    MONITORING: 'ORDERS.RESOLUTION_STATE.MONITORING',
    RESOLVED: 'ORDERS.RESOLUTION_STATE.RESOLVED'
  };

  return labels[state];
}

export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    NEW: 'جديد',
    PENDING: 'بانتظار المعالجة',
    IN_PROGRESS: 'قيد التنفيذ',
    OUT_FOR_DELIVERY: 'خرج للتسليم',
    DELIVERED: 'تم التسليم',
    COMPLETED: 'مغلق',
    CANCELLED: 'ملغي'
  };

  return labels[status];
}

export function getOrderStatusKey(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    NEW: 'ORDERS.STATUS.NEW',
    PENDING: 'ORDERS.STATUS.PENDING',
    IN_PROGRESS: 'ORDERS.STATUS.IN_PROGRESS',
    OUT_FOR_DELIVERY: 'ORDERS.STATUS.OUT_FOR_DELIVERY',
    DELIVERED: 'ORDERS.STATUS.DELIVERED',
    COMPLETED: 'ORDERS.STATUS.COMPLETED',
    CANCELLED: 'ORDERS.STATUS.CANCELLED'
  };

  return labels[status];
}

export function getPaymentStatusLabel(status: OrderPaymentStatus): string {
  const labels: Record<OrderPaymentStatus, string> = {
    PENDING: 'بانتظار الدفع',
    PAID: 'مدفوع',
    FAILED: 'فشل الدفع',
    REFUNDED: 'مسترد',
    PARTIALLY_REFUNDED: 'استرداد جزئي',
    COD_PENDING: 'تحصيل عند التسليم',
    SETTLED: 'تمت التسوية'
  };

  return labels[status];
}

export function getPaymentStatusKey(status: OrderPaymentStatus): string {
  const labels: Record<OrderPaymentStatus, string> = {
    PENDING: 'ORDERS.PAYMENT_STATUS.PENDING',
    PAID: 'ORDERS.PAYMENT_STATUS.PAID',
    FAILED: 'ORDERS.PAYMENT_STATUS.FAILED',
    REFUNDED: 'ORDERS.PAYMENT_STATUS.REFUNDED',
    PARTIALLY_REFUNDED: 'ORDERS.PAYMENT_STATUS.PARTIALLY_REFUNDED',
    COD_PENDING: 'ORDERS.PAYMENT_STATUS.COD_PENDING',
    SETTLED: 'ORDERS.PAYMENT_STATUS.SETTLED'
  };

  return labels[status];
}

export function getFulfillmentStatusLabel(status: OrderFulfillmentStatus): string {
  const labels: Record<OrderFulfillmentStatus, string> = {
    QUEUED: 'بانتظار التنفيذ',
    PREPARING: 'قيد التجهيز',
    READY_FOR_PICKUP: 'جاهز للاستلام',
    DRIVER_ASSIGNED: 'تم تعيين سائق',
    PICKED_UP: 'تم الاستلام',
    ON_ROUTE: 'في الطريق',
    DELIVERED: 'تم التسليم',
    FAILED: 'فشل التنفيذ',
    CANCELLED: 'أوقف التنفيذ'
  };

  return labels[status];
}

export function getFulfillmentStatusKey(status: OrderFulfillmentStatus): string {
  const labels: Record<OrderFulfillmentStatus, string> = {
    QUEUED: 'ORDERS.FULFILLMENT_STATUS.QUEUED',
    PREPARING: 'ORDERS.FULFILLMENT_STATUS.PREPARING',
    READY_FOR_PICKUP: 'ORDERS.FULFILLMENT_STATUS.READY_FOR_PICKUP',
    DRIVER_ASSIGNED: 'ORDERS.FULFILLMENT_STATUS.DRIVER_ASSIGNED',
    PICKED_UP: 'ORDERS.FULFILLMENT_STATUS.PICKED_UP',
    ON_ROUTE: 'ORDERS.FULFILLMENT_STATUS.ON_ROUTE',
    DELIVERED: 'ORDERS.FULFILLMENT_STATUS.DELIVERED',
    FAILED: 'ORDERS.FULFILLMENT_STATUS.FAILED',
    CANCELLED: 'ORDERS.FULFILLMENT_STATUS.CANCELLED'
  };

  return labels[status];
}

export function createMockOrders(): OrderDetail[] {
  return clone(buildSeedOrders());
}

export function cloneOrder(order: OrderDetail): OrderDetail {
  return clone(order);
}

export function refreshOrderTimeline(order: OrderDetail): OrderTimelineItem[] {
  return buildOrderTimeline(order);
}

export function refreshOrderWorkflow(order: OrderDetail): OrderDetail {
  order.workflowStage = deriveWorkflowStage(order);
  order.nextActionLabel = deriveNextAction(order);
  order.resolutionState = deriveResolutionState(order);
  return order;
}
