export type CustomerSegment = 'vip' | 'business' | 'new' | 'watchlist' | 'dormant';
export type CustomerStatus = 'active' | 'low_activity' | 'restricted' | 'dormant';
export type CustomerRisk = 'low' | 'medium' | 'high' | 'critical';
export type CustomerSpendRange = 'all' | 'lt_1000' | '1000_5000' | 'gt_5000';

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  segment: CustomerSegment;
  status: CustomerStatus;
  risk: CustomerRisk;
  totalOrders: number;
  totalSpent: number;
  averageBasket: number;
  lifetimeValue: number;
  refundsCount: number;
  disputesCount: number;
  activeDays30: number;
  lastOrderAt: string;
  lastOrderValue: number;
  joinedAt: string;
  loyaltyScore: number;
  preferredChannel: string;
  watchFlags: string[];
  notes: string;
}

export interface CustomerRecentOrder {
  id: string;
  date: string;
  total: number;
  status: 'DELIVERED' | 'REFUNDED' | 'PROCESSING';
}

export interface CustomerInternalNote {
  author: string;
  role: string;
  createdAt: string;
  message: string;
}

export interface CustomerDetailRecord extends CustomerRecord {
  registrationDate: string;
  riskScore: number;
  riskSummary: string;
  lastSeenAt: string;
  preferredLanguageLabel: string;
  isVerified: boolean;
  suspiciousLoginAttempts: string;
  repeatedPaymentFailureRate: string;
  complaintRateLabel: string;
  analysisSummary: string;
  refundsClosedCount: number;
  refundsInProgressCount: number;
  refundsTotalAmount: number;
  complaintsSolvedCount: number;
  lastSupportContact: string;
  accountTeam: string;
  accountManager: string;
  recentOrders: CustomerRecentOrder[];
  internalNotes: CustomerInternalNote[];
}
