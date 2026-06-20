export type OrderStatus = 'NEW' | 'PENDING' | 'IN_PROGRESS' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

export type OrderPaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'COD_PENDING'
  | 'SETTLED';

export type OrderFulfillmentStatus =
  | 'QUEUED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DRIVER_ASSIGNED'
  | 'PICKED_UP'
  | 'ON_ROUTE'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

export type OrderDispatchState =
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'SEARCHING'
  | 'ASSIGNED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type OrderQueueView = 'ALL' | 'ACTIVE' | 'LATE' | 'PAYMENT_ISSUES' | 'REFUNDS';
export type OrderWorkflowStage = 'PAYMENT_REVIEW' | 'PREPARATION' | 'DISPATCH' | 'REFUND_REVIEW' | 'ISSUE_REVIEW' | 'READY_TO_CLOSE' | 'CANCELLED' | 'CLOSED';
export type OrderResolutionState = 'ACTION_REQUIRED' | 'MONITORING' | 'RESOLVED';
export type OrderOperationalCaseType = 'REFUND' | 'DISPUTE' | 'ISSUE';
export type OrderOperationalCaseStatus = 'OPEN' | 'RESOLVED' | 'CLOSED';

export interface OrderItem {
  name: string;
  nameAr?: string;
  nameEn?: string;
  brand: string;
  quantity: string;
  price: number;
  total: number;
  icon: string;
  sku: string;
  imageUrl?: string;
  variantDisplaySize?: string;
  packageTypeName?: string;
  measurementValue?: number | null;
  measurementUnitName?: string;
}

export interface OrderTimelineItem {
  title: string;
  subtitle: string;
  time: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  current: boolean;
}

export interface OrderActivity {
  title: string;
  actor: string;
  time: string;
  tone?: 'status' | 'payment' | 'issue' | 'note';
}

export interface DriverCandidate {
  id: string;
  name: string;
  code: string;
  phone: string;
  city: string;
  area: string;
  status: 'AVAILABLE' | 'DELIVERING';
  distanceKm: number;
  activeOrders: number;
  rating: number;
  rejectionRate: number;
  lastActivity: string;
  initials: string;
  avatarTone: string;
  lowPerformance?: boolean;
  verified?: boolean;
}

export interface OrderCancellationSummary {
  reasonLabel: string;
  details: string;
  refundType: 'full' | 'partial' | 'none';
  costBearer: 'platform' | 'merchant' | 'shared';
  cancelledAt: string;
  cancelledBy: string;
  customerMessage: string;
}

export interface OrderOperationalCase {
  caseId?: string | null;
  type: OrderOperationalCaseType;
  status: OrderOperationalCaseStatus;
  title: string;
  queueLabel: string;
  openedAt: string;
  lastUpdatedAt: string;
}

export interface OrderListItem {
  id: string;
  displayId: string;
  customerName: string;
  customerPhone: string;
  merchantName: string;
  merchantBranch: string;
  date: string;
  time: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  dispatchState?: OrderDispatchState;
  dispatchReason?: string;
  paymentMethodLabel: string;
  workflowStage: OrderWorkflowStage;
  nextActionLabel: string;
  resolutionState: OrderResolutionState;
  operationalCase: OrderOperationalCase | null;
  lastUpdatedAt: string;
  total: number;
  isLate: boolean;
  hasActiveIssue: boolean;
  cancellationReason?: string | null;
}

export interface OrderDeliveryBreakdown {
  driverToVendorDistanceKm: number;
  vendorToCustomerDistanceKm: number;
  driverToVendorFee: number;
  vendorToCustomerFee: number;
  totalDeliveryFee: number;
  driverToVendorPricingSource: string;
  vendorToCustomerPricingSource: string;
  pricingMode: string;
  usedEstimatedDriverPricing: boolean;
  deliveryQuoteStatus: string;
  pricingOriginType?: string | null;
  pricingOriginDriverId?: string | null;
  quoteLockedAtUtc?: string | null;
  quoteVersion: number;
  hasAnomalyWarning: boolean;
  actualAssignedDriverPickupDistanceKm?: number | null;
  actualDispatchDeviationPercent?: number | null;
}

export interface OrderDetail extends OrderListItem {
  customerEmail: string;
  customerAddress: string;
  merchantLocation: string;
  driverName: string;
  driverPhone: string;
  driverVehicleLabel: string;
  driverPlateNumber: string;
  city?: string;
  district?: string;
  slaScore?: number;
  expectedDeliveryWindow: string;
  transactionRef: string;
  paymentStatusNote: string;
  fulfillmentStatusNote: string;
  supportSummary: string;
  alertLabel: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  items: OrderItem[];
  timeline: OrderTimelineItem[];
  activities: OrderActivity[];
  driverCandidates: DriverCandidate[];
  candidateScoreBreakdown?: string[];
  cancellationSummary: OrderCancellationSummary | null;
  customerGeo?: { latitude: number; longitude: number } | null;
  merchantGeo?: { latitude: number; longitude: number } | null;
  driverLiveLocation?: { latitude: number; longitude: number; accuracyMeters?: number; recordedAtUtc?: string } | null;
  deliveryBreakdown?: OrderDeliveryBreakdown;
}

export interface OrderStatusUpdateForm {
  newStatus: OrderStatus;
  adminNotes: string;
  expectedDeliveryTime: string;
  notifyCustomer: boolean;
  notifyMerchant: boolean;
  notifyDriver: boolean;
  addInternalLog: boolean;
}

export interface DriverAssignmentForm {
  searchQuery: string;
  city: string;
  availability: 'all' | 'available' | 'busy';
  verification: 'all' | 'verified';
  selectedDriverId: string;
  assignmentReason: 'driver_delay' | 'customer_request' | 'vehicle_issue' | 'manual_optimization' | 'other';
  internalNotes: string;
  notifyDriver: boolean;
  notifyMerchant: boolean;
  notifyCustomer: boolean;
}

export interface OrderCancellationForm {
  reason: 'customer_request' | 'merchant_rejected' | 'out_of_stock' | 'payment_issue' | 'delivery_failed' | 'operational_issue' | 'fraud_suspected' | 'other';
  details: string;
  refundType: 'full' | 'partial' | 'none';
  costBearer: 'platform' | 'merchant';
  notifyCustomer: boolean;
  notifyMerchant: boolean;
  notifyDriver: boolean;
  customerMessage: string;
  internalNote: string;
}

export interface OrderRefundForm {
  refundType: 'products' | 'full' | 'custom';
  refundAmount: string;
  reason: 'delivery_delay' | 'missing_item' | 'quality_issue' | 'other';
  refundMethod: 'same_method' | 'wallet' | 'manual';
  costBearer: 'platform' | 'merchant' | 'shared';
  internalNotes: string;
  customerMessage: string;
  notifyCustomerSms: boolean;
  notifyFinance: boolean;
}

export interface OrderDisputeForm {
  disputeType: 'payment_issue' | 'quality_issue' | 'not_received' | 'missing_item' | 'customer_rejected' | 'delivery_failure' | 'fraud' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  routeTo: 'operations' | 'finance' | 'risk' | 'support' | 'legal';
  description: string;
  internalNotes: string;
  notifyReviewer: boolean;
  addToLog: boolean;
  markHighRisk: boolean;
  notifyStakeholders: boolean;
}

export interface OrderIssueFlagForm {
  issueType: 'prep_delay' | 'delivery_delay' | 'payment_issue' | 'communication_issue' | 'driver_unavailable' | 'address_issue' | 'fraud_suspicion' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiredAction: string;
  assignedTeam: 'operations' | 'finance' | 'compliance';
  followUpDate: string;
  showInOperationsCenter: boolean;
  notifyAssignedTeam: boolean;
  highRiskAlert: boolean;
}

export interface OrderListQuery {
  page: number;
  pageSize: number;
  searchTerm?: string;
  status?: OrderStatus | 'ALL';
  paymentStatus?: OrderPaymentStatus | 'ALL';
  fulfillmentStatus?: OrderFulfillmentStatus | 'ALL';
  queueView?: OrderQueueView;
}

export interface OrdersSummary {
  total: number;
  active: number;
  late: number;
  paymentIssues: number;
  refunds: number;
}

export interface PaginatedOrdersResponse {
  items: OrderListItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  summary: OrdersSummary;
}

export interface FilterOptionItem {
  value: string;
  labelAr: string;
  labelEn: string;
}

export interface OrderFilterOptions {
  orderStatuses: FilterOptionItem[];
  paymentStatuses: FilterOptionItem[];
  fulfillmentStatuses: FilterOptionItem[];
  queueViews: FilterOptionItem[];
}
