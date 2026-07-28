export type AdminSupportStatus = 'open' | 'in_progress' | 'waiting_vendor' | 'resolved';
export type AdminSupportPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AdminSupportCategory = 'orders' | 'products' | 'finance' | 'offers' | 'staff' | 'profile' | 'technical' | 'general' | string;

export interface AdminSupportLocalizedText {
  ar: string;
  en: string;
}

export interface AdminVendorSupportMessage {
  id: string;
  direction: 'vendor' | 'support';
  author: string;
  role: AdminSupportLocalizedText;
  message: AdminSupportLocalizedText;
  createdAt: string;
}

export interface AdminVendorSupportTag {
  id: string;
  labelKey: string;
  tone: 'default' | 'warning' | 'success' | 'info' | string;
}

export interface AdminVendorSupportTicket {
  id: string;
  reference: string;
  subject: AdminSupportLocalizedText;
  category: AdminSupportCategory;
  priority: AdminSupportPriority;
  status: AdminSupportStatus;
  orderId?: string | null;
  orderNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  firstResponseHours: number;
  summary: AdminSupportLocalizedText;
  assignedAgentName: string;
  assignedAgentRole: AdminSupportLocalizedText;
  assignedAgentOnline: boolean;
  tags: AdminVendorSupportTag[];
  messages: AdminVendorSupportMessage[];
  linkedRoute?: string | null;
}

export interface AdminVendorSupportTicketStats {
  totalOpen: number;
  waitingVendor: number;
  resolved: number;
}

export interface AdminVendorSupportTicketsResponse {
  items: AdminVendorSupportTicket[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminVendorSupportFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}
