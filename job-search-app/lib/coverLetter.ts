import { Job, UserProfile } from '@/types';

function extractKeyRequirements(description: string): string[] {
  const requirements: string[] = [];
  const lines = description.split(/[\n.;]/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 10) continue;

    // Look for requirement-like phrases
    if (/(?:requir|essential|must have|experience in|knowledge of|ability to|responsible for|you will|the candidate|we are looking|qualifications)/i.test(trimmed)) {
      // Clean up and extract the core requirement
      const cleaned = trimmed
        .replace(/^[-•*]\s*/, '')
        .replace(/^(?:the candidate |you will |we are looking for )/i, '')
        .trim();
      if (cleaned.length > 10 && cleaned.length < 200) {
        requirements.push(cleaned);
      }
    }
  }

  return requirements.slice(0, 6);
}

function matchSkillsToRequirements(skills: string[], description: string): { matched: string[]; unmatched: string[] } {
  const descLower = description.toLowerCase();
  const matched: string[] = [];
  const unmatched: string[] = [];

  for (const skill of skills) {
    if (descLower.includes(skill.toLowerCase())) {
      matched.push(skill);
    } else {
      unmatched.push(skill);
    }
  }

  return { matched, unmatched };
}

export function generateCoverLetter(job: Job, profile: UserProfile, patterns: string[]): string {
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const { matched: matchedSkills } = matchSkillsToRequirements(profile.skills, job.description);
  const keyRequirements = extractKeyRequirements(job.description);
  const hasDescription = job.description.length > 50;

  // Learn from patterns: extract any recurring phrases the user tends to use
  const recentPatterns = patterns.slice(-5);
  const learnedClosing = recentPatterns.length > 0
    ? recentPatterns[recentPatterns.length - 1].split(' | ').find(p => p.length > 30 && /thank|look forward|welcome|eager/i.test(p))
    : null;

  // --- Build the letter ---

  const lines: string[] = [];

  lines.push(today);
  lines.push('');
  lines.push('Dear Hiring Manager,');
  lines.push('');

  // Opening — reference the specific role and organisation, show genuine interest
  if (hasDescription) {
    lines.push(
      `I am writing to apply for the ${job.title} position at ${job.organisation}. ` +
      `Having reviewed the role requirements, I am confident that my background in ` +
      `${matchedSkills.length > 0 ? matchedSkills.slice(0, 2).join(' and ') : 'this field'} ` +
      `makes me a strong candidate for this opportunity.`
    );
  } else {
    lines.push(
      `I am writing to apply for the ${job.title} position at ${job.organisation}. ` +
      `I believe my professional experience and skills are well-suited to this role.`
    );
  }
  lines.push('');

  // Body paragraph 1 — professional context and relevant experience
  if (profile.summary) {
    lines.push(profile.summary);
    lines.push('');
  }

  // Body paragraph 2 — map skills directly to job requirements
  if (matchedSkills.length > 0 && hasDescription) {
    const skillMapping = matchedSkills.slice(0, 4).map(skill => {
      // Find a requirement that mentions this skill
      const relevantReq = keyRequirements.find(r => r.toLowerCase().includes(skill.toLowerCase()));
      if (relevantReq) {
        return `My experience in ${skill} directly addresses your need for ${relevantReq.toLowerCase().substring(0, 80)}.`;
      }
      return null;
    }).filter(Boolean);

    if (skillMapping.length > 0) {
      lines.push(skillMapping.join(' '));
      lines.push('');
    } else {
      lines.push(
        `My key competencies — including ${matchedSkills.slice(0, 4).join(', ')} — ` +
        `are directly relevant to the requirements outlined for this position.`
      );
      lines.push('');
    }
  }

  // Body paragraph 3 — broader experience
  if (profile.experience) {
    lines.push(profile.experience);
    lines.push('');
  }

  // Closing paragraph
  if (learnedClosing) {
    lines.push(learnedClosing);
  } else {
    lines.push(
      `I would welcome the opportunity to discuss how my experience aligns with ` +
      `${job.organisation}'s objectives for this role. I am available for an interview ` +
      `at your convenience and look forward to hearing from you.`
    );
  }
  lines.push('');

  // Sign off
  lines.push('Yours faithfully,');
  lines.push('');
  lines.push(profile.name || '[Your Name]');

  return lines.join('\n');
}

export function extractEditPattern(original: string, edited: string): string {
  if (original === edited) return '';

  const origLines = original.split('\n');
  const editLines = edited.split('\n');

  const changes: string[] = [];
  const maxLen = Math.max(origLines.length, editLines.length);

  for (let i = 0; i < maxLen; i++) {
    const orig = origLines[i] || '';
    const edit = editLines[i] || '';
    if (orig !== edit && edit.trim()) {
      changes.push(edit.trim());
    }
  }

  return changes.join(' | ');
}
