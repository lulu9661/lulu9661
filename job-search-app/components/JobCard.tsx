'use client';

import { Job } from '@/types';
import { formatDate, deadlineUrgency, truncate, cn } from '@/lib/utils';
import { useJobs } from '@/context/JobContext';

export default function JobCard({ job }: { job: Job }) {
  const { acceptJob, rejectJob } = useJobs();

  const urgency = deadlineUrgency(job.deadline);
  const scoreColor = job.relevanceScore >= 70
    ? 'text-[var(--match-high)] border-[var(--match-high)]'
    : job.relevanceScore >= 45
      ? 'text-[var(--match-mid)] border-[var(--match-mid)]'
      : 'text-[var(--match-low)] border-[var(--match-low)]';

  return (
    <div className="border border-neutral-200 bg-white rounded-lg p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-neutral-900 leading-snug">
            {job.title}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {job.organisation}{job.location ? ` · ${job.location}` : ''}
          </p>
        </div>
        <span className={cn('text-xs font-medium px-2 py-0.5 border rounded-full shrink-0', scoreColor)}>
          {job.relevanceScore}%
        </span>
      </div>

      {job.relevanceReasons.length > 0 && (
        <p className="text-xs text-neutral-400 font-light">
          {job.relevanceReasons.join(' · ')}
        </p>
      )}

      <p className="text-xs text-neutral-600 font-light leading-relaxed">
        {truncate(job.description, 200)}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
        <span className={cn(
          'text-xs font-light',
          urgency === 'danger' ? 'text-[var(--danger)]' :
            urgency === 'warning' ? 'text-[var(--warning)]' : 'text-neutral-400'
        )}>
          {formatDate(job.deadline)}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => rejectJob(job.id)}
            className="px-3 py-1 text-xs tracking-wide text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={() => acceptJob(job.id)}
            className="px-3 py-1 text-xs tracking-wide bg-neutral-900 text-white hover:bg-neutral-700 rounded transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
