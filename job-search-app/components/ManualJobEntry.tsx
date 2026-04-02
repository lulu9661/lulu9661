'use client';

import { useState, useRef } from 'react';
import { useJobs } from '@/context/JobContext';
import { Job } from '@/types';
import { generateId } from '@/lib/utils';

export default function ManualJobEntry({ onClose }: { onClose: () => void }) {
  const { addJobs } = useJobs();

  const [title, setTitle] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [description, setDescription] = useState('');
  const [pdfName, setPdfName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) {
        // Append PDF text content to description
        setDescription(prev => prev ? prev + '\n\n--- Job Description (from PDF) ---\n\n' + text : text);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
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
      relevanceScore: 0,
      relevanceReasons: [],
      status: 'accepted',
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
          <div>
            <label className="text-xs text-neutral-400 block mb-1">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
            />
          </div>
          <input
            value={applicationUrl}
            onChange={e => setApplicationUrl(e.target.value)}
            placeholder="Application URL"
            className="border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-400 mt-auto"
          />
        </div>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          placeholder="Paste the job description here..."
          className="w-full border border-neutral-200 rounded px-3 py-2 text-sm font-light focus:outline-none focus:border-neutral-400 resize-y"
        />

        {/* PDF upload */}
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handlePdfUpload}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="px-3 py-1.5 text-xs border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded transition-colors"
          >
            Attach job description file
          </button>
          {pdfName && (
            <span className="text-xs text-neutral-500 font-light">{pdfName}</span>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-5 py-2 text-xs tracking-wide bg-neutral-900 text-white hover:bg-neutral-700 rounded transition-colors disabled:opacity-50"
          >
            Add to Applications
          </button>
        </div>
      </div>
    </div>
  );
}
