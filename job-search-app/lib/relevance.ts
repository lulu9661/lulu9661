import { UserProfile, JobSiteFilters } from '@/types';

interface RawJob {
  title: string;
  description: string;
  location: string;
  deadline: string | null;
  applicationUrl: string;
  salary: string;
}

export interface ScoredJob extends RawJob {
  relevanceScore: number;
  relevanceReasons: string[];
}

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function countMatches(text: string, terms: string[]): number {
  const normText = normalise(text);
  return terms.filter(term => normText.includes(normalise(term))).length;
}

function extractYearsRequired(text: string): number | null {
  const patterns = [
    /(\d+)\+?\s*years?\s*(?:of\s+)?(?:relevant\s+)?(?:professional\s+)?experience/i,
    /minimum\s+(?:of\s+)?(\d+)\s*years/i,
    /at\s+least\s+(\d+)\s*years/i,
    /(\d+)\s*-\s*\d+\s*years?\s*(?:of\s+)?experience/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1], 10);
  }
  return null;
}

export function filterJob(
  job: RawJob,
  filters: JobSiteFilters
): boolean {
  const combined = normalise(job.title + ' ' + job.description);

  // Exclude terms check
  for (const term of filters.excludeTerms) {
    if (term && combined.includes(normalise(term))) return false;
  }

  // Max years check
  if (filters.maxYearsExperience !== null) {
    const required = extractYearsRequired(job.title + ' ' + job.description);
    if (required !== null && required > filters.maxYearsExperience) return false;
  }

  return true;
}

export function scoreJob(
  job: RawJob,
  profile: UserProfile,
  filters: JobSiteFilters
): ScoredJob {
  const combined = job.title + ' ' + job.description;
  const reasons: string[] = [];
  let score = 0;

  // Skill match (up to 40 points)
  if (profile.skills.length > 0) {
    const matched = countMatches(combined, profile.skills);
    const skillScore = Math.min(40, Math.round((matched / profile.skills.length) * 40));
    score += skillScore;
    if (matched > 0) {
      reasons.push(`Skills: ${matched}/${profile.skills.length}`);
    }
  }

  // Sector match (up to 20 points)
  if (filters.sector.length > 0) {
    const matched = countMatches(combined, filters.sector);
    const sectorScore = Math.min(20, Math.round((matched / filters.sector.length) * 20));
    score += sectorScore;
    if (matched > 0) {
      reasons.push(`Sector: ${filters.sector.filter(s => normalise(combined).includes(normalise(s))).join(', ')}`);
    }
  }

  // Job level match (up to 15 points)
  if (filters.jobLevel.length > 0) {
    const matched = countMatches(combined, filters.jobLevel);
    if (matched > 0) {
      score += 15;
      reasons.push(`Level: ${filters.jobLevel.filter(l => normalise(combined).includes(normalise(l))).join(', ')}`);
    }
  }

  // Experience fit (up to 15 points)
  const yearsRequired = extractYearsRequired(combined);
  if (yearsRequired !== null && profile.yearsOfExperience > 0) {
    const diff = Math.abs(profile.yearsOfExperience - yearsRequired);
    if (diff <= 2) {
      score += 15;
      reasons.push(`Experience: ${yearsRequired}yr required`);
    } else if (diff <= 4) {
      score += 8;
      reasons.push(`Experience: ${yearsRequired}yr required`);
    }
  }

  // Location match (up to 10 points)
  if (profile.preferredLocations.length > 0) {
    const locMatched = countMatches(job.location, profile.preferredLocations);
    if (locMatched > 0) {
      score += 10;
      reasons.push(`Location match`);
    }
  }

  return {
    ...job,
    relevanceScore: Math.min(100, score),
    relevanceReasons: reasons,
  };
}
