'use client';

import { useState } from 'react';
import { useJobs } from '@/context/JobContext';
import { Job } from '@/types';
import { generateId } from '@/lib/utils';

export default function ScanButton() {
  const { state, addJobs } = useJobs();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleScan = async () => {
    const enabledSites = state.jobSites.filter(s => s.enabled);
    if (enabledSites.length === 0) {
      setResult('No job sites configured. Add sites in Settings.');
      return;
    }

    setScanning(true);
    setResult(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sites: enabledSites,
          profile: state.userProfile,
          threshold: state.relevanceThreshold,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult(data.error || 'Scan failed');
        return;
      }

      const newJobs: Job[] = data.jobs.map((j: Record<string, unknown>) => ({
        id: generateId(),
        title: j.title as string,
        organisation: j.organisation as string,
        location: j.location as string,
        deadline: j.deadline as string | null,
        applicationUrl: j.applicationUrl as string,
        description: j.description as string,
        salary: j.salary as string || '',
        sourceSite: j.sourceSite as string,
        scannedAt: new Date().toISOString(),
        relevanceScore: j.relevanceScore as number,
        relevanceReasons: j.relevanceReasons as string[] || [],
        status: 'potential' as const,
        applicationStatus: 'not_started' as const,
        priority: 'normal' as const,
        postApplicationStatus: null,
        coverLetterDraft: '',
        coverLetterHistory: [],
      }));

      addJobs(newJobs);
      setResult(`Found ${newJobs.length} new matching ${newJobs.length === 1 ? 'job' : 'jobs'}`);
    } catch {
      setResult('Scan failed — check your connection');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleScan}
        disabled={scanning}
        className="px-5 py-2 text-xs tracking-wider uppercase bg-neutral-900 text-white rounded hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {scanning ? 'Scanning…' : 'Scan Now'}
      </button>
      {result && (
        <span className="text-xs text-neutral-500 font-light">{result}</span>
      )}
    </div>
  );
}
