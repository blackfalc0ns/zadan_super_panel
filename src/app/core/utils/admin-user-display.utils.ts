import { AdminUser } from '../services/auth.service';
import { ADMIN_ROLE_PRESETS, type DirectoryRolePreset } from '../../features/admin-users/public-api';

export function getAdminUserInitials(fullName?: string | null): string {
  const source = fullName?.trim() ?? '';
  if (!source) {
    return 'AD';
  }

  const parts = source.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export function resolveAdminRoleLabelKey(user: AdminUser | null): string | null {
  if (!user) {
    return null;
  }

  const roleCode = (user.access?.activeScope?.roleCode ?? user.role ?? '').toLowerCase();
  const preset = ADMIN_ROLE_PRESETS.find((entry: DirectoryRolePreset) =>
    roleCode === entry.id
    || roleCode.startsWith(`${entry.id}_`)
    || roleCode.includes(entry.id));

  if (preset) {
    return preset.nameKey;
  }

  if (roleCode.includes('super_admin') || user.role === 'SuperAdmin') {
    return 'ADMIN_USERS.PRESETS.SUPER_ADMIN.NAME';
  }

  return null;
}

export function getAdminRoleDisplayName(user: AdminUser | null): string {
  return user?.access?.activeScope?.roleName?.trim()
    || user?.role?.trim()
    || 'Admin';
}

export function getAdminUserShortId(userId?: string | null): string {
  const normalized = userId?.trim() ?? '';
  if (!normalized) {
    return '—';
  }

  return normalized.length > 8 ? normalized.slice(0, 8).toUpperCase() : normalized.toUpperCase();
}

export function getAdminUserContactLine(user: AdminUser | null): string | null {
  const email = user?.email?.trim();
  if (email) {
    return email;
  }

  const phone = user?.phone?.trim();
  return phone || null;
}
