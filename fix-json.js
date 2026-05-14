const fs = require('fs');

function addKeys(filePath, keys) {
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let added = 0;
  for (const [dotPath, value] of Object.entries(keys)) {
    const parts = dotPath.split('.');
    let obj = json;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    if (!obj[parts[parts.length - 1]]) {
      obj[parts[parts.length - 1]] = value;
      added++;
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`${filePath}: added ${added} keys`);
}

const enKeys = {
  // KPI labels
  "FINANCES.KPI.GROSS_COLLECTIONS": "Gross Collections",
  "FINANCES.KPI.PLATFORM_NET_REVENUE": "Net Revenue",
  "FINANCES.KPI.COMMISSION_REVENUE": "Commission Revenue",
  "FINANCES.KPI.DELIVERY_REVENUE": "Delivery Revenue",
  "FINANCES.KPI.COD_FEES_COLLECTED": "COD Fees",
  "FINANCES.KPI.VAT_COLLECTED": "VAT Collected",
  "FINANCES.KPI.DRIVER_PAYOUTS": "Driver Payouts",
  "FINANCES.KPI.REFUND_EXPOSURE": "Refund Exposure",
  "FINANCES.KPI.NET_REVENUE": "Net Revenue",
  "FINANCES.KPI.COD_FEES": "COD Fees",
  "FINANCES.KPI.VS_LAST_MONTH": "vs last month",

  // Narratives
  "FINANCES.NARRATIVES.IMPROVING": "Momentum improving",
  "FINANCES.NARRATIVES.ATTENTION": "Needs attention",
  "FINANCES.NARRATIVES.STEADY": "Holding steady",

  // Actions
  "FINANCES.ACTIONS.OPEN": "Open",

  // Currency
  "FINANCES.CURRENCY": "SAR"
};

const arKeys = {
  // KPI labels
  "FINANCES.KPI.GROSS_COLLECTIONS": "إجمالي التحصيلات",
  "FINANCES.KPI.PLATFORM_NET_REVENUE": "صافي الإيرادات",
  "FINANCES.KPI.COMMISSION_REVENUE": "إيرادات العمولات",
  "FINANCES.KPI.DELIVERY_REVENUE": "إيرادات التوصيل",
  "FINANCES.KPI.COD_FEES_COLLECTED": "رسوم الدفع عند الاستلام",
  "FINANCES.KPI.VAT_COLLECTED": "ضريبة القيمة المضافة",
  "FINANCES.KPI.DRIVER_PAYOUTS": "مدفوعات السائقين",
  "FINANCES.KPI.REFUND_EXPOSURE": "التعرض للاسترداد",
  "FINANCES.KPI.NET_REVENUE": "صافي الإيرادات",
  "FINANCES.KPI.COD_FEES": "رسوم الدفع عند الاستلام",
  "FINANCES.KPI.VS_LAST_MONTH": "مقارنة بالشهر الماضي",

  // Narratives
  "FINANCES.NARRATIVES.IMPROVING": "زخم متصاعد",
  "FINANCES.NARRATIVES.ATTENTION": "يحتاج انتباه",
  "FINANCES.NARRATIVES.STEADY": "مستقر",

  // Actions
  "FINANCES.ACTIONS.OPEN": "فتح",

  // Currency
  "FINANCES.CURRENCY": "ر.س"
};

addKeys('public/assets/i18n/en.json', enKeys);
addKeys('public/assets/i18n/ar.json', arKeys);

try { JSON.parse(fs.readFileSync('public/assets/i18n/en.json','utf8')); console.log('en.json: VALID'); } catch(e) { console.log('en.json INVALID:', e.message); }
try { JSON.parse(fs.readFileSync('public/assets/i18n/ar.json','utf8')); console.log('ar.json: VALID'); } catch(e) { console.log('ar.json INVALID:', e.message); }
