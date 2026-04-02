'use client';

import { useState } from 'react';
import { Job } from '@/types';
import { useJobs } from '@/context/JobContext';
import { formatDate, deadlineUrgency, cn } from '@/lib/utils';
import CoverLetterEditor from './CoverLetterEditor';

function sortApplications(jobs: Job[]): Job[] {
  return [...jobs].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === 'high' ? -1 : 1;
    }
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

function EditableRow({ job }: { job: Job }) {
  const { updateJob, removeJob, togglePriority, updateApplicationStatus } = useJobs();
  const [editing, setEditing] = useState(false);
  const [editingLetter, setEditingLetter] = useState(false);
  const [title, setTitle] = useState(job.title);
  const [organisation, setOrganisation] = useState(job.organisation);
  const [location, setLocation] = useState(job.location);
  const [deadline, setDeadline] = useState(job.deadline || '');
  const [applicationUrl, setApplicationUrl] = useState(job.applicationUrl);

  const urgency = deadlineUrgency(job.deadline);

  const handleSave = () => {
    updateJob(job.id, {
      title: title.trim(),
      organisation: organisation.trim(),
      location: location.trim(),
      deadline: deadline || null,
      applicationUrl: applicationUrl.trim(),
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setTitle(job.title);
    setOrganisation(job.organisation);
    setLocation(job.location);
    setDeadline(job.deadline || '');
    setApplicationUrl(job.applicationUrl);
    setEditing(false);
  };

  if (editing) {
    return (
      <>
        <tr className="border-b border-neutral-100 bg-neutral-50">
          <td className="py-2 pr-2">
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full border border-neutral-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-neutral-400" />
          </td>
          <td className="py-2 pr-2">
            <input value={organisation} onChange={e => setOrganisation(e.target.value)}
              className="w-full border border-neutral-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-neutral-400" />
          </td>
          <td className="py-2 pr-2">
            <input value={location} onChange={e => setLocation(e.target.value)}
              className="w-full border border-neutral-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-neutral-400" />
          </td>
          <td className="py-2 pr-2">
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              className="w-full border border-neutral-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-neutral-400" />
          </td>
          <td className="py-2 pr-2">
            <input value={applicationUrl} onChange={e => setApplicationUrl(e.target.value)} placeholder="URL"
              className="w-full border border-neutral-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-neutral-400" />
          </td>
          <td className="py-2 text-right space-x-1">
            <button onClick={handleSave} className="px-2 py-1 text-xs bg-neutral-900 text-white rounded hover:bg-neutral-700">Save</button>
            <button onClick={handleCancel} className="px-2 py-1 text-xs text-neutral-400 hover:text-neutral-600">Cancel</button>
          </td>
        </tr>
      </>
    );
  }

  return (
    <>
      <tr className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
        <td className="py-3 pr-3 max-w-[200px]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => togglePriority(job.id)}
              className={cn(
                'text-sm transition-colors shrink-0',
                job.priority === 'high' ? 'text-amber-500' : 'text-neutral-200 hover:text-neutral-400'
              )}
              title={job.priority === 'high' ? 'Remove priority' : 'Set high priority'}
            >
              ★
            </button>
            <span className="font-medium text-neutral-900 text-xs truncate">{job.title}</span>
          </div>
        </td>
        <td className="py-3 pr-3 text-xs text-neutral-600">{job.organisation}</td>
        <td className="py-3 pr-3 text-xs text-neutral-500">{job.location}</td>
        <td className={cn(
          'py-3 pr-3 text-xs',
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
        <td className="py-3 text-right">
          <div className="flex items-center justify-end gap-2 text-xs">
            {job.applicationUrl && (
              <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer"
                className="text-neutral-400 hover:text-neutral-600 underline">Apply ↗</a>
            )}
            <button onClick={() => setEditingLetter(!editingLetter)}
              className="text-neutral-400 hover:text-neutral-600 underline">Letter</button>
            <button onClick={() => setEditing(true)}
              className="text-neutral-400 hover:text-neutral-600 underline">Edit</button>
            <button onClick={() => updateApplicationStatus(job.id, 'applied')}
              className="text-neutral-400 hover:text-[var(--success)] underline">Applied</button>
            <button onClick={() => { if (confirm('Remove this job?')) removeJob(job.id); }}
              className="text-neutral-300 hover:text-[var(--danger)]">✕</button>
          </div>
        </td>
      </tr>
      {editingLetter && (
        <tr>
          <td colSpan={6} className="pb-3">
            <CoverLetterEditor jobId={job.id} onClose={() => setEditingLetter(false)} />
          </td>
        </tr>
      )}
    </>
  );
}

export default function ApplicationTable() {
  const { state } = useJobs();

  const applications = sortApplications(
    state.jobs.filter(j => j.status === 'accepted' && j.applicationStatus !== 'applied')
  );

  if (applications.length === 0) {
    return (
      <p className="text-xs text-neutral-400 font-light py-8 text-center">
        No active applications. Click &quot;+ Add Job&quot; to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-neutral-200 text-neutral-400 font-light tracking-wider uppercase">
            <th className="text-left py-2 pr-3">Title</th>
            <th className="text-left py-2 pr-3">Organisation</th>
            <th className="text-left py-2 pr-3">Location</th>
            <th className="text-left py-2 pr-3">Deadline</th>
            <th className="text-left py-2 pr-3">Status</th>
            <th className="text-right py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(job => (
            <EditableRow key={job.id} job={job} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
