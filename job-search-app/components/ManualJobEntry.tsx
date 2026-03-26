'use client';

import { useState } from 'react';
import { useJobs } from '@/context/JobContext';
import { Job } from '@/types';
import { generateId } from '@/lib/utils';

export default function ManualJobEntry({ onClose }: { onClose: () => void }) {
  const { addJobs } = useJobs();
  const [mode, setMode] = useState<'url' | 'manual'>('url');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual entry fields
  const [title, setTitle] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [description, setDescription] = useState('');

  const handleFetchUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/fetch-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch job');
        return;
      }

      const job: Job = {
        id: generateId(),
        title: data.job.title,
        organisation: '',
        location: data.job.location || '',
        deadline: data.job.deadline,
        applicationUrl: data.job.applicationUrl,
        description: data.job.description,
        salary: data.job.salary || '',
        sourceSite: 'Manual',
        scannedAt: new Date().toISOString(),
        relevanceScore: 50,
        relevanceReasons: ['Manually added'],
        status: 'potential',
        applicationStatus: 'not_started',
        priority: 'normal',
        postApplicationStatus: null,
        coverLetterDraft: '',
        coverLetterHistory: [],
      };

      addJobs([job]);
      onClose();
    } catch {
      setError('Failed to fetch — check the URL and try again');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!title.trim()) return;

    const job: Job = {
      id: generateId(),
      title: title.trim(),
      organisation: organisation.trim(),
      location: location.trim(),
      deadline: deadline || null,
      applicationUrl: applicationUrl.trim(),
      description: description.trim(),
      salary: '',
      sourceSite: 'Manual',
      scannedAt: new Date().toISOString(),
      relevanceScore: 50,
      relevanceReasons: ['Manually added'],
      status: 'potential',
      applicationStatus: 'not_started',
      priority: 'normal',
      postApplicationStatus: null,
      coverLetterDraft: '',
      coverLetterHistory: [],
    };

    addJobs([job]);
    onClose();
  };

  return (
    <div className="border border-neutral-200 bg-white rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-900">Add Job</h3>
        <button onClick={onClose} className="text-xs text-neutral-400 hover:text-neutral-600">
          ✕ Close
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1">
        <button
          onClick={() => setMode('url')}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            mode === 'url' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
          }`}
        >
          Paste URL
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            mode === 'manual' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
          }`}
        >
          Enter Manually
        </button>
      </div>

      {mode === 'url' ? (
        <div className="space-y-3">
          <p className="text-xs text-neutral-400 font-light">
            Paste a job listing URL and we&apos;ll extract the details automatically.
          </p>
          <div className="flex gap-2">
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://careers.unesco.org/job/..."
              className="flex-1 border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
            />
            <button
              onClick={handleFetchUrl}
              disabled={loading || !url.trim()}
              className="px-4 py-2 text-xs tracking-wide bg-neutral-900 text-white hover:bg-neutral-700 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Fetching…' : 'Fetch'}
            </button>
          </div>
          {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Job title *"
            className="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={organisation}
              onChange={e => setOrganisation(e.target.value)}
              placeholder="Organisation"
              className="border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
            />
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Location"
              className="border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
            />
            <input
              value={applicationUrl}
              onChange={e => setApplicationUrl(e.target.value)}
              placeholder="Application URL"
              className="border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
            />
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Job description"
            className="w-full border border-neutral-200 rounded px-3 py-2 text-sm font-light focus:outline-none focus:border-neutral-400 resize-y"
          />
          <button
            onClick={handleManualSubmit}
            disabled={!title.trim()}
            className="px-4 py-2 text-xs tracking-wide bg-neutral-900 text-white hover:bg-neutral-700 rounded transition-colors disabled:opacity-50"
          >
            Add Job
          </button>
        </div>
      )}
    </div>
  );
}
