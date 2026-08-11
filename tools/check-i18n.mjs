import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const i18nRoot = path.join(projectRoot, 'public', 'assets', 'i18n');
const arPath = path.join(i18nRoot, 'ar');
const enPath = path.join(i18nRoot, 'en');
const scanRoots = [
  path.join(projectRoot, 'src', 'app'),
  path.join(projectRoot, 'src', 'index.html')
];

const hardcodedSourceAllowlist = new Set([
  normalize('src/app/features/admin-users/services/admin-users.service.ts'),
  normalize('src/app/features/catalog/services/catalog.api.service.ts'),
  normalize('src/app/features/customers/data/customers.mock.ts'),
  normalize('src/app/features/dashboard/services/dashboard.api.service.ts'),
  normalize('src/app/features/disputes/services/disputes.api.service.ts'),
  normalize('src/app/features/drivers/data/drivers.mock.ts'),
  normalize('src/app/features/drivers/services/drivers.api.service.ts'),
  normalize('src/app/features/email-center/services/email-center.service.ts'),
  normalize('src/app/features/finances/services/finance.service.ts'),
  normalize('src/app/features/orders/data/orders.mock.ts'),
  normalize('src/app/features/vendors/services/vendor.api.service.ts')
]);

const failures = [];
const ar = readCatalog(arPath);
const en = readCatalog(enPath);
const arKeys = flattenKeys(ar);
const enKeys = flattenKeys(en);
const codeReferencedKeys = collectTranslationKeys(scanRoots);

for (const key of arKeys) {
  if (!enKeys.has(key)) {
    failures.push(`Missing in runtime English catalog: ${key}`);
  }
}

for (const key of enKeys) {
  if (!arKeys.has(key)) {
    failures.push(`Missing in runtime Arabic catalog: ${key}`);
  }
}

for (const key of codeReferencedKeys) {
  if (!enKeys.has(key)) {
    failures.push(`Referenced in code but missing in runtime English catalog: ${key}`);
  }

  if (!arKeys.has(key)) {
    failures.push(`Referenced in code but missing in runtime Arabic catalog: ${key}`);
  }
}

const englishCatalogRaw = collectJsonFiles(enPath)
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');
const englishArabicMatches = englishCatalogRaw.match(/[\u0600-\u06FF]/g);
if (englishArabicMatches) {
  failures.push(`Arabic characters found in runtime English catalog (${englishArabicMatches.length} matches).`);
}

for (const ref of collectFiles(scanRoots)) {
  const relativePath = normalize(path.relative(projectRoot, ref));
  if (hardcodedSourceAllowlist.has(relativePath)) {
    continue;
  }

  const content = fs.readFileSync(ref, 'utf8');
  scanForHardcodedHtmlText(relativePath, content);
}

if (failures.length > 0) {
  console.error('i18n check failed:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('i18n check passed.');

function scanForBilingualTernaries(relativePath, content) {
  const ternaryRegex = /(currentLang|translate\.currentLang|isRTL|lang)\s*===?\s*['"]ar['"]\s*\?\s*(['"`])([^'"`]+)\2\s*:\s*(['"`])([^'"`]+)\4/g;

  for (const match of content.matchAll(ternaryRegex)) {
    const [, , , leftBranch, , rightBranch] = match;
    if (shouldIgnoreTernary(leftBranch, rightBranch)) {
      continue;
    }

    failures.push(`Bilingual ternary in ${relativePath}: ${trimForLog(match[0])}`);
  }
}

function scanForHardcodedHtmlText(relativePath, content) {
  if (relativePath.endsWith('.ts')) {
    const inlineTemplateRegex = /template\s*:\s*`([\s\S]*?)`/g;
    for (const [, template] of content.matchAll(inlineTemplateRegex)) {
      scanMarkupForHardcodedText(relativePath, template);
    }
    return;
  }

  scanMarkupForHardcodedText(relativePath, content);
}

function scanMarkupForHardcodedText(relativePath, content) {
  const sanitized = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  const textNodeRegex = />\s*([^<>{}\n][^<>{}]*)\s*</g;
  for (const [, rawValue] of sanitized.matchAll(textNodeRegex)) {
    const value = rawValue.trim();
    if (!value || shouldIgnoreHtmlText(value)) {
      continue;
    }

    failures.push(`Hardcoded template text in ${relativePath}: ${trimForLog(value)}`);
  }
}

function shouldIgnoreHtmlText(value) {
  if (value.includes('{{') || value.includes('}}')) {
    return true;
  }

  if (value.length <= 1) {
    return true;
  }

  if (/^[0-9\s./:%+-]+$/.test(value)) {
    return true;
  }

  if (/^[a-z0-9_]+$/i.test(value)) {
    return true;
  }

  if (/^__[A-Z0-9_]+__$/.test(value)) {
    return true;
  }

  if (/^[^\p{L}\p{N}]+$/u.test(value)) {
    return true;
  }

  if (/[=<>|&[\](),:'"]/.test(value)) {
    return true;
  }

  if (/^(ltr|rtl)$/i.test(value)) {
    return true;
  }

  if (/^(AR|EN)(\s*\/\s*(AR|EN))+$/i.test(value)) {
    return true;
  }

  return false;
}

function shouldIgnoreTernary(leftBranch, rightBranch) {
  return [leftBranch, rightBranch].every((branch) => (
    isLocaleToken(branch) ||
    isDirectionToken(branch) ||
    isLanguageToggleToken(branch) ||
    isClassToken(branch)
  ));
}

function isLocaleToken(value) {
  return /^[a-z]{2}(?:-[A-Z]{2}(?:-u-ca-[a-z]+)?)?$/i.test(value);
}

function isDirectionToken(value) {
  return /^(rtl|ltr)$/i.test(value);
}

function isLanguageToggleToken(value) {
  return /^(AR|EN)$/i.test(value);
}

function isClassToken(value) {
  return /^[a-z0-9_:/.[\]%-]+(?:\s+[a-z0-9_:/.[\]%-]+)*$/i.test(value) && /[-:/.[\]%0-9]/.test(value);
}

function collectFiles(entries) {
  const files = [];

  for (const entry of entries) {
    if (!fs.existsSync(entry)) {
      continue;
    }

    const stat = fs.statSync(entry);
    if (stat.isFile()) {
      files.push(entry);
      continue;
    }

    for (const child of fs.readdirSync(entry, { withFileTypes: true })) {
      if (child.name === 'node_modules' || child.name === 'dist') {
        continue;
      }

      files.push(...collectFiles([path.join(entry, child.name)]));
    }
  }

  return files.filter((file) => /\.(html|ts)$/.test(file) && !file.endsWith('.spec.ts'));
}

function collectTranslationKeys(entries) {
  const keys = new Set();
  const translationKeyRegex = /(['"])([A-Z][A-Z0-9_]*(?:\.[A-Z0-9_]+)+)\1/g;

  for (const file of collectFiles(entries)) {
    const content = fs.readFileSync(file, 'utf8');

    for (const match of content.matchAll(translationKeyRegex)) {
      const key = match[2];
      if (!shouldTrackTranslationKey(content, match.index ?? 0, match[0], key)) {
        continue;
      }

      keys.add(key);
    }
  }

  return keys;
}

function shouldTrackTranslationKey(content, startIndex, rawMatch, key) {
  if (key.endsWith('_')) {
    return false;
  }

  // These are relative aliases used below a dynamically supplied prefix.
  if (key.startsWith('TITLES.') || key.startsWith('SUBTITLES.')) {
    return false;
  }

  const endIndex = startIndex + rawMatch.length;
  const previousChar = findSignificantChar(content, startIndex - 1, -1);
  const nextChar = findSignificantChar(content, endIndex, 1);

  if (previousChar === '+' || nextChar === '+') {
    return false;
  }

  return true;
}

function findSignificantChar(content, index, step) {
  let cursor = index;

  while (cursor >= 0 && cursor < content.length) {
    const value = content[cursor];
    if (!/\s/.test(value)) {
      return value;
    }

    cursor += step;
  }

  return '';
}

function flattenKeys(source, prefix = '', result = new Set()) {
  for (const [key, value] of Object.entries(source)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    result.add(nextKey);

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenKeys(value, nextKey, result);
    }
  }

  return result;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
}

function readCatalog(directoryPath) {
  const result = {};

  for (const filePath of collectJsonFiles(directoryPath)) {
    mergeObjects(result, readJson(filePath));
  }

  return result;
}

function collectJsonFiles(directoryPath) {
  return fs.readdirSync(directoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(directoryPath, entry.name))
    .sort();
}

function mergeObjects(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      target[key] ??= {};
      mergeObjects(target[key], value);
      continue;
    }

    target[key] = value;
  }
}

function trimForLog(value) {
  return value.replace(/\s+/g, ' ').slice(0, 140);
}

function normalize(value) {
  return value.replace(/\\/g, '/');
}
