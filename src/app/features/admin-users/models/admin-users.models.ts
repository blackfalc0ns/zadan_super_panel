export type DirectoryAudienceType = 'super_admin' | 'vendor_network' | 'drivers' | 'customers';
export type DirectoryIdentityKind = 'operational' | 'external';
export type AdminAccessStatus = 'active' | 'invited' | 'suspended' | 'inactive';
export type AdminInviteState = 'accepted' | 'pending' | 'expired' | 'draft';
export type AdminAccessLevel = 'full' | 'restricted' | 'observer';
export type PermissionActionId = 'view' | 'create' | 'edit' | 'approve' | 'export' | 'manage_settings';
export type PermissionDomainId =
  | 'dashboard'
  | 'vendors'
  | 'catalog'
  | 'orders'
  | 'customers'
  | 'drivers'
  | 'disputes'
  | 'finances'
  | 'users_access'
  | 'email_center'
  | 'system'
  | 'vendor_dashboard'
  | 'vendor_orders'
  | 'vendor_catalog'
  | 'vendor_branch_team'
  | 'vendor_finance'
  | 'vendor_support'
  | 'vendor_settings'
  | 'marketing';
export type DirectoryPanelScope = 'super_admin_panel' | 'vendor_panel' | 'driver_app' | 'customer_app';
export type DirectoryPersonaType =
  | 'super_admin_manager'
  | 'super_admin_staff'
  | 'vendor_owner'
  | 'vendor_company_manager'
  | 'vendor_branch_manager'
  | 'vendor_branch_employee'
  | 'vendor_finance'
  | 'vendor_support'
  | 'driver'
  | 'customer';
export type DirectoryRolePresetId =
  | 'super_admin'
  | 'operations_lead'
  | 'risk_admin'
  | 'finance_admin'
  | 'support_admin'
  | 'vendor_owner'
  | 'vendor_company_manager'
  | 'vendor_branch_manager'
  | 'vendor_branch_employee'
  | 'vendor_finance_manager'
  | 'vendor_support_manager'
  | 'driver_account'
  | 'customer_account';
export type AdminRolePresetId = DirectoryRolePresetId;
export type DirectoryEntitySource = 'admin' | 'vendor' | 'driver' | 'customer';
export type DirectoryVerificationState = 'verified' | 'pending' | 'under_review' | 'suspended' | 'not_required';
export type DirectoryPreferredLocale = 'ar' | 'en' | 'bilingual';
export type DirectoryFeatureToggleId =
  | 'driver.dispatch_notifications'
  | 'driver.compliance_emails'
  | 'driver.finance_digests'
  | 'customer.marketing_opt_in'
  | 'customer.support_escalations'
  | 'customer.order_issue_updates';

export interface PermissionGroup {
  id: PermissionDomainId;
  labelKey: string;
  descriptionKey: string;
  actions: PermissionActionId[];
  panelScopes: DirectoryPanelScope[];
  identityKinds: DirectoryIdentityKind[];
}

export interface DirectoryRolePreset {
  id: DirectoryRolePresetId;
  nameKey: string;
  descriptionKey: string;
  accessLevel: AdminAccessLevel;
  permissions: string[];
  accent: string;
  panelScope: DirectoryPanelScope;
  audienceType: DirectoryAudienceType;
  identityKind: DirectoryIdentityKind;
  personaTypes: DirectoryPersonaType[];
}

export interface AdminRolePreset extends DirectoryRolePreset {}

export interface AdminUserSecurity {
  mfaEnabled: boolean;
  lastLoginAt: string | null;
  invitedBy: string;
  invitedAt: string | null;
  acceptedAt: string | null;
  verificationState: DirectoryVerificationState;
}

export interface DirectoryAssignment {
  entityId: string | null;
  entitySource: DirectoryEntitySource;
  vendorId: string | null;
  vendorName: string;
  branchId: string | null;
  branchName: string;
  region: string;
  city: string;
}

export interface DirectoryEmailOptIn {
  accessInvites: boolean;
  branchAlerts: boolean;
  dispatchNotifications: boolean;
  complianceEmails: boolean;
  financeDigests: boolean;
  supportEscalations: boolean;
  orderIssueUpdates: boolean;
  marketingOptIn: boolean;
}

export interface DirectoryCommunicationProfile {
  primaryEmail: string;
  notificationEmails: string[];
  replyTo: string;
  escalationEmails: string[];
  preferredLocale: DirectoryPreferredLocale;
  emailOptIn: DirectoryEmailOptIn;
}

export interface DirectoryFeatureToggleDefinition {
  id: DirectoryFeatureToggleId;
  labelKey: string;
  descriptionKey: string;
  personaTypes: DirectoryPersonaType[];
}

export interface DirectoryIdentityRecord {
  id: string;
  entityId: string | null;
  source: DirectoryEntitySource;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  team: string;
  personaType: DirectoryPersonaType;
  audienceType: DirectoryAudienceType;
  identityKind: DirectoryIdentityKind;
  panelScope: DirectoryPanelScope;
  rolePresetId: DirectoryRolePresetId;
  accessLevel: AdminAccessLevel;
  status: AdminAccessStatus;
  inviteState: AdminInviteState;
  grantedPermissions: string[];
  revokedPermissions: string[];
  security: AdminUserSecurity;
  avatarHue: string;
  assignment: DirectoryAssignment;
  communication: DirectoryCommunicationProfile;
  featureToggles: DirectoryFeatureToggleId[];
  entityPath: string;
  tags: string[];
}

export interface AdminUserRecord extends DirectoryIdentityRecord {}

export interface AdminUsersKpiSnapshot {
  totalIdentities: number;
  operationalIdentities: number;
  vendorPanelIdentities: number;
  externalAccounts: number;
  mfaGapIdentities: number;
  customRoleIdentities: number;
}

export interface DirectorySelectOption {
  value: string;
  labelKey: string;
}

export const DIRECTORY_AUDIENCE_LABELS: Record<DirectoryAudienceType, string> = {
  super_admin: 'ADMIN_USERS.AUDIENCE.SUPER_ADMIN',
  vendor_network: 'ADMIN_USERS.AUDIENCE.VENDOR_NETWORK',
  drivers: 'ADMIN_USERS.AUDIENCE.DRIVERS',
  customers: 'ADMIN_USERS.AUDIENCE.CUSTOMERS'
};

export const DIRECTORY_PANEL_LABELS: Record<DirectoryPanelScope, string> = {
  super_admin_panel: 'ADMIN_USERS.PANELS.SUPER_ADMIN_PANEL',
  vendor_panel: 'ADMIN_USERS.PANELS.VENDOR_PANEL',
  driver_app: 'ADMIN_USERS.PANELS.DRIVER_APP',
  customer_app: 'ADMIN_USERS.PANELS.CUSTOMER_APP'
};

export const DIRECTORY_PERSONA_LABELS: Record<DirectoryPersonaType, string> = {
  super_admin_manager: 'ADMIN_USERS.PERSONAS.SUPER_ADMIN_MANAGER',
  super_admin_staff: 'ADMIN_USERS.PERSONAS.SUPER_ADMIN_STAFF',
  vendor_owner: 'ADMIN_USERS.PERSONAS.VENDOR_OWNER',
  vendor_company_manager: 'ADMIN_USERS.PERSONAS.VENDOR_COMPANY_MANAGER',
  vendor_branch_manager: 'ADMIN_USERS.PERSONAS.VENDOR_BRANCH_MANAGER',
  vendor_branch_employee: 'ADMIN_USERS.PERSONAS.VENDOR_BRANCH_EMPLOYEE',
  vendor_finance: 'ADMIN_USERS.PERSONAS.VENDOR_FINANCE',
  vendor_support: 'ADMIN_USERS.PERSONAS.VENDOR_SUPPORT',
  driver: 'ADMIN_USERS.PERSONAS.DRIVER',
  customer: 'ADMIN_USERS.PERSONAS.CUSTOMER'
};

export const DIRECTORY_LOCALE_LABELS: Record<DirectoryPreferredLocale, string> = {
  ar: 'ADMIN_USERS.LOCALE.AR',
  en: 'ADMIN_USERS.LOCALE.EN',
  bilingual: 'ADMIN_USERS.LOCALE.BILINGUAL'
};

export const PERMISSION_ACTION_LABELS: Record<PermissionActionId, string> = {
  view: 'ADMIN_USERS.PERMISSIONS.ACTIONS.VIEW',
  create: 'ADMIN_USERS.PERMISSIONS.ACTIONS.CREATE',
  edit: 'ADMIN_USERS.PERMISSIONS.ACTIONS.EDIT',
  approve: 'ADMIN_USERS.PERMISSIONS.ACTIONS.APPROVE',
  export: 'ADMIN_USERS.PERMISSIONS.ACTIONS.EXPORT',
  manage_settings: 'ADMIN_USERS.PERMISSIONS.ACTIONS.MANAGE_SETTINGS'
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'dashboard',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.DASHBOARD.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.DASHBOARD.DESC',
    actions: ['view', 'export'],
    panelScopes: ['super_admin_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'vendors',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDORS.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDORS.DESC',
    actions: ['view', 'edit', 'approve', 'export'],
    panelScopes: ['super_admin_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'catalog',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.CATALOG.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.CATALOG.DESC',
    actions: ['view', 'create', 'edit', 'approve', 'export'],
    panelScopes: ['super_admin_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'orders',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.ORDERS.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.ORDERS.DESC',
    actions: ['view', 'edit', 'approve', 'export'],
    panelScopes: ['super_admin_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'customers',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.CUSTOMERS.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.CUSTOMERS.DESC',
    actions: ['view', 'edit', 'export'],
    panelScopes: ['super_admin_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'drivers',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.DRIVERS.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.DRIVERS.DESC',
    actions: ['view', 'edit', 'approve', 'export'],
    panelScopes: ['super_admin_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'disputes',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.DISPUTES.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.DISPUTES.DESC',
    actions: ['view', 'edit', 'approve', 'export'],
    panelScopes: ['super_admin_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'finances',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.FINANCES.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.FINANCES.DESC',
    actions: ['view', 'edit', 'approve', 'export', 'manage_settings'],
    panelScopes: ['super_admin_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'users_access',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.USERS_ACCESS.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.USERS_ACCESS.DESC',
    actions: ['view', 'create', 'edit', 'approve', 'manage_settings'],
    panelScopes: ['super_admin_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'email_center',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.EMAIL_CENTER.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.EMAIL_CENTER.DESC',
    actions: ['view', 'edit', 'approve', 'manage_settings'],
    panelScopes: ['super_admin_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'system',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.SYSTEM.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.SYSTEM.DESC',
    actions: ['view', 'edit', 'manage_settings'],
    panelScopes: ['super_admin_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'marketing',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.MARKETING.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.MARKETING.DESC',
    actions: ['view', 'create', 'edit', 'approve', 'manage_settings'],
    panelScopes: ['super_admin_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'vendor_dashboard',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDOR_DASHBOARD.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDOR_DASHBOARD.DESC',
    actions: ['view', 'export'],
    panelScopes: ['vendor_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'vendor_orders',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDOR_ORDERS.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDOR_ORDERS.DESC',
    actions: ['view', 'edit', 'approve', 'export'],
    panelScopes: ['vendor_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'vendor_catalog',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDOR_CATALOG.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDOR_CATALOG.DESC',
    actions: ['view', 'create', 'edit', 'export'],
    panelScopes: ['vendor_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'vendor_branch_team',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDOR_BRANCH_TEAM.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDOR_BRANCH_TEAM.DESC',
    actions: ['view', 'create', 'edit', 'manage_settings'],
    panelScopes: ['vendor_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'vendor_finance',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDOR_FINANCE.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDOR_FINANCE.DESC',
    actions: ['view', 'edit', 'export', 'manage_settings'],
    panelScopes: ['vendor_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'vendor_support',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDOR_SUPPORT.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDOR_SUPPORT.DESC',
    actions: ['view', 'edit', 'export'],
    panelScopes: ['vendor_panel'],
    identityKinds: ['operational']
  },
  {
    id: 'vendor_settings',
    labelKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDOR_SETTINGS.TITLE',
    descriptionKey: 'ADMIN_USERS.PERMISSIONS.GROUPS.VENDOR_SETTINGS.DESC',
    actions: ['view', 'edit', 'manage_settings'],
    panelScopes: ['vendor_panel'],
    identityKinds: ['operational']
  }
];

export const DIRECTORY_FEATURE_TOGGLES: DirectoryFeatureToggleDefinition[] = [
  {
    id: 'driver.dispatch_notifications',
    labelKey: 'ADMIN_USERS.FEATURE_TOGGLES.DRIVER_DISPATCH.LABEL',
    descriptionKey: 'ADMIN_USERS.FEATURE_TOGGLES.DRIVER_DISPATCH.DESC',
    personaTypes: ['driver']
  },
  {
    id: 'driver.compliance_emails',
    labelKey: 'ADMIN_USERS.FEATURE_TOGGLES.DRIVER_COMPLIANCE.LABEL',
    descriptionKey: 'ADMIN_USERS.FEATURE_TOGGLES.DRIVER_COMPLIANCE.DESC',
    personaTypes: ['driver']
  },
  {
    id: 'driver.finance_digests',
    labelKey: 'ADMIN_USERS.FEATURE_TOGGLES.DRIVER_FINANCE.LABEL',
    descriptionKey: 'ADMIN_USERS.FEATURE_TOGGLES.DRIVER_FINANCE.DESC',
    personaTypes: ['driver']
  },
  {
    id: 'customer.marketing_opt_in',
    labelKey: 'ADMIN_USERS.FEATURE_TOGGLES.CUSTOMER_MARKETING.LABEL',
    descriptionKey: 'ADMIN_USERS.FEATURE_TOGGLES.CUSTOMER_MARKETING.DESC',
    personaTypes: ['customer']
  },
  {
    id: 'customer.support_escalations',
    labelKey: 'ADMIN_USERS.FEATURE_TOGGLES.CUSTOMER_ESCALATION.LABEL',
    descriptionKey: 'ADMIN_USERS.FEATURE_TOGGLES.CUSTOMER_ESCALATION.DESC',
    personaTypes: ['customer']
  },
  {
    id: 'customer.order_issue_updates',
    labelKey: 'ADMIN_USERS.FEATURE_TOGGLES.CUSTOMER_ISSUES.LABEL',
    descriptionKey: 'ADMIN_USERS.FEATURE_TOGGLES.CUSTOMER_ISSUES.DESC',
    personaTypes: ['customer']
  }
];

export function buildPermissionKey(domain: PermissionDomainId, action: PermissionActionId): string {
  return `${domain}.${action}`;
}

function expandPermissions(
  config: Partial<Record<PermissionDomainId, PermissionActionId[]>>
): string[] {
  return PERMISSION_GROUPS.flatMap((group) => {
    const actions = config[group.id] ?? [];
    return actions.map((action) => buildPermissionKey(group.id, action));
  });
}

export const DIRECTORY_ROLE_PRESETS: DirectoryRolePreset[] = [
  {
    id: 'super_admin',
    nameKey: 'ADMIN_USERS.PRESETS.SUPER_ADMIN.NAME',
    descriptionKey: 'ADMIN_USERS.PRESETS.SUPER_ADMIN.DESC',
    accessLevel: 'full',
    accent: '#127c8c',
    panelScope: 'super_admin_panel',
    audienceType: 'super_admin',
    identityKind: 'operational',
    personaTypes: ['super_admin_manager'],
    permissions: expandPermissions({
      dashboard: ['view', 'export'],
      vendors: ['view', 'edit', 'approve', 'export'],
      catalog: ['view', 'create', 'edit', 'approve', 'export'],
      orders: ['view', 'edit', 'approve', 'export'],
      customers: ['view', 'edit', 'export'],
      drivers: ['view', 'edit', 'approve', 'export'],
      disputes: ['view', 'edit', 'approve', 'export'],
      finances: ['view', 'edit', 'approve', 'export', 'manage_settings'],
      users_access: ['view', 'create', 'edit', 'approve', 'manage_settings'],
      email_center: ['view', 'edit', 'approve', 'manage_settings'],
      system: ['view', 'edit', 'manage_settings'],
      marketing: ['view', 'create', 'edit', 'approve', 'manage_settings']
    })
  },
  {
    id: 'operations_lead',
    nameKey: 'ADMIN_USERS.PRESETS.OPERATIONS_LEAD.NAME',
    descriptionKey: 'ADMIN_USERS.PRESETS.OPERATIONS_LEAD.DESC',
    accessLevel: 'restricted',
    accent: '#2563eb',
    panelScope: 'super_admin_panel',
    audienceType: 'super_admin',
    identityKind: 'operational',
    personaTypes: ['super_admin_manager', 'super_admin_staff'],
    permissions: expandPermissions({
      dashboard: ['view', 'export'],
      vendors: ['view', 'edit', 'approve', 'export'],
      catalog: ['view', 'edit', 'export'],
      orders: ['view', 'edit', 'approve', 'export'],
      customers: ['view', 'edit', 'export'],
      drivers: ['view', 'edit', 'approve', 'export'],
      disputes: ['view', 'edit', 'export'],
      email_center: ['view']
    })
  },
  {
    id: 'risk_admin',
    nameKey: 'ADMIN_USERS.PRESETS.RISK_ADMIN.NAME',
    descriptionKey: 'ADMIN_USERS.PRESETS.RISK_ADMIN.DESC',
    accessLevel: 'restricted',
    accent: '#dc2626',
    panelScope: 'super_admin_panel',
    audienceType: 'super_admin',
    identityKind: 'operational',
    personaTypes: ['super_admin_manager', 'super_admin_staff'],
    permissions: expandPermissions({
      dashboard: ['view', 'export'],
      vendors: ['view', 'approve', 'export'],
      orders: ['view', 'approve', 'export'],
      customers: ['view', 'export'],
      drivers: ['view', 'approve'],
      disputes: ['view', 'edit', 'approve', 'export'],
      email_center: ['view', 'approve']
    })
  },
  {
    id: 'finance_admin',
    nameKey: 'ADMIN_USERS.PRESETS.FINANCE_ADMIN.NAME',
    descriptionKey: 'ADMIN_USERS.PRESETS.FINANCE_ADMIN.DESC',
    accessLevel: 'restricted',
    accent: '#0f766e',
    panelScope: 'super_admin_panel',
    audienceType: 'super_admin',
    identityKind: 'operational',
    personaTypes: ['super_admin_manager', 'super_admin_staff'],
    permissions: expandPermissions({
      dashboard: ['view', 'export'],
      orders: ['view', 'export'],
      vendors: ['view', 'export'],
      disputes: ['view', 'export'],
      finances: ['view', 'edit', 'approve', 'export', 'manage_settings'],
      email_center: ['view', 'edit']
    })
  },
  {
    id: 'support_admin',
    nameKey: 'ADMIN_USERS.PRESETS.SUPPORT_ADMIN.NAME',
    descriptionKey: 'ADMIN_USERS.PRESETS.SUPPORT_ADMIN.DESC',
    accessLevel: 'observer',
    accent: '#7c3aed',
    panelScope: 'super_admin_panel',
    audienceType: 'super_admin',
    identityKind: 'operational',
    personaTypes: ['super_admin_staff'],
    permissions: expandPermissions({
      dashboard: ['view'],
      vendors: ['view'],
      catalog: ['view'],
      orders: ['view', 'export'],
      customers: ['view', 'edit'],
      drivers: ['view'],
      disputes: ['view'],
      email_center: ['view']
    })
  },
  {
    id: 'vendor_owner',
    nameKey: 'ADMIN_USERS.PRESETS.VENDOR_OWNER.NAME',
    descriptionKey: 'ADMIN_USERS.PRESETS.VENDOR_OWNER.DESC',
    accessLevel: 'full',
    accent: '#0f766e',
    panelScope: 'vendor_panel',
    audienceType: 'vendor_network',
    identityKind: 'operational',
    personaTypes: ['vendor_owner'],
    permissions: expandPermissions({
      vendor_dashboard: ['view', 'export'],
      vendor_orders: ['view', 'edit', 'approve', 'export'],
      vendor_catalog: ['view', 'create', 'edit', 'export'],
      vendor_branch_team: ['view', 'create', 'edit', 'manage_settings'],
      vendor_finance: ['view', 'edit', 'export', 'manage_settings'],
      vendor_support: ['view', 'edit', 'export'],
      vendor_settings: ['view', 'edit', 'manage_settings']
    })
  },
  {
    id: 'vendor_company_manager',
    nameKey: 'ADMIN_USERS.PRESETS.VENDOR_COMPANY_MANAGER.NAME',
    descriptionKey: 'ADMIN_USERS.PRESETS.VENDOR_COMPANY_MANAGER.DESC',
    accessLevel: 'restricted',
    accent: '#2563eb',
    panelScope: 'vendor_panel',
    audienceType: 'vendor_network',
    identityKind: 'operational',
    personaTypes: ['vendor_company_manager'],
    permissions: expandPermissions({
      vendor_dashboard: ['view', 'export'],
      vendor_orders: ['view', 'edit', 'approve', 'export'],
      vendor_catalog: ['view', 'create', 'edit', 'export'],
      vendor_branch_team: ['view', 'create', 'edit'],
      vendor_finance: ['view', 'export'],
      vendor_support: ['view', 'edit', 'export'],
      vendor_settings: ['view', 'edit']
    })
  },
  {
    id: 'vendor_branch_manager',
    nameKey: 'ADMIN_USERS.PRESETS.VENDOR_BRANCH_MANAGER.NAME',
    descriptionKey: 'ADMIN_USERS.PRESETS.VENDOR_BRANCH_MANAGER.DESC',
    accessLevel: 'restricted',
    accent: '#14b8a6',
    panelScope: 'vendor_panel',
    audienceType: 'vendor_network',
    identityKind: 'operational',
    personaTypes: ['vendor_branch_manager'],
    permissions: expandPermissions({
      vendor_dashboard: ['view'],
      vendor_orders: ['view', 'edit', 'export'],
      vendor_catalog: ['view', 'edit'],
      vendor_branch_team: ['view', 'edit'],
      vendor_support: ['view', 'edit']
    })
  },
  {
    id: 'vendor_branch_employee',
    nameKey: 'ADMIN_USERS.PRESETS.VENDOR_BRANCH_EMPLOYEE.NAME',
    descriptionKey: 'ADMIN_USERS.PRESETS.VENDOR_BRANCH_EMPLOYEE.DESC',
    accessLevel: 'observer',
    accent: '#f59e0b',
    panelScope: 'vendor_panel',
    audienceType: 'vendor_network',
    identityKind: 'operational',
    personaTypes: ['vendor_branch_employee'],
    permissions: expandPermissions({
      vendor_dashboard: ['view'],
      vendor_orders: ['view', 'edit'],
      vendor_catalog: ['view'],
      vendor_support: ['view']
    })
  },
  {
    id: 'vendor_finance_manager',
    nameKey: 'ADMIN_USERS.PRESETS.VENDOR_FINANCE_MANAGER.NAME',
    descriptionKey: 'ADMIN_USERS.PRESETS.VENDOR_FINANCE_MANAGER.DESC',
    accessLevel: 'restricted',
    accent: '#0891b2',
    panelScope: 'vendor_panel',
    audienceType: 'vendor_network',
    identityKind: 'operational',
    personaTypes: ['vendor_finance'],
    permissions: expandPermissions({
      vendor_dashboard: ['view'],
      vendor_orders: ['view', 'export'],
      vendor_finance: ['view', 'edit', 'export', 'manage_settings']
    })
  },
  {
    id: 'vendor_support_manager',
    nameKey: 'ADMIN_USERS.PRESETS.VENDOR_SUPPORT_MANAGER.NAME',
    descriptionKey: 'ADMIN_USERS.PRESETS.VENDOR_SUPPORT_MANAGER.DESC',
    accessLevel: 'restricted',
    accent: '#8b5cf6',
    panelScope: 'vendor_panel',
    audienceType: 'vendor_network',
    identityKind: 'operational',
    personaTypes: ['vendor_support'],
    permissions: expandPermissions({
      vendor_dashboard: ['view'],
      vendor_orders: ['view', 'edit'],
      vendor_support: ['view', 'edit', 'export']
    })
  },
  {
    id: 'driver_account',
    nameKey: 'ADMIN_USERS.PRESETS.DRIVER_ACCOUNT.NAME',
    descriptionKey: 'ADMIN_USERS.PRESETS.DRIVER_ACCOUNT.DESC',
    accessLevel: 'restricted',
    accent: '#0ea5e9',
    panelScope: 'driver_app',
    audienceType: 'drivers',
    identityKind: 'external',
    personaTypes: ['driver'],
    permissions: []
  },
  {
    id: 'customer_account',
    nameKey: 'ADMIN_USERS.PRESETS.CUSTOMER_ACCOUNT.NAME',
    descriptionKey: 'ADMIN_USERS.PRESETS.CUSTOMER_ACCOUNT.DESC',
    accessLevel: 'observer',
    accent: '#ec4899',
    panelScope: 'customer_app',
    audienceType: 'customers',
    identityKind: 'external',
    personaTypes: ['customer'],
    permissions: []
  }
];

export const ADMIN_ROLE_PRESETS = DIRECTORY_ROLE_PRESETS;

export function getRolePresetById(id: DirectoryRolePresetId): DirectoryRolePreset {
  const preset = DIRECTORY_ROLE_PRESETS.find((entry) => entry.id === id);

  return preset ?? DIRECTORY_ROLE_PRESETS[0];
}

export function getDefaultRolePresetForPersona(personaType: DirectoryPersonaType): DirectoryRolePresetId {
  switch (personaType) {
    case 'super_admin_manager':
      return 'super_admin';
    case 'super_admin_staff':
      return 'support_admin';
    case 'vendor_owner':
      return 'vendor_owner';
    case 'vendor_company_manager':
      return 'vendor_company_manager';
    case 'vendor_branch_manager':
      return 'vendor_branch_manager';
    case 'vendor_branch_employee':
      return 'vendor_branch_employee';
    case 'vendor_finance':
      return 'vendor_finance_manager';
    case 'vendor_support':
      return 'vendor_support_manager';
    case 'driver':
      return 'driver_account';
    case 'customer':
      return 'customer_account';
  }
}

export function getAudienceTypeByPersona(personaType: DirectoryPersonaType): DirectoryAudienceType {
  switch (personaType) {
    case 'super_admin_manager':
    case 'super_admin_staff':
      return 'super_admin';
    case 'vendor_owner':
    case 'vendor_company_manager':
    case 'vendor_branch_manager':
    case 'vendor_branch_employee':
    case 'vendor_finance':
    case 'vendor_support':
      return 'vendor_network';
    case 'driver':
      return 'drivers';
    case 'customer':
      return 'customers';
  }
}

export function getPanelScopeByPersona(personaType: DirectoryPersonaType): DirectoryPanelScope {
  switch (personaType) {
    case 'super_admin_manager':
    case 'super_admin_staff':
      return 'super_admin_panel';
    case 'vendor_owner':
    case 'vendor_company_manager':
    case 'vendor_branch_manager':
    case 'vendor_branch_employee':
    case 'vendor_finance':
    case 'vendor_support':
      return 'vendor_panel';
    case 'driver':
      return 'driver_app';
    case 'customer':
      return 'customer_app';
  }
}

export function getIdentityKindByPersona(personaType: DirectoryPersonaType): DirectoryIdentityKind {
  switch (personaType) {
    case 'driver':
    case 'customer':
      return 'external';
    default:
      return 'operational';
  }
}

export function isOperationalIdentity(identity: Pick<DirectoryIdentityRecord, 'identityKind'>): boolean {
  return identity.identityKind === 'operational';
}

export function isVendorNetworkPersona(personaType: DirectoryPersonaType): boolean {
  return getAudienceTypeByPersona(personaType) === 'vendor_network';
}

export function getFeatureToggleDefinitions(personaType: DirectoryPersonaType): DirectoryFeatureToggleDefinition[] {
  return DIRECTORY_FEATURE_TOGGLES.filter((toggle) => toggle.personaTypes.includes(personaType));
}
