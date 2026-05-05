export function toDateTimeLocalInput(value?: string | null): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (part: number): string => part.toString().padStart(2, '0');

  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes())
  ].join('');
}

export function toNullableUtcIso(value?: string | null): string | null {
  if (!value || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return '--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleString();
}

export function formatDateRange(startsAtUtc?: string | null, endsAtUtc?: string | null): string {
  if (!startsAtUtc && !endsAtUtc) {
    return 'نشط دائمًا';
  }

  if (startsAtUtc && endsAtUtc) {
    return `${formatDateTime(startsAtUtc)} - ${formatDateTime(endsAtUtc)}`;
  }

  return startsAtUtc ? `من ${formatDateTime(startsAtUtc)}` : `حتى ${formatDateTime(endsAtUtc)}`;
}

export function describeApiError(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return 'حدث خطأ ما. حاول مرة أخرى.';
  }

  const candidate = error as {
    status?: number;
    error?: {
      detail?: string;
      title?: string;
      errors?: Record<string, string[]>;
    };
    message?: string;
  };

  if (candidate.status === 401 || candidate.status === 403) {
    return 'جلسة الأدمن الحالية غير مخولة لتنفيذ هذا الإجراء.';
  }

  const validation = candidate.error?.errors;
  if (validation) {
    const firstKey = Object.keys(validation)[0];
    const firstMessage = firstKey ? validation[firstKey]?.[0] : null;
    if (firstMessage) {
      return firstMessage;
    }
  }

  return candidate.error?.detail ?? candidate.error?.title ?? candidate.message ?? 'حدث خطأ ما. حاول مرة أخرى.';
}

export function humanizeSectionType(sectionType: string): string {
  return sectionType
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim();
}
