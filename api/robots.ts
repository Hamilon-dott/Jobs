import { VercelRequest, VercelResponse } from '@vercel/node';

const HOST = 'https://jobs.talukdaracademy.com.bd';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const robots = `User-agent: *
Allow: /
Sitemap: ${HOST}/sitemap.xml`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
  res.status(200).send(robots);
}
