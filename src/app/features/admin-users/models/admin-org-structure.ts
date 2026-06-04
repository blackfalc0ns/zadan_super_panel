export type AdminDepartmentId =
  | 'executive'
  | 'operations'
  | 'risk_compliance'
  | 'finance'
  | 'support'
  | 'technology';

export interface AdminTeamDefinition {
  id: string;
  value: string;
  labelKey: string;
}

export interface AdminDepartmentDefinition {
  id: AdminDepartmentId;
  value: string;
  labelKey: string;
  teams: AdminTeamDefinition[];
}

export const ADMIN_DEPARTMENT_STRUCTURE: AdminDepartmentDefinition[] = [
  {
    id: 'executive',
    value: 'Executive',
    labelKey: 'ADMIN_USERS.ORG.DEPARTMENTS.EXECUTIVE',
    teams: [
      { id: 'platform_leadership', value: 'Platform Leadership', labelKey: 'ADMIN_USERS.ORG.TEAMS.PLATFORM_LEADERSHIP' },
      { id: 'administration', value: 'Administration', labelKey: 'ADMIN_USERS.ORG.TEAMS.ADMINISTRATION' }
    ]
  },
  {
    id: 'operations',
    value: 'Operations',
    labelKey: 'ADMIN_USERS.ORG.DEPARTMENTS.OPERATIONS',
    teams: [
      { id: 'operations_core', value: 'Core Operations', labelKey: 'ADMIN_USERS.ORG.TEAMS.OPERATIONS_CORE' },
      { id: 'vendor_operations', value: 'Vendor Operations', labelKey: 'ADMIN_USERS.ORG.TEAMS.VENDOR_OPERATIONS' },
      { id: 'fleet_operations', value: 'Fleet & Drivers', labelKey: 'ADMIN_USERS.ORG.TEAMS.FLEET_OPERATIONS' }
    ]
  },
  {
    id: 'risk_compliance',
    value: 'Risk & Compliance',
    labelKey: 'ADMIN_USERS.ORG.DEPARTMENTS.RISK_COMPLIANCE',
    teams: [
      { id: 'risk_desk', value: 'Risk Desk', labelKey: 'ADMIN_USERS.ORG.TEAMS.RISK_DESK' },
      { id: 'disputes_review', value: 'Disputes Review', labelKey: 'ADMIN_USERS.ORG.TEAMS.DISPUTES_REVIEW' }
    ]
  },
  {
    id: 'finance',
    value: 'Finance',
    labelKey: 'ADMIN_USERS.ORG.DEPARTMENTS.FINANCE',
    teams: [
      { id: 'finance_ops', value: 'Finance Operations', labelKey: 'ADMIN_USERS.ORG.TEAMS.FINANCE_OPS' },
      { id: 'settlements', value: 'Settlements', labelKey: 'ADMIN_USERS.ORG.TEAMS.SETTLEMENTS' }
    ]
  },
  {
    id: 'support',
    value: 'Customer Support',
    labelKey: 'ADMIN_USERS.ORG.DEPARTMENTS.SUPPORT',
    teams: [
      { id: 'support_desk', value: 'Support Desk', labelKey: 'ADMIN_USERS.ORG.TEAMS.SUPPORT_DESK' },
      { id: 'email_center', value: 'Email Center', labelKey: 'ADMIN_USERS.ORG.TEAMS.EMAIL_CENTER' }
    ]
  },
  {
    id: 'technology',
    value: 'Technology',
    labelKey: 'ADMIN_USERS.ORG.DEPARTMENTS.TECHNOLOGY',
    teams: [
      { id: 'platform_engineering', value: 'Platform Engineering', labelKey: 'ADMIN_USERS.ORG.TEAMS.PLATFORM_ENGINEERING' },
      { id: 'data_analytics', value: 'Data & Analytics', labelKey: 'ADMIN_USERS.ORG.TEAMS.DATA_ANALYTICS' }
    ]
  }
];

export const ADMIN_ROLE_ORG_DEFAULTS: Record<string, { departmentId: AdminDepartmentId; teamId: string }> = {
  super_admin_all: { departmentId: 'executive', teamId: 'platform_leadership' },
  admin_operations: { departmentId: 'operations', teamId: 'operations_core' },
  risk_admin: { departmentId: 'risk_compliance', teamId: 'risk_desk' },
  finance_admin: { departmentId: 'finance', teamId: 'finance_ops' },
  support_admin: { departmentId: 'support', teamId: 'support_desk' }
};

export function findAdminDepartmentByValue(value: string | null | undefined): AdminDepartmentDefinition | undefined {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }

  return ADMIN_DEPARTMENT_STRUCTURE.find((entry) => entry.value === normalized || entry.id === normalized);
}

export function findAdminTeamByValue(
  department: AdminDepartmentDefinition | undefined,
  value: string | null | undefined
): AdminTeamDefinition | undefined {
  const normalized = value?.trim();
  if (!department || !normalized) {
    return undefined;
  }

  return department.teams.find((entry) => entry.value === normalized || entry.id === normalized);
}

export function resolveAdminOrgDefaultsForRoleCode(roleCode: string | null | undefined): {
  department: AdminDepartmentDefinition;
  team: AdminTeamDefinition;
} | null {
  const mapping = roleCode ? ADMIN_ROLE_ORG_DEFAULTS[roleCode] : undefined;
  if (!mapping) {
    return null;
  }

  const department = ADMIN_DEPARTMENT_STRUCTURE.find((entry) => entry.id === mapping.departmentId);
  const team = department?.teams.find((entry) => entry.id === mapping.teamId);
  if (!department || !team) {
    return null;
  }

  return { department, team };
}
