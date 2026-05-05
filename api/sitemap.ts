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
    // Increase reliability by fetching smaller chunks
    const perPage = 50;
    const maxPages = 4;
    
    for (let page = 1; page <= maxPages; page++) {
      try {
        const response = await axios.get(`https://bdgovtjob.net/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_fields=id,date,title,content`, { 
          httpsAgent,
          timeout: 15000, 
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' 
          }
        });
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          response.data.forEach((post: any) => {
            const rawContent = post.content?.rendered || "";
            const imgMatches = rawContent.matchAll(/src=["']([^"'>]+\.(?:jpg|jpeg|png|webp|gif)[^"'>]*)["']/gi);
            const imageUrls = Array.from(imgMatches, m => m[1])
              .filter(url => url && (url.startsWith('http') || url.startsWith('/')))
              .slice(0, 3);

            jobs.push({
              id: post.id,
              date: post.date,
              title: post.title?.rendered || "Job Circular",
              images: imageUrls
            });
          });
        } else {
          break;
        }
      } catch (pageError) {
        console.error(`Sitemap fetch failed for page ${page}:`, pageError);
        // If we have some data, return it instead of failing everything
        if (jobs.length > 0) break;
        throw pageError; // If first page fails, throw to main catch
      }
    }
  } catch (e) {
    console.error('Sitemap fetch process critical failure:', e);
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
      <image:title><![CDATA[${job.title.replace(/<\/?[^>]+(>|$)/g, "").replace(/[<&"]/g, "")}]]></image:title>
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
  if (jobs.length > 0) {
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
  } else {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  res.status(200).send(sitemap.trim());
}
