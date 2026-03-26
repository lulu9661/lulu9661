'use client';

import { useJobs } from '@/context/JobContext';
import StatsPanel from '@/components/StatsPanel';
import { formatDate } from '@/lib/utils';
import { PostApplicationStatus, POST_APPLICATION_LABELS } from '@/types';

const STATUS_OPTIONS: PostApplicationStatus[] = [
  'applied',
  'invited_to_test',
  'invited_to_interview',
  'rejected',
  'accepted',
];

export default function TrackingPage() {
  const { state, updatePostApplicationStatus } = useJobs();

  const appliedJobs = state.jobs
    .filter(j => j.applicationStatus === 'applied')
    .sort((a, b) => {
      // Most recently scanned first
      return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
    });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-light tracking-wide text-neutral-900">Application Tracking</h1>
        <p className="text-xs text-neutral-400 font-light mt-0.5">
          Overview of submitted applications
        </p>
      </div>

      <StatsPanel />

      {appliedJobs.length === 0 ? (
        <div className="border border-dashed border-neutral-200 rounded-lg py-12 text-center">
          <p className="text-xs text-neutral-400 font-light">
            No applications submitted yet. Mark jobs as applied on the Jobs page.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 font-light tracking-wider uppercase">
                <th className="text-left py-2 pr-3">Title</th>
                <th className="text-left py-2 pr-3">Organisation</th>
                <th className="text-left py-2 pr-3">Applied</th>
                <th className="text-left py-2 pr-3">Deadline</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {appliedJobs.map(job => (
                <tr key={job.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-3 pr-3 font-medium text-neutral-900 max-w-[200px] truncate">
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {job.title}
                    </a>
                  </td>
                  <td className="py-3 pr-3 text-neutral-600">{job.organisation}</td>
                  <td className="py-3 pr-3 text-neutral-500">{formatDate(job.scannedAt)}</td>
                  <td className="py-3 pr-3 text-neutral-500">{formatDate(job.deadline)}</td>
                  <td className="py-3">
                    <select
                      value={job.postApplicationStatus || 'applied'}
                      onChange={e => updatePostApplicationStatus(job.id, e.target.value as PostApplicationStatus)}
                      className="text-xs border border-neutral-200 rounded px-2 py-1 bg-white text-neutral-700 focus:outline-none focus:border-neutral-400"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{POST_APPLICATION_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
