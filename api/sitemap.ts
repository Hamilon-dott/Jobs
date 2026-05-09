import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({  
  rejectUnauthorized: false
});

// Slug generation function
function generateSlug(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

async function fetchJobSlugs() {
  const slugs: string[] = [];
  try {
    // Fetch top 2 pages (200 jobs) to keep it fast and reliable
    for (let page = 1; page <= 2; page++) {
      const response = await axios.get(`https://bdgovtjob.net/wp-json/wp/v2/posts?per_page=100&page=${page}`, { 
        httpsAgent,
        timeout: 8000,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
        }
      });
      if (Array.isArray(response.data)) {
        response.data.forEach((post: any) => {
          let titleText = post.title?.rendered || '';
          // Remove HTML entities like &#8211;
          titleText = titleText.replace(/&#[0-9]+;/g, '-').replace(/<[^>]+>/g, '').trim();
          slugs.push(generateSlug(titleText) || post.id.toString());
        });
      } else {
        break;
      }
    }
  } catch (e) {
    console.error('Sitemap fetch failed', e);
  }
  return slugs;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers.host || 'jobs.example.com';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;
  
  const jobSlugs = await fetchJobSlugs();
  const date = new Date().toISOString().split('T')[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  ${jobSlugs.map(slug => `
  <url>
    <loc>${baseUrl}/${slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(sitemap);
}
