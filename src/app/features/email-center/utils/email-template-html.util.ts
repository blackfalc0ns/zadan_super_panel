import { EmailPreviewLocale, EmailTemplatePreview } from '../models/email-center.models';

const EMAIL_LOGO_URL = 'https://ik.imagekit.io/fnyx4x87z/logo/%D8%B4%D9%81%D8%A7%D9%81%20(4).png';

const SAMPLE_VARIABLE_VALUES: Record<string, string> = {
  '{{customer_name}}': 'Ahmed Al-Rashid',
  '{{order_number}}': 'ZD-10482',
  '{{vendor_name}}': 'Al Noor Kitchen',
  '{{order_total}}': '128.50',
  '{{currency}}': 'SAR',
  '{{update_message}}': 'Your order is being prepared and will ship shortly.',
  '{{week_label}}': 'Week 24 · Jun 9–15',
  '{{summary_body}}': '12 orders · SAR 4,820 revenue · 3 pending actions',
  '{{full_name}}': 'Sara Al-Qahtani',
  '{{expiry_date}}': 'Jul 15, 2026',
  '{{invite_link}}': 'https://admin.zadna0.com/onboarding',
  '{{branch_name}}': 'Riyadh North Branch',
  '{{reset_link}}': 'https://admin.zadna0.com/reset',
  '{{requested_at}}': 'Jul 9, 2026 · 10:30 AM',
  '{{business_date}}': 'Jul 9, 2026',
  '{{driver_name}}': 'Khalid Al-Otaibi',
  '{{status}}': 'Approved',
  '{{driver_note}}': 'Documents verified successfully.',
  '{{amount}}': 'SAR 420.00',
  '{{payout_reference}}': 'PAY-2026-0712',
  '{{case_number}}': 'SUP-8821',
  '{{case_type}}': 'Delivery delay',
  '{{support_message}}': 'Our team is reviewing your case.',
  '{{next_step}}': 'We will update you within 24 hours.',
  '{{target_url}}': 'https://vendor.zadna0.com/dashboard'
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderTemplateText(template: string, useSampleValues: boolean): string {
  if (!useSampleValues) {
    return template;
  }

  let result = template;
  for (const [token, sample] of Object.entries(SAMPLE_VARIABLE_VALUES)) {
    result = result.replaceAll(token, sample);
  }

  return result;
}

function resolveHeroUrl(
  locale: EmailPreviewLocale,
  template: EmailTemplatePreview
): string | null {
  const fallback = template.heroImageUrl?.trim() || null;
  const localeUrl = locale === 'ar'
    ? template.heroImageUrlAr?.trim()
    : template.heroImageUrlEn?.trim();

  return localeUrl || fallback;
}

export function buildEmailTemplatePreviewHtml(
  template: EmailTemplatePreview,
  options?: {
    previewLocale?: EmailPreviewLocale;
    targetUrl?: string | null;
    useSampleValues?: boolean;
  }
): string {
  const previewLocale = options?.previewLocale ?? 'en';
  const useSampleValues = options?.useSampleValues ?? true;
  const targetUrl = options?.targetUrl?.trim() || null;

  const subjectEn = renderTemplateText(template.subject.en ?? '', useSampleValues);
  const bodyEn = renderTemplateText(template.body.en ?? '', useSampleValues);
  const subjectAr = renderTemplateText(template.subject.ar ?? '', useSampleValues);
  const bodyAr = renderTemplateText(template.body.ar ?? '', useSampleValues);
  const heroUrlEn = resolveHeroUrl('en', template);
  const heroUrlAr = resolveHeroUrl('ar', template);
  const ctaLabel = template.ctaLabel?.trim() || 'Open related workspace';

  const showEnglish = Boolean(subjectEn || bodyEn || heroUrlEn);
  const showArabic = Boolean(subjectAr || bodyAr);

  let html = `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#132126;background:#edf7f8;padding:12px 8px">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #c7e3e7;border-radius:10px;overflow:hidden">
        <div style="background:#007f92;padding:9px 12px;text-align:center">
          <img src="${EMAIL_LOGO_URL}" width="72" alt="Zadna" style="display:block;width:72px;max-width:72px;height:auto;border:0;margin:0 auto" />
        </div>
        <div style="padding:18px 20px 18px">
  `;

  if (showEnglish && heroUrlEn) {
    html += `
      <div style="max-width:440px;margin:0 auto 16px;border:1px solid #c7e3e7;border-radius:10px;overflow:hidden;background:#f7fbfc">
        <img src="${escapeHtml(heroUrlEn)}" width="440" alt="Zadna update" style="display:block;width:100%;max-width:440px;height:auto;border:0;margin:0 auto" />
      </div>
    `;
  }

  if (showEnglish && subjectEn) {
    html += `<h2 style="margin:0 0 10px;color:#073843;font-size:18px;line-height:1.25">${escapeHtml(subjectEn)}</h2>`;
  }

  if (showEnglish && bodyEn) {
    html += `
      <div style="margin:12px 0 0;padding:12px 14px;background:#f7fbfc;border:1px solid #c7e3e7;border-radius:8px">
        <p style="margin:0;color:#132126">${escapeHtml(bodyEn)}</p>
      </div>
    `;
  }

  if (showArabic && (subjectAr || bodyAr)) {
    html += `<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0" />`;
    html += `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif">`;

    if (heroUrlAr && heroUrlAr !== heroUrlEn) {
      html += `
        <div style="max-width:440px;margin:0 auto 16px;border:1px solid #c7e3e7;border-radius:10px;overflow:hidden;background:#f7fbfc">
          <img src="${escapeHtml(heroUrlAr)}" width="440" alt="تحديث من زادنا" style="display:block;width:100%;max-width:440px;height:auto;border:0;margin:0 auto" />
        </div>
      `;
    }

    if (subjectAr) {
      html += `<h3 style="margin:0 0 8px;color:#073843;font-size:18px;line-height:1.35">${escapeHtml(subjectAr)}</h3>`;
    }

    if (bodyAr) {
      html += `
        <div style="margin:12px 0 0;padding:12px 14px;background:#f7fbfc;border:1px solid #c7e3e7;border-radius:8px">
          <p style="margin:0;color:#132126">${escapeHtml(bodyAr)}</p>
        </div>
      `;
    }

    html += `</div>`;
  }

  if (targetUrl) {
    html += `
      <p style="margin-top:20px">
        <a href="${escapeHtml(targetUrl)}" style="display:inline-block;background:#007f92;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;border-bottom:3px solid #f08010">
          ${escapeHtml(ctaLabel)}
        </a>
      </p>
    `;
  }

  html += `</div></div></div>`;
  return html;
}
