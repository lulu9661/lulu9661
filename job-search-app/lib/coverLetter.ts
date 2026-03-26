import { Job, UserProfile } from '@/types';

export function generateCoverLetter(job: Job, profile: UserProfile, patterns: string[]): string {
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const greeting = 'Dear Hiring Manager,';

  // Match skills to job description
  const jobDesc = job.description.toLowerCase();
  const matchedSkills = profile.skills.filter(skill =>
    jobDesc.includes(skill.toLowerCase())
  );
  const topSkills = matchedSkills.length > 0
    ? matchedSkills.slice(0, 4)
    : profile.skills.slice(0, 3);

  // Check if we have learned patterns from previous edits
  const hasPatterns = patterns.length > 0;
  const latestPattern = hasPatterns ? patterns[patterns.length - 1] : '';

  // Opening paragraph
  const opening = `I am writing to express my interest in the ${job.title} position at ${job.organisation}. ${
    profile.summary
      ? profile.summary
      : 'With my background and experience, I believe I would be a strong fit for this role.'
  }`;

  // Skills paragraph
  const skillsList = topSkills.length > 0
    ? `My key competencies include ${topSkills.join(', ')}, which align closely with the requirements of this position.`
    : '';

  // Experience paragraph
  const experiencePara = profile.experience
    ? profile.experience
    : 'Throughout my career, I have developed relevant expertise that would enable me to contribute meaningfully to your team.';

  // Closing
  const closing = `I would welcome the opportunity to discuss how my skills and experience align with ${job.organisation}'s mission. I am available for an interview at your convenience and look forward to hearing from you.`;

  const signOff = profile.name
    ? `Yours faithfully,\n\n${profile.name}`
    : 'Yours faithfully,\n\n[Your Name]';

  // If we have learned patterns, incorporate the latest one
  const patternNote = hasPatterns
    ? `\n\n[Note: Based on your previous edits, consider adjusting the tone and content. Your latest refinement: "${latestPattern.slice(0, 200)}"]`
    : '';

  return [
    today,
    '',
    greeting,
    '',
    opening,
    '',
    skillsList,
    '',
    experiencePara,
    '',
    closing,
    '',
    signOff,
    patternNote,
  ].filter(line => line !== '' || true).join('\n');
}

export function extractEditPattern(original: string, edited: string): string {
  // Simple diff: record what changed to learn from
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
