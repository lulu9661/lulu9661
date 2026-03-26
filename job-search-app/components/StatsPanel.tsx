'use client';

import { useJobs } from '@/context/JobContext';

export default function StatsPanel() {
  const { stats } = useJobs();

  const items = [
    { label: 'Applied', value: stats.totalApplications },
    { label: 'Tests', value: stats.invitedToTest },
    { label: 'Interviews', value: stats.invitedToInterview },
    { label: 'Rejected', value: stats.rejected },
    { label: 'Accepted', value: stats.accepted },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {items.map(item => (
        <div key={item.label} className="border border-neutral-200 bg-white rounded-lg p-4 text-center">
          <p className="text-2xl font-light text-neutral-900">{item.value}</p>
          <p className="text-xs text-neutral-400 tracking-wider uppercase mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
