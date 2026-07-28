const TIMELINE_TEXT_KEY_PREFIX = 'ORDERS.DETAIL.TIMELINE_STEPS.';

/** Maps normalized timeline title/subtitle (AR + EN) to i18n keys. */
const TIMELINE_TEXT_ALIASES: Record<string, string> = {
  // Titles — order lifecycle
  'أنشأنا الطلب': 'TITLES.ORDER_CREATED',
  'تم إنشاء الطلب': 'TITLES.ORDER_CREATED',
  'order created': 'TITLES.ORDER_CREATED',
  'الدفع': 'TITLES.PAYMENT',
  'payment': 'TITLES.PAYMENT',
  'التنفيذ': 'TITLES.FULFILLMENT',
  'fulfillment': 'TITLES.FULFILLMENT',
  'الإغلاق': 'TITLES.CLOSURE',
  'closure': 'TITLES.CLOSURE',

  // Titles — backend order statuses
  'بانتظار الدفع': 'TITLES.PENDING_PAYMENT',
  'pending payment': 'TITLES.PENDING_PAYMENT',
  'بانتظار تأكيد التحويل البنكي': 'TITLES.PENDING_BANK_CONFIRMATION',
  'pending bank confirmation': 'TITLES.PENDING_BANK_CONFIRMATION',
  'مُرسل': 'TITLES.PLACED',
  'placed': 'TITLES.PLACED',
  'بانتظار قبول المتجر': 'TITLES.PENDING_VENDOR_ACCEPTANCE',
  'pending vendor acceptance': 'TITLES.PENDING_VENDOR_ACCEPTANCE',
  'مقبول': 'TITLES.ACCEPTED',
  'accepted': 'TITLES.ACCEPTED',
  'قيد التجهيز': 'TITLES.PREPARING',
  'preparing': 'TITLES.PREPARING',
  'جاهز للاستلام': 'TITLES.READY_FOR_PICKUP',
  'ready for pickup': 'TITLES.READY_FOR_PICKUP',
  'جاري البحث عن مندوب': 'TITLES.DRIVER_ASSIGNMENT_IN_PROGRESS',
  'نبحث عن مندوب': 'TITLES.DRIVER_ASSIGNMENT_IN_PROGRESS',
  'driver assignment in progress': 'TITLES.DRIVER_ASSIGNMENT_IN_PROGRESS',
  'تم تعيين المندوب': 'TITLES.DRIVER_ASSIGNED',
  'عيّنا المندوب': 'TITLES.DRIVER_ASSIGNED',
  'driver assigned': 'TITLES.DRIVER_ASSIGNED',
  'تم الاستلام': 'TITLES.PICKED_UP',
  'استلمنا': 'TITLES.PICKED_UP',
  'مستلم': 'TITLES.PICKED_UP',
  'picked up': 'TITLES.PICKED_UP',
  'في الطريق': 'TITLES.ON_THE_WAY',
  'on the way': 'TITLES.ON_THE_WAY',
  'تم التوصيل': 'TITLES.DELIVERED',
  'مسلّم': 'TITLES.DELIVERED',
  'وصلنا': 'TITLES.DELIVERED',
  'delivered': 'TITLES.DELIVERED',
  'ملغى': 'TITLES.CANCELLED',
  'ملغي': 'TITLES.CANCELLED',
  'cancelled': 'TITLES.CANCELLED',
  'canceled': 'TITLES.CANCELLED',
  'مرفوض من المتجر': 'TITLES.VENDOR_REJECTED',
  'vendor rejected': 'TITLES.VENDOR_REJECTED',
  'فشل التوصيل': 'TITLES.DELIVERY_FAILED',
  'delivery failed': 'TITLES.DELIVERY_FAILED',
  'مسترجع': 'TITLES.REFUNDED',
  'refunded': 'TITLES.REFUNDED',
  'مراجعة استرجاع كامل': 'TITLES.FULL_REFUND_REVIEW',
  'full refund review': 'TITLES.FULL_REFUND_REVIEW',
  'مراجعة استرجاع جزئي': 'TITLES.PARTIAL_REFUND_REVIEW',
  'partial refund review': 'TITLES.PARTIAL_REFUND_REVIEW',

  // Queue labels
  'المالية': 'SUBTITLES.QUEUE_FINANCE',
  'finance': 'SUBTITLES.QUEUE_FINANCE',
  'العمليات': 'SUBTITLES.QUEUE_OPERATIONS',
  'operations': 'SUBTITLES.QUEUE_OPERATIONS',
  'المخاطر': 'SUBTITLES.QUEUE_RISK',
  'risk': 'SUBTITLES.QUEUE_RISK',
  'القانونية': 'SUBTITLES.QUEUE_LEGAL',
  'legal': 'SUBTITLES.QUEUE_LEGAL',
  'الدعم': 'SUBTITLES.QUEUE_SUPPORT',
  'support': 'SUBTITLES.QUEUE_SUPPORT',

  // Subtitles — payment & system
  'تم تأكيد الدفع والتحصيل': 'SUBTITLES.PAYMENT_CAPTURED',
  'أكدنا الدفع والتحصيل': 'SUBTITLES.PAYMENT_CAPTURED',
  'payment captured': 'SUBTITLES.PAYMENT_CAPTURED',
  'بانتظار تأكيد الدفع': 'SUBTITLES.WAITING_PAYMENT_CONFIRMATION',
  'waiting for payment confirmation': 'SUBTITLES.WAITING_PAYMENT_CONFIRMATION',
  'تحديث تلقائي للنظام': 'SUBTITLES.SYSTEM_AUTO_UPDATE',
  'system automatic update': 'SUBTITLES.SYSTEM_AUTO_UPDATE',
  'بانتظار الإغلاق': 'SUBTITLES.AWAITING_CLOSURE',
  'awaiting closure': 'SUBTITLES.AWAITING_CLOSURE',

  // Subtitles — fulfillment
  'في الطابور': 'SUBTITLES.FULFILLMENT_QUEUED',
  'queued': 'SUBTITLES.FULFILLMENT_QUEUED',
  'بانتظار التنفيذ': 'SUBTITLES.FULFILLMENT_QUEUED',
  'في طابور التنفيذ': 'SUBTITLES.FULFILLMENT_QUEUED',
  'queued for fulfillment': 'SUBTITLES.FULFILLMENT_QUEUED',
  'أوقف التنفيذ': 'SUBTITLES.FULFILLMENT_CANCELLED',
  'fulfillment stopped': 'SUBTITLES.FULFILLMENT_CANCELLED',
  'فشل التنفيذ': 'SUBTITLES.FULFILLMENT_FAILED',
  'fulfillment failed': 'SUBTITLES.FULFILLMENT_FAILED',

  // Subtitles — operational notes
  'cash on delivery selected': 'SUBTITLES.COD_SELECTED',
  'تم اختيار الدفع عند الاستلام': 'SUBTITLES.COD_SELECTED',
  'اختار العميل الدفع عند الاستلام': 'SUBTITLES.COD_SELECTED',
  'اخترنا الدفع عند الاستلام': 'SUBTITLES.COD_SELECTED',
  'awaiting vendor response': 'SUBTITLES.AWAITING_VENDOR',
  'بانتظار رد المتجر': 'SUBTITLES.AWAITING_VENDOR',
  'vendor accepted the order': 'SUBTITLES.VENDOR_ACCEPTED',
  'قبل المتجر الطلب': 'SUBTITLES.VENDOR_ACCEPTED',
  'vendor started preparing': 'SUBTITLES.VENDOR_PREPARING',
  'بدأ المتجر في تجهيز الطلب': 'SUBTITLES.VENDOR_PREPARING',
  'بدأ المتجر التجهيز': 'SUBTITLES.VENDOR_PREPARING',
  'order is ready for pickup': 'SUBTITLES.READY_FOR_PICKUP',
  'الطلب جاهز للاستلام': 'SUBTITLES.READY_FOR_PICKUP',
  'order is ready for customer pickup at the branch': 'SUBTITLES.ORDER_READY_CUSTOMER_PICKUP',
  'الطلب جاهز لاستلام العميل من الفرع': 'SUBTITLES.ORDER_READY_CUSTOMER_PICKUP',
  'auto-dispatch started': 'SUBTITLES.AUTO_DISPATCH_STARTED',
  'بدأ البحث التلقائي عن مندوب': 'SUBTITLES.AUTO_DISPATCH_STARTED',
  'driver accepted delivery offer': 'SUBTITLES.DRIVER_ACCEPTED_OFFER',
  'قبل المندوب عرض التوصيل': 'SUBTITLES.DRIVER_ACCEPTED_OFFER',
  'وافق المندوب على عرض التوصيل': 'SUBTITLES.DRIVER_ACCEPTED_OFFER',
  'driver accepted delivery offer.': 'SUBTITLES.DRIVER_ACCEPTED_OFFER',
  'vendor confirmed pickup handoff via otp': 'SUBTITLES.VENDOR_OTP_HANDOFF',
  'vendor confirmed pickup handoff via otp.': 'SUBTITLES.VENDOR_OTP_HANDOFF',
  'تم تأكيد تسليم الطلب للمندوب عبر الرمز': 'SUBTITLES.VENDOR_OTP_HANDOFF',
  'أكدنا تسليم الطلب للمندوب عبر الرمز': 'SUBTITLES.VENDOR_OTP_HANDOFF',
  'driver is on the way': 'SUBTITLES.DRIVER_ON_THE_WAY',
  'المندوب في الطريق إليك': 'SUBTITLES.DRIVER_ON_THE_WAY',
  'المندوب في الطريق': 'SUBTITLES.DRIVER_ON_THE_WAY',
  'driver verified delivery otp': 'SUBTITLES.DELIVERY_OTP_VERIFIED',
  'driver verified delivery otp.': 'SUBTITLES.DELIVERY_OTP_VERIFIED',
  'تم التحقق من رمز التوصيل بنجاح': 'SUBTITLES.DELIVERY_OTP_VERIFIED',
  'تحققنا من رمز التوصيل': 'SUBTITLES.DELIVERY_OTP_VERIFIED',
  'order placed': 'SUBTITLES.ORDER_PLACED',
  'تم إنشاء الطلب بنجاح': 'SUBTITLES.ORDER_PLACED',
  'أنشأنا الطلب بنجاح': 'SUBTITLES.ORDER_PLACED',
  'order confirmed': 'SUBTITLES.ORDER_CONFIRMED',
  'تم تأكيد الطلب': 'SUBTITLES.ORDER_CONFIRMED',
  'أكدنا الطلب': 'SUBTITLES.ORDER_CONFIRMED',
  'order picked up': 'SUBTITLES.ORDER_PICKED_UP',
  'تم استلام الطلب من قبل المندوب': 'SUBTITLES.ORDER_PICKED_UP',
  'استلم المندوب الطلب': 'SUBTITLES.ORDER_PICKED_UP',
  'order delivered': 'SUBTITLES.ORDER_DELIVERED',
  'تم توصيل الطلب بنجاح': 'SUBTITLES.ORDER_DELIVERED',
  'سلّمنا الطلب بنجاح': 'SUBTITLES.ORDER_DELIVERED',
  'searching for drivers': 'SUBTITLES.SEARCHING_DRIVERS',
  'searching for drivers.': 'SUBTITLES.SEARCHING_DRIVERS',
  'جاري البحث عن مندوبين': 'SUBTITLES.SEARCHING_DRIVERS',
  'نبحث عن مندوبين': 'SUBTITLES.SEARCHING_DRIVERS',
  'no drivers available': 'SUBTITLES.NO_DRIVERS',
  'no drivers available.': 'SUBTITLES.NO_DRIVERS',
  'لا يوجد مندوبين متاحين': 'SUBTITLES.NO_DRIVERS',
  'ما فيه مناديب متاحين': 'SUBTITLES.NO_DRIVERS',
  'driver verified pickup otp': 'SUBTITLES.DRIVER_VERIFIED_PICKUP_OTP',
  'driver verified pickup otp.': 'SUBTITLES.DRIVER_VERIFIED_PICKUP_OTP',
  'تحقق المندوب من رمز الاستلام': 'SUBTITLES.DRIVER_VERIFIED_PICKUP_OTP',
  'تحقق المندوب من رمز استلام الطلب': 'SUBTITLES.DRIVER_VERIFIED_PICKUP_OTP',
  'driver assigned via dispatch': 'SUBTITLES.DRIVER_ASSIGNED_VIA_DISPATCH',
  'driver assigned via dispatch.': 'SUBTITLES.DRIVER_ASSIGNED_VIA_DISPATCH',
  'عيّنا المندوب عبر التوجيه': 'SUBTITLES.DRIVER_ASSIGNED_VIA_DISPATCH',
  'awaiting automatic bank transfer confirmation': 'SUBTITLES.AWAITING_BANK_CONFIRMATION',
  'awaiting automatic bank transfer confirmation.': 'SUBTITLES.AWAITING_BANK_CONFIRMATION',
  'بانتظار تأكيد التحويل البنكي التلقائي': 'SUBTITLES.AWAITING_BANK_CONFIRMATION',
  'pickup confirmed before customer arrival': 'SUBTITLES.PICKUP_CONFIRMED_BEFORE_ARRIVAL',
  'pickup confirmed before customer arrival.': 'SUBTITLES.PICKUP_CONFIRMED_BEFORE_ARRIVAL',
  'أكدنا الاستلام قبل الوصول للعميل': 'SUBTITLES.PICKUP_CONFIRMED_BEFORE_ARRIVAL',
  'bank transfer proof uploaded': 'SUBTITLES.BANK_TRANSFER_PROOF_UPLOADED',
  'رفعنا إثبات التحويل البنكي': 'SUBTITLES.BANK_TRANSFER_PROOF_UPLOADED',
  'delivery offer sent': 'SUBTITLES.DELIVERY_OFFER_SENT',
  'delivery offer sent.': 'SUBTITLES.DELIVERY_OFFER_SENT',
  'أرسلنا عرض التوصيل': 'SUBTITLES.DELIVERY_OFFER_SENT',
  'driver rejected delivery offer': 'SUBTITLES.DRIVER_REJECTED_OFFER',
  'driver rejected delivery offer.': 'SUBTITLES.DRIVER_REJECTED_OFFER',
  'رفض المندوب عرض التوصيل': 'SUBTITLES.DRIVER_REJECTED_OFFER',
  'cancelled by admin': 'SUBTITLES.CANCELLED_BY_ADMIN',
  'cancelled by admin.': 'SUBTITLES.CANCELLED_BY_ADMIN',
  'ألغينا من الإدارة': 'SUBTITLES.CANCELLED_BY_ADMIN',
  'cancelled by customer': 'SUBTITLES.CANCELLED_BY_CUSTOMER',
  'cancelled by customer.': 'SUBTITLES.CANCELLED_BY_CUSTOMER',
  'ألغينا من العميل': 'SUBTITLES.CANCELLED_BY_CUSTOMER',
  'pickupexpired': 'SUBTITLES.PICKUP_EXPIRED',
  'انتهت مهلة الاستلام': 'SUBTITLES.PICKUP_EXPIRED',
  'pickup window expired': 'SUBTITLES.PICKUP_EXPIRED',
  'cancelled due to pickup window expiry': 'SUBTITLES.CANCELLED_PICKUP_EXPIRY',
  'cancelled due to pickup window expiry.': 'SUBTITLES.CANCELLED_PICKUP_EXPIRY',
  'أُلغي الطلب لانتهاء مهلة الاستلام': 'SUBTITLES.CANCELLED_PICKUP_EXPIRY',
  'customer pickup otp verified and order marked as delivered': 'SUBTITLES.CUSTOMER_PICKUP_OTP_VERIFIED',
  'customer pickup otp verified and order marked as delivered.': 'SUBTITLES.CUSTOMER_PICKUP_OTP_VERIFIED',
  'تحققنا من رمز استلام العميل وتم تسليم الطلب': 'SUBTITLES.CUSTOMER_PICKUP_OTP_VERIFIED'
};

/** Partial matches for backend notes that may include prefixes/suffixes or punctuation. */
const TIMELINE_TEXT_PATTERNS: Array<{ includes: string; key: string }> = [
  { includes: 'dispatch pending: offer-timeout-exhausted', key: 'SUBTITLES.DISPATCH_PENDING_OFFER_TIMEOUT' },
  { includes: 'dispatch pending: missing-pickup-city', key: 'SUBTITLES.DISPATCH_PENDING_MISSING_PICKUP_CITY' },
  { includes: 'dispatch pending: missing-customer-city', key: 'SUBTITLES.DISPATCH_PENDING_MISSING_CUSTOMER_CITY' },
  { includes: 'dispatch pending: pickup-customer-city-mismatch', key: 'SUBTITLES.DISPATCH_PENDING_CITY_MISMATCH' },
  { includes: 'dispatch pending: no-eligible-driver-in-pickup-area', key: 'SUBTITLES.DISPATCH_PENDING_NO_DRIVER_IN_AREA' },
  { includes: 'dispatch pending: soft-blocked-by-rejections', key: 'SUBTITLES.DISPATCH_PENDING_SOFT_BLOCKED' },
  { includes: 'dispatch pending: no-eligible-driver', key: 'SUBTITLES.DISPATCH_PENDING_NO_DRIVER' },
  { includes: 'التوجيه معلّق', key: 'SUBTITLES.DISPATCH_PENDING_GENERIC' },
  { includes: 'driver assigned by admin', key: 'SUBTITLES.DRIVER_ASSIGNED_BY_ADMIN' },
  { includes: 'عيّنا المندوب من الإدارة', key: 'SUBTITLES.DRIVER_ASSIGNED_BY_ADMIN' },
  { includes: 'bank transfer confirmed by', key: 'SUBTITLES.BANK_TRANSFER_CONFIRMED' },
  { includes: 'أكدنا التحويل البنكي', key: 'SUBTITLES.BANK_TRANSFER_CONFIRMED' },
  { includes: 'vendor confirmed pickup handoff', key: 'SUBTITLES.VENDOR_OTP_HANDOFF' },
  { includes: 'driver verified delivery otp', key: 'SUBTITLES.DELIVERY_OTP_VERIFIED' },
  { includes: 'driver verified pickup otp', key: 'SUBTITLES.DRIVER_VERIFIED_PICKUP_OTP' },
  { includes: 'driver accepted delivery offer', key: 'SUBTITLES.DRIVER_ACCEPTED_OFFER' },
  { includes: 'driver assigned via dispatch', key: 'SUBTITLES.DRIVER_ASSIGNED_VIA_DISPATCH' },
  { includes: 'auto-dispatch started', key: 'SUBTITLES.AUTO_DISPATCH_STARTED' },
  { includes: 'cash on delivery selected', key: 'SUBTITLES.COD_SELECTED' },
  { includes: 'awaiting vendor response', key: 'SUBTITLES.AWAITING_VENDOR' },
  { includes: 'awaiting automatic bank transfer', key: 'SUBTITLES.AWAITING_BANK_CONFIRMATION' },
  { includes: 'driver is on the way', key: 'SUBTITLES.DRIVER_ON_THE_WAY' },
  { includes: 'searching for drivers', key: 'SUBTITLES.SEARCHING_DRIVERS' },
  { includes: 'no drivers available', key: 'SUBTITLES.NO_DRIVERS' },
  { includes: 'system automatic update', key: 'SUBTITLES.SYSTEM_AUTO_UPDATE' },
  { includes: 'payment captured', key: 'SUBTITLES.PAYMENT_CAPTURED' },
  { includes: 'waiting for payment confirmation', key: 'SUBTITLES.WAITING_PAYMENT_CONFIRMATION' },
  { includes: 'customer cancellation reason', key: 'SUBTITLES.CUSTOMER_CANCELLATION_REASON' },
  { includes: 'سبب إلغاء العميل', key: 'SUBTITLES.CUSTOMER_CANCELLATION_REASON' }
];

export function normalizeTimelineText(value: string): string {
  return value.trim().replace(/^[\s.,;:!?·•-]+/, '').replace(/[\s.,;:!?·•-]+$/, '').replace(/\s+/g, ' ').toLowerCase();
}

export function resolveOrderTimelineTextKey(text: string | null | undefined): string | null {
  if (!text?.trim()) {
    return null;
  }

  const trimmed = text.trim();

  if (trimmed.startsWith('ORDERS.')) {
    return trimmed;
  }

  const normalized = normalizeTimelineText(trimmed);
  const alias = TIMELINE_TEXT_ALIASES[normalized];
  if (alias) {
    return `${TIMELINE_TEXT_KEY_PREFIX}${alias}`;
  }

  const pattern = TIMELINE_TEXT_PATTERNS.find((entry) => normalized.includes(entry.includes));
  return pattern ? `${TIMELINE_TEXT_KEY_PREFIX}${pattern.key}` : null;
}

const TIMELINE_ICON_PATTERNS: Array<{ includes: string; icon: string }> = [
  { includes: 'order created', icon: 'receipt_long' },
  { includes: 'تم إنشاء', icon: 'receipt_long' },
  { includes: 'أنشأنا الطلب', icon: 'receipt_long' },
  { includes: 'refund review', icon: 'currency_exchange' },
  { includes: 'استرجاع', icon: 'currency_exchange' },
  { includes: 'closure', icon: 'flag_circle' },
  { includes: 'إغلاق', icon: 'flag_circle' },
  { includes: 'pending payment', icon: 'schedule' },
  { includes: 'بانتظار الدفع', icon: 'schedule' },
  { includes: 'payment', icon: 'payments' },
  { includes: 'الدفع', icon: 'payments' },
  { includes: 'دفع', icon: 'payments' },
  { includes: 'placed', icon: 'send' },
  { includes: 'مُرسل', icon: 'send' },
  { includes: 'مرسل', icon: 'send' },
  { includes: 'vendor acceptance', icon: 'storefront' },
  { includes: 'قبول المتجر', icon: 'storefront' },
  { includes: 'accepted', icon: 'task_alt' },
  { includes: 'مقبول', icon: 'task_alt' },
  { includes: 'preparing', icon: 'restaurant' },
  { includes: 'تجهيز', icon: 'restaurant' },
  { includes: 'ready for pickup', icon: 'inventory_2' },
  { includes: 'جاهز للاستلام', icon: 'inventory_2' },
  { includes: 'searching for', icon: 'radar' },
  { includes: 'بحث عن', icon: 'radar' },
  { includes: 'driver assigned', icon: 'delivery_truck_speed' },
  { includes: 'تعيين المندوب', icon: 'delivery_truck_speed' },
  { includes: 'عيّنا المندوب', icon: 'delivery_truck_speed' },
  { includes: 'مُعيّن له مندوب', icon: 'delivery_truck_speed' },
  { includes: 'picked up', icon: 'package_2' },
  { includes: 'استلام', icon: 'package_2' },
  { includes: 'استلمنا', icon: 'package_2' },
  { includes: 'مستلم', icon: 'package_2' },
  { includes: 'on the way', icon: 'route' },
  { includes: 'في الطريق', icon: 'route' },
  { includes: 'delivered', icon: 'home_pin' },
  { includes: 'توصيل', icon: 'home_pin' },
  { includes: 'مسلّم', icon: 'home_pin' },
  { includes: 'سلّمنا', icon: 'home_pin' },
  { includes: 'وصل', icon: 'home_pin' },
  { includes: 'cancelled', icon: 'cancel' },
  { includes: 'canceled', icon: 'cancel' },
  { includes: 'ملغ', icon: 'cancel' },
  { includes: 'refunded', icon: 'currency_exchange' },
  { includes: 'مسترجع', icon: 'currency_exchange' },
  { includes: 'failed', icon: 'error' },
  { includes: 'فشل', icon: 'error' },
  { includes: 'rejected', icon: 'block' },
  { includes: 'مرفوض', icon: 'block' },
  { includes: 'fulfillment', icon: 'local_shipping' },
  { includes: 'التنفيذ', icon: 'local_shipping' }
];

/** Material icon name per timeline step (from title/subtitle). */
export function resolveOrderTimelineStepIcon(
  titleAr?: string | null,
  titleEn?: string | null,
  subtitleAr?: string | null,
  subtitleEn?: string | null
): string {
  const haystack = [titleAr, titleEn, subtitleAr, subtitleEn]
    .filter((part): part is string => !!part?.trim())
    .map((part) => normalizeTimelineText(part))
    .join(' ');

  const match = TIMELINE_ICON_PATTERNS.find((entry) => haystack.includes(entry.includes));
  return match?.icon ?? 'radio_button_checked';
}
