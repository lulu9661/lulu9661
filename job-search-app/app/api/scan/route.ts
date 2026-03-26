import { NextRequest, NextResponse } from 'next/server';
import { parseJobListings } from '@/lib/scraper';
import { filterJob, scoreJob } from '@/lib/relevance';
import { JobSite, UserProfile } from '@/types';

async function fetchWithPuppeteer(url: string): Promise<string> {
  // Dynamic import to avoid issues during build
  const puppeteer = await import('puppeteer-core');

  // Common Chrome/Chromium paths by OS
  const executablePaths = [
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  // Find the first available browser
  let executablePath: string | undefined;
  const fs = await import('fs');
  for (const p of executablePaths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      break;
    }
  }

  if (!executablePath) {
    throw new Error(
      'Chrome/Chromium not found. Install Google Chrome or set CHROME_PATH environment variable.'
    );
  }

  // Allow override via env
  executablePath = process.env.CHROME_PATH || executablePath;

  const browser = await puppeteer.default.launch({
    headless: true,
    executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();

    // Set a realistic viewport and user agent
    await page.setViewport({ width: 1440, height: 900 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Navigate and wait for content to load
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Give extra time for JS-rendered content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the fully rendered HTML
    const html = await page.content();
    return html;
  } finally {
    await browser.close();
  }
}

async function fetchWithFetch(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sites, profile, threshold = 30, usePuppeteer = true } = await request.json() as {
      sites: JobSite[];
      profile: UserProfile;
      threshold: number;
      usePuppeteer: boolean;
    };

    const allJobs: Array<{
      title: string;
      organisation: string;
      location: string;
      deadline: string | null;
      applicationUrl: string;
      description: string;
      salary: string;
      sourceSite: string;
      relevanceScore: number;
      relevanceReasons: string[];
    }> = [];

    const errors: string[] = [];

    for (const site of sites) {
      try {
        let html: string;

        if (usePuppeteer) {
          try {
            html = await fetchWithPuppeteer(site.careerPageUrl);
          } catch (puppeteerErr) {
            // Fall back to regular fetch if Puppeteer fails
            const msg = puppeteerErr instanceof Error ? puppeteerErr.message : '';
            errors.push(`${site.name}: Puppeteer failed (${msg}), trying fetch...`);
            html = await fetchWithFetch(site.careerPageUrl);
          }
        } else {
          html = await fetchWithFetch(site.careerPageUrl);
        }

        const rawJobs = parseJobListings(html, site.careerPageUrl, site.searchTerms);

        for (const raw of rawJobs) {
          if (!filterJob(raw, site.filters)) continue;

          const scored = scoreJob(raw, profile, site.filters);

          if (scored.relevanceScore < threshold) continue;

          allJobs.push({
            ...scored,
            organisation: site.name,
            sourceSite: site.name,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`${site.name}: ${message}`);
      }
    }

    allJobs.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json({
      jobs: allJobs,
      errors: errors.length > 0 ? errors : undefined,
      scannedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
