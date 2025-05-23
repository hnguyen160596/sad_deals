import { writeFile } from 'fs/promises';
// using global fetch available in Node 18+
import * as cheerio from 'cheerio';

(async () => {
  const url = 'https://thekrazycouponlady.com/stores';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  const entries: { name: string; href: string; icon: string }[] = [];
  // Select anchors with coupon pages and an image child under the stores grid
  $('a[href^="/coupons-for/"]').has('img').each((_, el) => {
    const href = $(el).attr('href')!;
    const img = $(el).find('img').first().attr('src')!;
    let name = $(el).find('img').first().attr('alt') || '';
    name = name.replace(/\s*logo$/i, '').trim();
    entries.push({ name, href, icon: img });
  });

  const codeLines = [];
  codeLines.push('export const stores = [');
  for (const e of entries) {
    codeLines.push(`  { name: ${JSON.stringify(e.name)}, href: ${JSON.stringify(e.href)}, icon: ${JSON.stringify(e.icon)} },`);
  }
  codeLines.push('];');
  const code = codeLines.join('\n') + '\n';
  await writeFile('src/data/stores.ts', code, 'utf8');
})();
