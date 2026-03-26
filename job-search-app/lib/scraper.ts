export interface RawJobListing {
  title: string;
  description: string;
  location: string;
  deadline: string | null;
  applicationUrl: string;
  salary: string;
}

// --- Date extraction ---

function extractDeadline(text: string): string | null {
  const patterns = [
    /(?:closing\s*date|deadline|closes|apply\s*by|due\s*date|end\s*date)[:\s]*(\d{1,2}[\s/-]\w{3,9}[\s/-]\d{2,4})/i,
    /(?:closing\s*date|deadline|closes|apply\s*by|due\s*date|end\s*date)[:\s]*(\w{3,9}\s+\d{1,2},?\s+\d{4})/i,
    /(?:closing\s*date|deadline|closes|apply\s*by|due\s*date|end\s*date)[:\s]*(\d{4}-\d{2}-\d{2})/i,
    /(\d{1,2}\s+\w{3,9}\s+\d{4})\s*(?:\(midnight|at\s+midnight)/i,
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
    /(?:location|duty\s*station|based\s*in|work\s*location)[:\s]*([^<\n,]{3,60})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim().replace(/[,.]$/, '');
  }
  return '';
}

// --- Site-specific parsers ---

function parseUnjobs(html: string): RawJobListing[] {
  const jobs: RawJobListing[] = [];
  const seen = new Set<string>();

  // unjobs.org lists jobs as links within search results
  // Pattern: links to /jobs/ pages with title text, plus metadata in surrounding elements
  const jobPattern = /<a[^>]+href=["'](\/jobs\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = jobPattern.exec(html)) !== null) {
    const href = match[1];
    const linkText = match[2].replace(/<[^>]+>/g, '').trim();

    if (!linkText || linkText.length < 5) continue;

    const fullUrl = `https://unjobs.org${href}`;
    if (seen.has(fullUrl)) continue;
    seen.add(fullUrl);

    // Get surrounding context for metadata
    const idx = match.index;
    const context = html.slice(
      Math.max(0, idx - 500),
      Math.min(html.length, idx + match[0].length + 500)
    ).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

    // Extract org name from context (unjobs often shows org)
    const orgMatch = context.match(/(?:UNICEF|UNESCO|UNDP|UNHCR|WHO|WFP|UNFPA|UNOPS|ILO|FAO|UNODC|UNEP|UN Women|IAEA|IOM|IFAD)/i);
    const org = orgMatch ? orgMatch[0] : '';

    jobs.push({
      title: linkText,
      description: context.trim(),
      location: extractLocation(context),
      deadline: extractDeadline(context),
      applicationUrl: fullUrl,
      salary: '',
    });

    // Overwrite org if found, it'll be set by the caller anyway
    if (org) {
      jobs[jobs.length - 1].description = `${org} — ${context.trim()}`;
    }
  }

  return jobs;
}

function parseUnicefPageUp(html: string, baseUrl: string): RawJobListing[] {
  const jobs: RawJobListing[] = [];
  const seen = new Set<string>();

  // PageUp platform: jobs typically in structured divs with links to /cw/en-us/job/
  const patterns = [
    /<a[^>]+href=["']([^"']*\/cw\/en-us\/job\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    /<a[^>]+href=["']([^"']*\/job\/\d+[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const href = match[1];
      const linkText = match[2].replace(/<[^>]+>/g, '').trim();

      if (!linkText || linkText.length < 5) continue;
      if (/^(sign|log|create|back|home|about)/i.test(linkText)) continue;

      let fullUrl: string;
      try {
        fullUrl = new URL(href, baseUrl).toString();
      } catch {
        continue;
      }

      if (seen.has(fullUrl)) continue;
      seen.add(fullUrl);

      const idx = match.index;
      const context = html.slice(
        Math.max(0, idx - 400),
        Math.min(html.length, idx + match[0].length + 400)
      ).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

      jobs.push({
        title: linkText,
        description: context.trim(),
        location: extractLocation(context),
        deadline: extractDeadline(context),
        applicationUrl: fullUrl,
        salary: '',
      });
    }
  }

  return jobs;
}

function parseSuccessFactors(html: string, baseUrl: string): RawJobListing[] {
  const jobs: RawJobListing[] = [];
  const seen = new Set<string>();

  // SuccessFactors: jobs in structured results with links containing /job/
  const patterns = [
    /<a[^>]+href=["']([^"']*\/job\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    /<a[^>]+class=["'][^"']*jobTitle[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const href = pattern.source.includes('class=') ? match[2] : match[1];
      const linkText = (pattern.source.includes('class=') ? match[3] : match[2])?.replace(/<[^>]+>/g, '').trim();

      if (!linkText || linkText.length < 5) continue;
      if (/^(sign|log|create|back|home|about|search)/i.test(linkText)) continue;

      let fullUrl: string;
      try {
        fullUrl = new URL(href, baseUrl).toString();
      } catch {
        continue;
      }

      if (seen.has(fullUrl)) continue;
      seen.add(fullUrl);

      const idx = match.index;
      const context = html.slice(
        Math.max(0, idx - 400),
        Math.min(html.length, idx + match[0].length + 400)
      ).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

      jobs.push({
        title: linkText,
        description: context.trim(),
        location: extractLocation(context),
        deadline: extractDeadline(context),
        applicationUrl: fullUrl,
        salary: '',
      });
    }
  }

  return jobs;
}

function parseGeneric(html: string, baseUrl: string, searchTerms: string[]): RawJobListing[] {
  const jobs: RawJobListing[] = [];
  const seen = new Set<string>();

  const linkPattern = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  const jobPaths = [
    /\/job[s]?\//i, /\/vacanc/i, /\/career/i, /\/opportunit/i,
    /\/position/i, /\/opening/i, /\/recruit/i, /\/apply/i,
    /jobId=/i, /job_id=/i, /vacancyId=/i,
  ];

  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1];
    const linkText = match[2].replace(/<[^>]+>/g, '').trim();

    if (!linkText || linkText.length < 5) continue;
    if (/^(home|about|contact|login|sign|menu|nav|back|next|prev)/i.test(linkText)) continue;

    const isJobUrl = jobPaths.some(p => p.test(href));
    const hasJobKeyword = /job|position|vacancy|role|officer|specialist|coordinator|consultant|manager|analyst|assistant/i.test(linkText);

    if (!isJobUrl && !hasJobKeyword) continue;

    if (searchTerms.length > 0) {
      const normText = (linkText + ' ' + href).toLowerCase();
      const matchesSearch = searchTerms.some(term =>
        normText.includes(term.toLowerCase())
      );
      if (!matchesSearch && !isJobUrl) continue;
    }

    let fullUrl: string;
    try {
      fullUrl = new URL(href, baseUrl).toString();
    } catch {
      continue;
    }

    if (seen.has(fullUrl)) continue;
    seen.add(fullUrl);

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

// --- Single job page parser ---

export function parseSingleJobPage(html: string, url: string): RawJobListing | null {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  // Extract title from <title> tag or <h1>
  let title = '';
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
    // Clean common suffixes
    title = title.replace(/\s*[-|]\s*(UNICEF|UNESCO|UN|careers|jobs).*$/i, '').trim();
  }
  if (!title) {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) title = h1Match[1].replace(/<[^>]+>/g, '').trim();
  }

  if (!title) return null;

  // Extract description - use meta description or first substantial paragraph
  let description = '';
  const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (metaDesc) {
    description = metaDesc[1];
  } else {
    // Get the main content area text (first 500 chars after the title)
    const titleIdx = text.indexOf(title);
    if (titleIdx >= 0) {
      description = text.slice(titleIdx + title.length, titleIdx + title.length + 500).trim();
    }
  }

  return {
    title,
    description: description || text.slice(0, 500),
    location: extractLocation(text),
    deadline: extractDeadline(text),
    applicationUrl: url,
    salary: '',
  };
}

// --- Main dispatcher ---

function detectSiteType(url: string): 'unjobs' | 'unicef' | 'unesco' | 'generic' {
  if (url.includes('unjobs.org')) return 'unjobs';
  if (url.includes('jobs.unicef.org') || url.includes('pageuppeople.com')) return 'unicef';
  if (url.includes('careers.unesco.org') || url.includes('successfactors')) return 'unesco';
  return 'generic';
}

export function parseJobListings(html: string, baseUrl: string, searchTerms: string[]): RawJobListing[] {
  const siteType = detectSiteType(baseUrl);

  switch (siteType) {
    case 'unjobs':
      return parseUnjobs(html);
    case 'unicef':
      return parseUnicefPageUp(html, baseUrl);
    case 'unesco':
      return parseSuccessFactors(html, baseUrl);
    default:
      return parseGeneric(html, baseUrl, searchTerms);
  }
}
