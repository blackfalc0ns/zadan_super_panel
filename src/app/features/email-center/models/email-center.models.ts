import type {
  DirectoryAudienceType,
  DirectoryPanelScope,
  DirectoryPersonaType
} from '@admin-users/public-api';

export type EmailSenderProfileStatus = 'primary' | 'secondary' | 'backup';
export type EmailPreviewLocale = 'ar' | 'en';
export type EmailBranchScopeMode = 'all_branches' | 'assigned_branch' | 'specific_branch';
export type EmailSenderProfileLocale = 'bilingual' | 'arabic' | 'english';
export type EmailAutomationState = 'live' | 'manual_only';
export type EmailDispatchStatus = 'sent' | 'failed' | 'skipped';
export type EmailDispatchSource = 'test_send' | 'system_event' | 'vendor_automation_live' | 'vendor_automation_legacy' | string;
export type EmailRecipientTargetId =
  | 'primary_account_email'
  | 'vendor_owner'
  | 'vendor_company_manager'
  | 'branch_manager'
  | 'branch_staff'
  | 'vendor_finance'
  | 'vendor_support'
  | 'assigned_super_admin_manager'
  | 'driver_account'
  | 'customer_account';

export interface EmailSenderProfile {
  id: string;
  name: string;
  address: string;
  replyTo: string;
  descriptionKey: string;
  locale: EmailSenderProfileLocale;
  isDefault: boolean;
  status: EmailSenderProfileStatus;
  isReadOnly: boolean;
}

export interface EmailRecipientRoute {
  staticTo: string[];
  staticCc: string[];
  staticBcc: string[];
  fallbackTo: string[];
  fallbackCc: string[];
  fallbackBcc: string[];
  owner: string;
  escalation: string;
}

export interface EmailRecipientTargetSelection {
  to: EmailRecipientTargetId[];
  cc: EmailRecipientTargetId[];
  bcc: EmailRecipientTargetId[];
}

export interface EmailEntityScope {
  entityId: string | null;
  vendorId: string | null;
  branchId: string | null;
}

export interface EmailTemplatePreview {
  subject: Record<EmailPreviewLocale, string>;
  body: Record<EmailPreviewLocale, string>;
  variables: string[];
  heroImageUrl?: string | null;
  ctaLabel?: string | null;
  heroImageUrlAr?: string | null;
  heroImageUrlEn?: string | null;
}

export interface EmailTemplateRenderResult {
  html: string;
  subjectEn: string;
  subjectAr: string;
  bodyEn: string;
  bodyAr: string;
  ctaLabel: string | null;
}

export interface EmailDispatchSummary {
  status: EmailDispatchStatus;
  source: EmailDispatchSource;
  createdAtUtc: string;
  failureReason: string | null;
}

export interface EmailWorkflowRule {
  id: string;
  titleKey: string;
  subtitleKey: string;
  categoryKey: string;
  cadenceLabelKey: string;
  triggerNotesKey: string;
  enabled: boolean;
  senderProfileId: string;
  audienceType: DirectoryAudienceType;
  panelScope: DirectoryPanelScope;
  personaTargets: DirectoryPersonaType[];
  entityScope: EmailEntityScope;
  branchScopeMode: EmailBranchScopeMode;
  recipientTargets: EmailRecipientTargetSelection;
  route: EmailRecipientRoute;
  template: EmailTemplatePreview;
  automationState: EmailAutomationState;
  eventKey: string | null;
  lastDispatch: EmailDispatchSummary | null;
}

export interface EmailResolvedRecipients {
  to: string[];
  cc: string[];
  bcc: string[];
  warnings: string[];
}

export interface EmailCenterKpiSnapshot {
  totalRules: number;
  enabledRules: number;
  senderProfiles: number;
  directoryDrivenRules: number;
  audienceCoverage: number;
}

export interface EmailScopeOption {
  id: string;
  name: string;
}

export interface EmailBranchOption {
  id: string;
  vendorId: string;
  name: string;
}

export interface EmailCenterOverview {
  senderProfiles: EmailSenderProfile[];
  rules: EmailWorkflowRule[];
  kpi: EmailCenterKpiSnapshot;
  vendors: EmailScopeOption[];
  branches: EmailBranchOption[];
}

export interface EmailDispatchLog {
  id: string;
  ruleId: string | null;
  ruleLabel: string;
  audienceType: DirectoryAudienceType | string;
  source: EmailDispatchSource;
  status: EmailDispatchStatus;
  subject: string;
  to: string[];
  cc: string[];
  bcc: string[];
  provider: string | null;
  providerMessageId: string | null;
  failureReason: string | null;
  eventKey: string | null;
  isTestSend: boolean;
  createdAtUtc: string;
}

export interface EmailTestSendResult {
  dispatchId: string;
  status: EmailDispatchStatus;
  provider: string | null;
  providerMessageId: string | null;
  failureReason: string | null;
  createdAtUtc: string;
}

export interface EmailDispatchFilters {
  ruleId: string | null;
  source: string | null;
  status: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}
