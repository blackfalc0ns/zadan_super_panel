import { extractApiValidationMessages } from '@shared/utils/api-error.util';

export function toDateTimeLocalInput(value?: string | null): string {
 if (!value) {
 return '';
 }

 const date = new Date(value);
 if (Number.isNaN(date.getTime())) {
 return '';
 }

 const parts = new Intl.DateTimeFormat('en-CA', {
 timeZone: 'Asia/Riyadh',
 year: 'numeric',
 month: '2-digit',
 day: '2-digit',
 hour: '2-digit',
 minute: '2-digit',
 hourCycle: 'h23'
 }).formatToParts(date);
 const part = (type: Intl.DateTimeFormatPartTypes): string =>
 parts.find((item) => item.type === type)?.value ?? '';

 return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
}

export function toNullableUtcIso(value?: string | null): string | null {
 if (!value ||!value.trim()) {
 return null;
 }

 const normalized = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value)
 ? value
 : `${value.length === 16 ? `${value}:00` : value}+03:00`;
 const parsed = new Date(normalized);
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

 return date.toLocaleString(undefined, { timeZone: 'Asia/Riyadh' });
}

export function formatDateRange(startsAtUtc?: string | null, endsAtUtc?: string | null): string {
 if (!startsAtUtc &&!endsAtUtc) {
 return isArabic() ? 'نشط دائمًا' : 'Always active';
 }

 if (startsAtUtc && endsAtUtc) {
 return `${formatDateTime(startsAtUtc)} - ${formatDateTime(endsAtUtc)}`;
 }

 return startsAtUtc
 ? `${isArabic() ? 'من' : 'From'} ${formatDateTime(startsAtUtc)}`
 : `${isArabic() ? 'حتى' : 'Until'} ${formatDateTime(endsAtUtc)}`;
}

export function describeApiError(error: unknown): string {
 const fallback = text(
 'صار خطأ. جرّب مرة ثانية.',
 'Something went wrong. Please try again.'
 );

 if (typeof error!== 'object' || error === null) {
 return fallback;
 }

 const candidate = error as {
 status?: number;
 error?: {
 detail?: string;
 message?: string;
 title?: string;
 errors?: Record<string, string[] | string>;
 };
 message?: string;
 };

 if (candidate.status === 0) {
 return text(
 'ما قدرنا نتصل بالسيرفر. تأكد أن الـ API يعمل ثم جرّب مرة ثانية.',
 'Could not connect to the server. Please ensure the API is running and try again.'
 );
 }

 if (candidate.status === 401 || candidate.status === 403) {
 return text(
 'جلسة المشرف الحالية ما عندها صلاحية لتنفيذ هذا الإجراء.',
 'Your current admin session is not authorized to perform this action.'
 );
 }

 if (candidate.status === 409) {
 return text(
 'هذا التغيير يتعارض مع بيانات موجودة. راجع القيم ثم جرّب مرة ثانية.',
 'This change conflicts with existing data. Review the values and try again.'
 );
 }

 const validationMessages = extractApiValidationMessages(error);
 if (validationMessages.length) {
 return validationMessages.join(' ');
 }

 return candidate.error?.detail
 ?? candidate.error?.message
 ?? candidate.error?.title
 ?? candidate.message
 ?? fallback;
}

export function humanizeSectionType(sectionType: string): string {
 return sectionType.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').trim();
}

function text(ar: string, en: string): string {
 return isArabic() ? ar : en;
}

function isArabic(): boolean {
 return (localStorage.getItem('lang') || localStorage.getItem('vendor_lang') || 'ar').toLowerCase().startsWith('ar');
}
