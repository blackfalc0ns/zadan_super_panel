const nameEn = undefined;
const nameAr = 'منتج';
const source = nameEn || nameAr || '';
const generatedSlug = source
  .toLowerCase()
  .trim()
  .replace(/[^\u0600-\u06FFa-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '');
console.log(generatedSlug);
