import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const htmlPath = path.join(process.cwd(), 'public', 'index.html');
  let html = await readFile(htmlPath, 'utf8');

  const mapsApiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    '';

  const safeJsonKey = JSON.stringify(mapsApiKey);
  html = html.replace(
    'window.__GOOGLE_MAPS_API_KEY__ = "";',
    `window.__GOOGLE_MAPS_API_KEY__ = ${safeJsonKey};`
  );

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
