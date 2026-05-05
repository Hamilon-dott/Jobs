import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({  
  rejectUnauthorized: false
});

const HOST = 'https://jobs.talukdaracademy.com.bd';

async function fetchSitemapData() {
  const jobs: any[] = [];
  try {
    // Fetch top 3 pages of posts to keep it within Vercel timeout limits
    // We only need id, date, title, and content (for image extraction)
    for (let page = 1; page <= 3; page++) {
      const response = await axios.get(`https://bdgovtjob.net/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=id,date,title,content`, { 
        httpsAgent,
        timeout: 8000,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
        }
      });
      if (Array.isArray(response.data)) {
        response.data.forEach((post: any) => {
          const rawContent = post.content?.rendered || "";
          // Quick regex for images since we don't want to load cheerio here for speed
          const imgMatches = rawContent.matchAll(/src=["']([^"'>]+\.(?:jpg|jpeg|png|webp|gif)[^"'>]*)["']/gi);
          const imageUrls = Array.from(imgMatches, m => m[1]).slice(0, 3);

          jobs.push({
            id: post.id,
            date: post.date,
            title: post.title?.rendered || "",
            images: imageUrls
          });
        });
      } else {
        break;
      }
    }
  } catch (e) {
    console.error('Sitemap fetch failed', e);
  }
  return jobs;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const jobs = await fetchSitemapData();
  const date = new Date().toISOString().split('T')[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${HOST}/</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
  ${jobs.map(job => {
    const pubDate = job.date ? job.date.split('T')[0] : date;
    const imagesMarkup = job.images.map((img: string) => `
    <image:image>
      <image:loc>${img.startsWith('http') ? img : HOST + img}</image:loc>
      <image:title><![CDATA[${job.title.replace(/<\/?[^>]+(>|$)/g, "")}]]></image:title>
    </image:image>`).join('');

    return `
  <url>
    <loc>${HOST}/?job=${job.id}</loc>
    <lastmod>${pubDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imagesMarkup}
  </url>`;
  }).join('')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
  res.status(200).send(sitemap.trim());
}
