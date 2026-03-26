'use client';

import { useState } from 'react';
import { useJobs } from '@/context/JobContext';
import { JobSite, JobSiteFilters } from '@/types';
import { generateId } from '@/lib/utils';

function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput('');
    }
  };

  return (
    <div>
      <label className="text-xs text-neutral-400 tracking-wider uppercase block mb-1">{label}</label>
      <div className="flex gap-1 flex-wrap mb-1">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-xs text-neutral-600 rounded">
            {tag}
            <button onClick={() => onChange(value.filter(t => t !== tag))} className="text-neutral-400 hover:text-neutral-600">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 border border-neutral-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-neutral-400"
        />
        <button onClick={add} className="px-2 py-1 text-xs border border-neutral-200 rounded hover:bg-neutral-50">+</button>
      </div>
    </div>
  );
}

function JobSiteEditor({
  site,
  onUpdate,
  onRemove,
}: {
  site: JobSite;
  onUpdate: (id: string, updates: Partial<JobSite>) => void;
  onRemove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const updateFilter = (key: keyof JobSiteFilters, value: unknown) => {
    onUpdate(site.id, {
      filters: { ...site.filters, [key]: value },
    });
  };

  return (
    <div className="border border-neutral-200 bg-white rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <input
            value={site.name}
            onChange={e => onUpdate(site.id, { name: e.target.value })}
            placeholder="Organisation name"
            className="w-full border-0 border-b border-neutral-200 px-0 py-1 text-sm font-medium focus:outline-none focus:border-neutral-400"
          />
          <input
            value={site.careerPageUrl}
            onChange={e => onUpdate(site.id, { careerPageUrl: e.target.value })}
            placeholder="Career page URL (e.g., https://careers.unicef.org/en/work-with-us)"
            className="w-full border-0 border-b border-neutral-200 px-0 py-1 text-xs text-neutral-600 focus:outline-none focus:border-neutral-400"
          />
        </div>
        <div className="flex items-center gap-2 ml-3">
          <label className="flex items-center gap-1 text-xs text-neutral-500">
            <input
              type="checkbox"
              checked={site.enabled}
              onChange={e => onUpdate(site.id, { enabled: e.target.checked })}
              className="rounded"
            />
            Active
          </label>
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-neutral-400 hover:text-neutral-600">
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="pt-2 space-y-3 border-t border-neutral-100">
          <TagInput
            label="Search terms"
            value={site.searchTerms}
            onChange={v => onUpdate(site.id, { searchTerms: v })}
            placeholder="e.g., education, programme"
          />
          <TagInput
            label="Sectors"
            value={site.filters.sector}
            onChange={v => updateFilter('sector', v)}
            placeholder="e.g., education, child protection"
          />
          <TagInput
            label="Job levels"
            value={site.filters.jobLevel}
            onChange={v => updateFilter('jobLevel', v)}
            placeholder="e.g., P-3, mid-career"
          />
          <TagInput
            label="Exclude terms"
            value={site.filters.excludeTerms}
            onChange={v => updateFilter('excludeTerms', v)}
            placeholder="e.g., senior director, chief"
          />
          <div>
            <label className="text-xs text-neutral-400 tracking-wider uppercase block mb-1">
              Max years of experience
            </label>
            <input
              type="number"
              min={0}
              value={site.filters.maxYearsExperience ?? ''}
              onChange={e => updateFilter('maxYearsExperience', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g., 8"
              className="w-24 border border-neutral-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-neutral-400"
            />
          </div>
          <button
            onClick={() => onRemove(site.id)}
            className="text-xs text-[var(--danger)] hover:underline"
          >
            Remove site
          </button>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { state, addJobSite, updateJobSite, removeJobSite, updateProfile } = useJobs();
  const profile = state.userProfile;

  const handleAddSite = () => {
    addJobSite({
      id: generateId(),
      name: '',
      careerPageUrl: '',
      searchTerms: [],
      filters: {
        maxYearsExperience: null,
        jobLevel: [],
        sector: [],
        excludeTerms: [],
      },
      enabled: true,
      lastScanned: null,
    });
  };

  return (
    <div className="space-y-10">
      {/* Job Sites */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-light tracking-wide text-neutral-900">Target Organisations</h1>
            <p className="text-xs text-neutral-400 font-light mt-0.5">
              Add career pages to scan for matching jobs
            </p>
          </div>
          <button
            onClick={handleAddSite}
            className="px-4 py-1.5 text-xs tracking-wide bg-neutral-900 text-white hover:bg-neutral-700 rounded transition-colors"
          >
            + Add Site
          </button>
        </div>

        <div className="space-y-3">
          {state.jobSites.length === 0 ? (
            <div className="border border-dashed border-neutral-200 rounded-lg py-8 text-center">
              <p className="text-xs text-neutral-400 font-light">
                No sites configured. Add your target organisations to start scanning.
              </p>
            </div>
          ) : (
            state.jobSites.map(site => (
              <JobSiteEditor
                key={site.id}
                site={site}
                onUpdate={updateJobSite}
                onRemove={removeJobSite}
              />
            ))
          )}
        </div>
      </section>

      {/* Profile */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-light tracking-wide text-neutral-900">Your Profile</h2>
          <p className="text-xs text-neutral-400 font-light mt-0.5">
            Used for relevance scoring and cover letter generation
          </p>
        </div>

        <div className="border border-neutral-200 bg-white rounded-lg p-5 space-y-4">
          <div>
            <label className="text-xs text-neutral-400 tracking-wider uppercase block mb-1">Name</label>
            <input
              value={profile.name}
              onChange={e => updateProfile({ name: e.target.value })}
              placeholder="Your full name"
              className="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 tracking-wider uppercase block mb-1">Professional Summary</label>
            <textarea
              value={profile.summary}
              onChange={e => updateProfile({ summary: e.target.value })}
              rows={3}
              placeholder="A brief summary of your professional background and goals..."
              className="w-full border border-neutral-200 rounded px-3 py-2 text-sm font-light focus:outline-none focus:border-neutral-400 resize-y"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 tracking-wider uppercase block mb-1">Experience</label>
            <textarea
              value={profile.experience}
              onChange={e => updateProfile({ experience: e.target.value })}
              rows={4}
              placeholder="Describe your relevant experience..."
              className="w-full border border-neutral-200 rounded px-3 py-2 text-sm font-light focus:outline-none focus:border-neutral-400 resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-400 tracking-wider uppercase block mb-1">Years of Experience</label>
              <input
                type="number"
                min={0}
                value={profile.yearsOfExperience || ''}
                onChange={e => updateProfile({ yearsOfExperience: parseInt(e.target.value) || 0 })}
                className="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
              />
            </div>
          </div>

          <TagInput
            label="Skills"
            value={profile.skills}
            onChange={v => updateProfile({ skills: v })}
            placeholder="e.g., project management, M&E, curriculum development"
          />

          <TagInput
            label="Preferred Locations"
            value={profile.preferredLocations}
            onChange={v => updateProfile({ preferredLocations: v })}
            placeholder="e.g., Geneva, New York, Remote"
          />
        </div>
      </section>

      {/* Cover Letter Folder */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-light tracking-wide text-neutral-900">Cover Letter Storage</h2>
          <p className="text-xs text-neutral-400 font-light mt-0.5">
            Set the folder path where cover letters are saved as .docx files
          </p>
        </div>

        <div className="border border-neutral-200 bg-white rounded-lg p-5">
          <label className="text-xs text-neutral-400 tracking-wider uppercase block mb-1">Folder Path</label>
          <input
            value={profile.coverLetterFolderPath}
            onChange={e => updateProfile({ coverLetterFolderPath: e.target.value })}
            placeholder="~/Google Drive/My Drive/Cover Letters"
            className="w-full border border-neutral-200 rounded px-3 py-2 text-sm font-light focus:outline-none focus:border-neutral-400"
          />
          <p className="text-xs text-neutral-400 font-light mt-2">
            Point this to your Google Drive sync folder so cover letters auto-sync. Use ~ for your home directory.
          </p>
        </div>
      </section>
    </div>
  );
}
