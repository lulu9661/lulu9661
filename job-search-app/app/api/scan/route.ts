import { NextRequest, NextResponse } from 'next/server';
import { parseJobListings } from '@/lib/scraper';
import { filterJob, scoreJob } from '@/lib/relevance';
import { JobSite, UserProfile } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { sites, profile, threshold = 30 } = await request.json() as {
      sites: JobSite[];
      profile: UserProfile;
      threshold: number;
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
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(site.careerPageUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; JobSearchBot/1.0)',
            'Accept': 'text/html,application/xhtml+xml',
          },
        });
        clearTimeout(timeout);

        if (!res.ok) {
          errors.push(`${site.name}: HTTP ${res.status}`);
          continue;
        }

        const html = await res.text();
        const rawJobs = parseJobListings(html, site.careerPageUrl, site.searchTerms);

        for (const raw of rawJobs) {
          // Apply hard filters first
          if (!filterJob(raw, site.filters)) continue;

          // Score for relevance
          const scored = scoreJob(raw, profile, site.filters);

          // Only keep jobs above threshold
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

    // Sort by relevance score descending
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
