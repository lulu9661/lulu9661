'use client';

import { useState } from 'react';
import { useJobs } from '@/context/JobContext';
import ApplicationTable from '@/components/ApplicationTable';
import ManualJobEntry from '@/components/ManualJobEntry';

export default function HomePage() {
  const { state } = useJobs();
  const [showManualEntry, setShowManualEntry] = useState(false);

  const activeApplications = state.jobs.filter(
    j => j.status === 'accepted' && j.applicationStatus !== 'applied'
  );

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-light tracking-wide text-neutral-900">Applications</h1>
            <p className="text-xs text-neutral-400 font-light mt-0.5">
              {activeApplications.length} active {activeApplications.length === 1 ? 'application' : 'applications'}
            </p>
          </div>
          <button
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="px-4 py-2 text-xs tracking-wide bg-neutral-900 text-white hover:bg-neutral-700 rounded transition-colors"
          >
            + Add Job
          </button>
        </div>

        {showManualEntry && (
          <div className="mb-6">
            <ManualJobEntry onClose={() => setShowManualEntry(false)} />
          </div>
        )}

        <ApplicationTable />
      </section>
    </div>
  );
}
