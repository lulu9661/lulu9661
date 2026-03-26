'use client';

import { useState } from 'react';
import { Job } from '@/types';
import { useJobs } from '@/context/JobContext';
import { formatDate, deadlineUrgency, cn } from '@/lib/utils';
import CoverLetterEditor from './CoverLetterEditor';

function sortApplications(jobs: Job[]): Job[] {
  return [...jobs].sort((a, b) => {
    // High priority first
    if (a.priority !== b.priority) {
      return a.priority === 'high' ? -1 : 1;
    }
    // Then by deadline (soonest first, null deadlines last)
    if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not started',
  started: 'In progress',
  applied: 'Applied',
};

export default function ApplicationTable() {
  const { state, togglePriority, updateApplicationStatus } = useJobs();
  const [editingId, setEditingId] = useState<string | null>(null);

  const applications = sortApplications(
    state.jobs.filter(j => j.status === 'accepted' && j.applicationStatus !== 'applied')
  );

  if (applications.length === 0) {
    return (
      <p className="text-xs text-neutral-400 font-light py-8 text-center">
        No active applications. Accept potential jobs above to begin.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-400 font-light tracking-wider uppercase">
              <th className="text-left py-2 pr-3">Title</th>
              <th className="text-left py-2 pr-3">Organisation</th>
              <th className="text-left py-2 pr-3">Deadline</th>
              <th className="text-left py-2 pr-3">Status</th>
              <th className="text-center py-2 pr-3">Priority</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(job => {
              const urgency = deadlineUrgency(job.deadline);
              return (
                <tr key={job.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-3 pr-3 font-medium text-neutral-900 max-w-[200px] truncate">
                    {job.title}
                  </td>
                  <td className="py-3 pr-3 text-neutral-600">{job.organisation}</td>
                  <td className={cn(
                    'py-3 pr-3',
                    urgency === 'danger' ? 'text-[var(--danger)] font-medium' :
                      urgency === 'warning' ? 'text-[var(--warning)]' : 'text-neutral-500'
                  )}>
                    {formatDate(job.deadline)}
                  </td>
                  <td className="py-3 pr-3">
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs',
                      job.applicationStatus === 'not_started' ? 'bg-neutral-100 text-neutral-500' :
                        job.applicationStatus === 'started' ? 'bg-amber-50 text-amber-700' :
                          'bg-green-50 text-green-700'
                    )}>
                      {STATUS_LABELS[job.applicationStatus]}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-center">
                    <button
                      onClick={() => togglePriority(job.id)}
                      className={cn(
                        'text-sm transition-colors',
                        job.priority === 'high' ? 'text-amber-500' : 'text-neutral-300 hover:text-neutral-400'
                      )}
                      title={job.priority === 'high' ? 'Remove priority' : 'Set high priority'}
                    >
                      ★
                    </button>
                  </td>
                  <td className="py-3 text-right space-x-2">
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-neutral-600 underline"
                    >
                      Apply ↗
                    </a>
                    <button
                      onClick={() => setEditingId(editingId === job.id ? null : job.id)}
                      className="text-neutral-400 hover:text-neutral-600 underline"
                    >
                      Letter
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(job.id, 'applied')}
                      className="text-neutral-400 hover:text-[var(--success)] underline"
                    >
                      Mark applied
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingId && (
        <CoverLetterEditor
          jobId={editingId}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  );
}
