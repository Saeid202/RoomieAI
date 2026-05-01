export function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateUniqueSlug(base: string, existingSlugs: string[]): string {
  const slug = generateSlug(base);
  if (!existingSlugs.includes(slug)) return slug;
  let i = 2;
  while (existingSlugs.includes(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}
