import { Router } from 'express';

export const newsRouter = Router();

export type Feed = { id: string; name: string; url: string };
export type Article = { id: string; title: string; link: string; publishedAt: string | null; feedName: string };

export const feeds: Feed[] = [
  { id: 'lobsters', name: 'Lobsters', url: 'https://lobste.rs/rss' },
  { id: 'hn', name: 'Hacker News', url: 'https://hnrss.org/frontpage' },
  { id: 'verge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
];

newsRouter.get('/', async (_req, res, next) => {
  try {
    const results = await Promise.allSettled(feeds.map(fetchFeed));
    const articles = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
    articles.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
    res.json({ articles: articles.slice(0, 40) });
  } catch (error) {
    next(error);
  }
});

async function fetchFeed(feed: Feed): Promise<Article[]> {
  const response = await fetch(feed.url, { headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' } });
  if (!response.ok) throw new Error(`No pudimos leer ${feed.name} (${response.status}).`);
  return parseItems(await response.text(), feed);
}

function parseItems(xml: string, feed: Feed): Article[] {
  const blocks = matchBlocks(xml, 'item').length ? matchBlocks(xml, 'item') : matchBlocks(xml, 'entry');
  return blocks.slice(0, 25).map((block, index) => {
    const link = linkOf(block);
    return {
      id: text(block, 'guid') || text(block, 'id') || link || `${feed.id}-${index}`,
      title: decodeEntities(text(block, 'title') || 'Sin título'),
      link,
      publishedAt: toIso(text(block, 'pubDate') || text(block, 'dc:date') || text(block, 'updated') || text(block, 'published')),
      feedName: feed.name,
    };
  });
}

function matchBlocks(xml: string, tag: string) {
  const blocks: string[] = [];
  const open = new RegExp(`<${tag}(?:\\s[^>]*)?>`, 'gi');
  let match: RegExpExecArray | null;
  while ((match = open.exec(xml))) {
    const start = match.index + match[0].length;
    const end = xml.indexOf(`</${tag}>`, start);
    if (end === -1) break;
    blocks.push(xml.slice(start, end));
    open.lastIndex = end;
  }
  return blocks;
}

function text(block: string, tag: string) {
  const match = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i').exec(block);
  if (!match) return '';
  return match[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim();
}

function linkOf(block: string) {
  const href = /<link[^>]*\shref=["']([^"']+)["']/i.exec(block);
  if (href) return decodeEntities(href[1]);
  return text(block, 'link');
}

function decodeEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function toIso(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
