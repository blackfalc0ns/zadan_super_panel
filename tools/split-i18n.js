const fs = require('fs');
const path = require('path');

const groups = {
  common: ['COMMON', 'VALIDATION', 'UNAUTHORIZED', 'LOGIN', 'FORGOT_PASSWORD_PAGE', 'RESET_PASSWORD_PAGE', 'WORKFLOW_LINKS', 'SIDEBAR', 'SIDEBAR_EXTRA', 'HEADER_SEARCH', 'MODALS', 'ADMIN_PROFILE', 'NOTIFICATIONS_CENTER', 'FINANCES'],
  dashboard: ['DASHBOARD', 'LIVE_OPS_PAGE', 'SYSTEM_LOGS'],
  vendors: ['VENDORS', 'VENDOR_DETAIL', 'COMPLIANCE', 'VENDOR_REVIEW', 'ACTIVITY_LOG', 'VENDOR_PRODUCTS', 'VENDOR_ORDERS', 'VENDOR_FINANCE', 'VENDOR_OVERVIEW', 'VENDOR_SETTINGS', 'VENDOR_ANALYTICS', 'VENDOR_DISPUTES'],
  catalog: ['CATALOG', 'BRANDS', 'BRAND', 'CATEGORIES', 'ASSETS', 'PRODUCTS', 'MASTER_PRODUCTS'],
  orders: ['ORDERS', 'ORDERS_LIST', 'DISPUTES_DASHBOARD', 'SUPPORT_ADMIN'],
  users: ['CUSTOMERS', 'DRIVERS', 'ADMIN_USERS'],
  marketing: ['MARKETING', 'EMAIL_CENTER']
};

const languages = ['ar', 'en'];
const baseDir = path.join(__dirname, '../public/assets/i18n');

languages.forEach((lang) => {
  const filePath = path.join(baseDir, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const rawData = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(rawData);
  const dataKeys = Object.keys(data);

  // Initialize group objects
  const outputs = {};
  Object.keys(groups).forEach((groupName) => {
    outputs[groupName] = {};
  });

  // Distribute keys
  dataKeys.forEach((key) => {
    let matched = false;
    for (const [groupName, keysList] of Object.entries(groups)) {
      if (keysList.includes(key)) {
        outputs[groupName][key] = data[key];
        matched = true;
        break;
      }
    }

    if (!matched) {
      console.warn(`[Warning] Key "${key}" in ${lang}.json did not match any group. Adding to "common".`);
      outputs['common'][key] = data[key];
    }
  });

  // Ensure output directory exists
  const langDir = path.join(baseDir, lang);
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }

  // Write files
  Object.entries(outputs).forEach(([groupName, content]) => {
    const outputPath = path.join(langDir, `${groupName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf8');
    console.log(`Wrote ${outputPath} (${Object.keys(content).length} keys)`);
  });
});

console.log('Successfully split translation files!');
