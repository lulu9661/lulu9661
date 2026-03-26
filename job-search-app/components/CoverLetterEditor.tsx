'use client';

import { useState } from 'react';
import { useJobs } from '@/context/JobContext';

export default function CoverLetterEditor({
  jobId,
  onClose,
}: {
  jobId: string;
  onClose: () => void;
}) {
  const { state, saveCoverLetter } = useJobs();
  const job = state.jobs.find(j => j.id === jobId);
  const [draft, setDraft] = useState(job?.coverLetterDraft || '');
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  if (!job) return null;

  const wordCount = draft.trim().split(/\s+/).filter(Boolean).length;

  const handleSave = () => {
    saveCoverLetter(jobId, draft);
    setSaveResult('Saved');
    setTimeout(() => setSaveResult(null), 2000);
  };

  const handleSaveToDrive = async () => {
    if (!state.userProfile.coverLetterFolderPath) {
      setSaveResult('Set your cover letter folder in Settings first');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: draft,
          jobTitle: job.title,
          organisation: job.organisation,
          folderPath: state.userProfile.coverLetterFolderPath,
          authorName: state.userProfile.name,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        saveCoverLetter(jobId, draft);
        setSaveResult(`Saved to ${data.fileName}`);
      } else {
        setSaveResult(data.error || 'Failed to save');
      }
    } catch {
      setSaveResult('Failed to save to Drive folder');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 border border-neutral-200 bg-white rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-neutral-900">Cover Letter</h3>
          <p className="text-xs text-neutral-400 font-light mt-0.5">
            {job.title} — {job.organisation}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          ✕ Close
        </button>
      </div>

      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        rows={18}
        className="w-full border border-neutral-200 rounded p-4 text-sm font-light leading-relaxed text-neutral-800 focus:outline-none focus:border-neutral-400 resize-y"
        placeholder="Your cover letter will appear here when you accept a job..."
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400 font-light">{wordCount} words</span>
        <div className="flex items-center gap-2">
          {saveResult && (
            <span className="text-xs text-neutral-500 font-light">{saveResult}</span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs tracking-wide border border-neutral-300 text-neutral-600 hover:bg-neutral-50 rounded transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handleSaveToDrive}
            disabled={saving}
            className="px-4 py-1.5 text-xs tracking-wide bg-neutral-900 text-white hover:bg-neutral-700 rounded transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save to Drive'}
          </button>
        </div>
      </div>
    </div>
  );
}
