'use client';

import { useState } from 'react';
import { useJobs } from '@/context/JobContext';
import ScanButton from '@/components/ScanButton';
import JobCard from '@/components/JobCard';
import ApplicationTable from '@/components/ApplicationTable';
import ManualJobEntry from '@/components/ManualJobEntry';

export default function HomePage() {
  const { state } = useJobs();
  const [showManualEntry, setShowManualEntry] = useState(false);

  const potentialJobs = state.jobs
    .filter(j => j.status === 'potential')
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  const activeApplications = state.jobs.filter(
    j => j.status === 'accepted' && j.applicationStatus !== 'applied'
  );

  return (
    <div className="space-y-10">
      {/* New Opportunities */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-light tracking-wide text-neutral-900">New Opportunities</h1>
            <p className="text-xs text-neutral-400 font-light mt-0.5">
              {potentialJobs.length} potential {potentialJobs.length === 1 ? 'match' : 'matches'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowManualEntry(!showManualEntry)}
              className="px-4 py-2 text-xs tracking-wide border border-neutral-300 text-neutral-600 hover:bg-neutral-50 rounded transition-colors"
            >
              + Add Job
            </button>
            <ScanButton />
          </div>
        </div>

        {showManualEntry && (
          <div className="mb-4">
            <ManualJobEntry onClose={() => setShowManualEntry(false)} />
          </div>
        )}

        {potentialJobs.length === 0 && !showManualEntry ? (
          <div className="border border-dashed border-neutral-200 rounded-lg py-12 text-center">
            <p className="text-xs text-neutral-400 font-light">
              No new opportunities. Click Scan Now or Add Job to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {potentialJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Applications in Progress */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-light tracking-wide text-neutral-900">Applications in Progress</h2>
          <p className="text-xs text-neutral-400 font-light mt-0.5">
            {activeApplications.length} active {activeApplications.length === 1 ? 'application' : 'applications'}
          </p>
        </div>
        <ApplicationTable />
      </section>
    </div>
  );
}
