export interface RawJobListing {
  title: string;
  description: string;
  location: string;
  deadline: string | null;
  applicationUrl: string;
  salary: string;
}

function extractDeadline(text: string): string | null {
  const patterns = [
    /(?:closing\s*date|deadline|closes|apply\s*by|due\s*date)[:\s]*(\d{1,2}[\s/-]\w{3,9}[\s/-]\d{2,4})/i,
    /(?:closing\s*date|deadline|closes|apply\s*by|due\s*date)[:\s]*(\w{3,9}\s+\d{1,2},?\s+\d{4})/i,
    /(?:closing\s*date|deadline|closes|apply\s*by|due\s*date)[:\s]*(\d{4}-\d{2}-\d{2})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const parsed = new Date(match[1]);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
    }
  }
  return null;
}

function extractLocation(text: string): string {
  const patterns = [
    /(?:location|duty\s*station|based\s*in)[:\s]*([^<\n]{3,60})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim().replace(/[,.]$/, '');
  }
  return '';
}

export function parseJobListings(html: string, baseUrl: string, searchTerms: string[]): RawJobListing[] {
  const jobs: RawJobListing[] = [];
  const seen = new Set<string>();

  // Extract all anchor tags with their surrounding text
  const linkPattern = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  // Job-related URL path patterns
  const jobPaths = [
    /\/job[s]?\//i, /\/vacanc/i, /\/career/i, /\/opportunit/i,
    /\/position/i, /\/opening/i, /\/recruit/i, /\/apply/i,
    /jobId=/i, /job_id=/i, /vacancyId=/i,
  ];

  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1];
    const linkText = match[2].replace(/<[^>]+>/g, '').trim();

    // Skip empty links, navigation links, and very short text
    if (!linkText || linkText.length < 5) continue;
    if (/^(home|about|contact|login|sign|menu|nav|back|next|prev)/i.test(linkText)) continue;

    // Check if URL looks like a job listing
    const isJobUrl = jobPaths.some(p => p.test(href));
    const hasJobKeyword = /job|position|vacancy|role|officer|specialist|coordinator|consultant|manager|analyst|assistant/i.test(linkText);

    if (!isJobUrl && !hasJobKeyword) continue;

    // Check search terms if provided
    if (searchTerms.length > 0) {
      const normText = (linkText + ' ' + href).toLowerCase();
      const matchesSearch = searchTerms.some(term =>
        normText.includes(term.toLowerCase())
      );
      if (!matchesSearch && !isJobUrl) continue;
    }

    // Resolve relative URLs
    let fullUrl: string;
    try {
      fullUrl = new URL(href, baseUrl).toString();
    } catch {
      continue;
    }

    if (seen.has(fullUrl)) continue;
    seen.add(fullUrl);

    // Extract surrounding context (200 chars around the link)
    const linkIndex = match.index;
    const surrounding = html.slice(
      Math.max(0, linkIndex - 300),
      Math.min(html.length, linkIndex + match[0].length + 300)
    ).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

    jobs.push({
      title: linkText,
      description: surrounding.trim(),
      location: extractLocation(surrounding),
      deadline: extractDeadline(surrounding),
      applicationUrl: fullUrl,
      salary: '',
    });
  }

  return jobs;
}
