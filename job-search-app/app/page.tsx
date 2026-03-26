'use client';

import { useJobs } from '@/context/JobContext';
import ScanButton from '@/components/ScanButton';
import JobCard from '@/components/JobCard';
import ApplicationTable from '@/components/ApplicationTable';

export default function HomePage() {
  const { state } = useJobs();

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
          <ScanButton />
        </div>

        {potentialJobs.length === 0 ? (
          <div className="border border-dashed border-neutral-200 rounded-lg py-12 text-center">
            <p className="text-xs text-neutral-400 font-light">
              No new opportunities. Click Scan Now to search your configured sites.
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
