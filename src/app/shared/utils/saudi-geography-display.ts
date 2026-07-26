import { TranslateService } from '@ngx-translate/core';

const CITY_ALIASES: Record<string, string> = {
  RIYADH: 'RIYADH',
  الرياض: 'RIYADH',
  JEDDAH: 'JEDDAH',
  جدة: 'JEDDAH',
  DAMMAM: 'DAMMAM',
  الدمام: 'DAMMAM',
  MAKKAH: 'MAKKAH',
  MECCA: 'MAKKAH',
  مكة: 'MAKKAH',
  MADINAH: 'MADINAH',
  MEDINA: 'MADINAH',
  المدينة: 'MADINAH',
  TAIF: 'TAIF',
  الطائف: 'TAIF',
  TABUK: 'TABUK',
  TABUK_CITY: 'TABUK',
  تبوك: 'TABUK',
  ABHA: 'ABHA',
  أبها: 'ABHA',
  KHOBAR: 'KHOBAR',
  AL_KHOBAR: 'KHOBAR',
  الخبر: 'KHOBAR',
  QATIF: 'QATIF',
  القطيف: 'QATIF',
  DHAHRAN: 'DHAHRAN',
  الظهران: 'DHAHRAN',
  JUBAIL: 'JUBAIL',
  الجبيل: 'JUBAIL',
  HOFUF: 'HOFUF',
  AHSA: 'HOFUF',
  ALAHSA: 'HOFUF',
  الهفوف: 'HOFUF',
  MUBARRAZ: 'MUBARRAZ',
  المبرز: 'MUBARRAZ',
  KHAFJI: 'KHAFJI',
  الخفجي: 'KHAFJI',
  HAFR_AL_BATIN: 'HAFR_AL_BATIN',
  HAFRALBATIN: 'HAFR_AL_BATIN',
  'حفر الباطن': 'HAFR_AL_BATIN',
  RAS_TANURA: 'RAS_TANURA',
  RASTANURA: 'RAS_TANURA',
  'رأس تنورة': 'RAS_TANURA',
  ABQAIQ: 'ABQAIQ',
  بقيق: 'ABQAIQ',
  NAIRYAH: 'NAIRYAH',
  النعيرية: 'NAIRYAH',
  SAIHAT: 'SAIHAT',
  سيهات: 'SAIHAT',
  TARUT: 'TARUT',
  تاروت: 'TARUT',
  SAFWA: 'SAFWA',
  صفوى: 'SAFWA',
  AWAMIYAH: 'AWAMIYAH',
  العوامية: 'AWAMIYAH',
  RAHIMAH: 'RAHIMAH',
  RAHIMA: 'RAHIMAH',
  رحيمة: 'RAHIMAH',
  YANBU: 'YANBU',
  ينبع: 'YANBU',
  HAIL: 'HAIL',
  HAIL_CITY: 'HAIL',
  حائل: 'HAIL',
  JIZAN: 'JIZAN',
  JAZAN: 'JIZAN',
  JIZAN_CITY: 'JIZAN',
  جازان: 'JIZAN',
  NAJRAN: 'NAJRAN',
  NAJRAN_CITY: 'NAJRAN',
  نجران: 'NAJRAN',
  BURAYDAH: 'BURAYDAH',
  BURAIDAH: 'BURAYDAH',
  بريدة: 'BURAYDAH'
};

const REGION_ALIASES: Record<string, string> = {
  EASTERN: 'EASTERN',
  EASTERNREGION: 'EASTERN',
  EASTERNPROVINCE: 'EASTERN',
  EASTERN_REGION: 'EASTERN',
  'EASTERN REGION': 'EASTERN',
  'المنطقة الشرقية': 'EASTERN',
  RIYADH: 'RIYADH',
  RIYADHREGION: 'RIYADH',
  CENTRAL: 'CENTRAL',
  'منطقة الرياض': 'RIYADH',
  'المنطقة الوسطى': 'CENTRAL',
  MAKKAH: 'MAKKAH',
  MAKKAHREGION: 'MAKKAH',
  WESTERN: 'WESTERN',
  'منطقة مكة': 'MAKKAH',
  'المنطقة الغربية': 'WESTERN',
  MADINAH: 'MADINAH',
  MADINAHREGION: 'MADINAH',
  'منطقة المدينة': 'MADINAH',
  NORTHERN: 'NORTHERN',
  'المنطقة الشمالية': 'NORTHERN',
  SOUTHERN: 'SOUTHERN',
  'المنطقة الجنوبية': 'SOUTHERN'
};

function normalizeKey(value: string): string {
  return value.trim().replace(/[\s_-]+/g, '').toUpperCase();
}

function translateOrFallback(
  translate: TranslateService,
  key: string,
  fallback: string
): string {
  const translated = translate.instant(key);
  return translated === key ? fallback : translated;
}

export function saudiCityTranslationKey(city?: string | null): string | null {
  if (!city?.trim()) {
    return null;
  }

  const trimmed = city.trim();
  const alias = CITY_ALIASES[trimmed] || CITY_ALIASES[normalizeKey(trimmed)] || normalizeKey(trimmed);
  return `COMMON.CITIES.${alias}`;
}

export function localizeSaudiCity(
  translate: TranslateService,
  city?: string | null
): string {
  if (!city?.trim()) {
    return '';
  }

  const trimmed = city.trim();
  const key = saudiCityTranslationKey(trimmed)!;
  return translateOrFallback(translate, key, trimmed);
}

export function localizeSaudiRegion(
  translate: TranslateService,
  region?: string | null
): string {
  if (!region?.trim()) {
    return '';
  }

  const trimmed = region.trim();
  const alias =
    REGION_ALIASES[trimmed] ||
    REGION_ALIASES[normalizeKey(trimmed)] ||
    normalizeKey(trimmed);
  const localized = translateOrFallback(translate, `COMMON.REGIONS.${alias}`, '');
  if (localized) {
    return localized;
  }

  // Some records incorrectly store a city code in the region field.
  return localizeSaudiCity(translate, trimmed);
}
