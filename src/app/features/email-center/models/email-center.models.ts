import type {
  DirectoryAudienceType,
  DirectoryPanelScope,
  DirectoryPersonaType
} from '@admin-users/public-api';

export type EmailSenderProfileStatus = 'primary' | 'secondary' | 'backup';
export type EmailPreviewLocale = 'ar' | 'en';
export type EmailBranchScopeMode = 'all_branches' | 'assigned_branch' | 'specific_branch';
export type EmailSenderProfileLocale = 'bilingual' | 'arabic' | 'english';
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
}

export interface EmailResolvedRecipients {
  to: string[];
  cc: string[];
  bcc: string[];
}

export interface EmailCenterKpiSnapshot {
  totalRules: number;
  enabledRules: number;
  senderProfiles: number;
  directoryDrivenRules: number;
  audienceCoverage: number;
}
