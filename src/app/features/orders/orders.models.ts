export type OrderStatus = 'NEW' | 'IN_PROGRESS' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'COMPLETED' | 'PENDING';

export interface OrderItem {
  name: string;
  brand: string;
  quantity: string;
  price: number;
  total: number;
  icon: string;
  sku: string;
}

export interface OrderTimelineItem {
  titleKey: string;
  subtitleKey: string;
  time: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  current: boolean;
}

export interface OrderActivity {
  titleKey: string;
  actorKey: string;
  time: string;
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

export interface OrderDetail {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  merchantName: string;
  merchantBranch: string;
  merchantLocation: string;
  driverName: string;
  driverPhone: string;
  city?: string;
  district?: string;
  slaScore?: number;
  date: string;
  time: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  items: OrderItem[];
  timeline: OrderTimelineItem[];
  activities: OrderActivity[];
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
  refundType: 'full' | 'partial';
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
