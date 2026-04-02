'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  AppState,
  Job,
  JobSite,
  UserProfile,
  ApplicationStatus,
  PostApplicationStatus,
  Priority,
  DEFAULT_STATE,
} from '@/types';
import { loadState, saveState } from '@/lib/storage';
import { generateCoverLetter, extractEditPattern } from '@/lib/coverLetter';

interface JobContextType {
  state: AppState;
  // Job actions
  addJobs: (jobs: Job[]) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  removeJob: (id: string) => void;
  acceptJob: (id: string) => void;
  rejectJob: (id: string) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  updatePostApplicationStatus: (id: string, status: PostApplicationStatus) => void;
  togglePriority: (id: string) => void;
  saveCoverLetter: (id: string, draft: string) => void;
  // Job site actions
  addJobSite: (site: JobSite) => void;
  updateJobSite: (id: string, updates: Partial<JobSite>) => void;
  removeJobSite: (id: string) => void;
  // Profile actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  // Stats
  stats: {
    totalApplications: number;
    invitedToTest: number;
    invitedToInterview: number;
    rejected: number;
    accepted: number;
  };
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [isInitialised, setIsInitialised] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded || DEFAULT_STATE);
    setIsInitialised(true);
  }, []);

  useEffect(() => {
    if (state && isInitialised) {
      saveState(state);
    }
  }, [state, isInitialised]);

  const addJobs = useCallback((jobs: Job[]) => {
    setState(prev => {
      if (!prev) return prev;
      const existingIds = new Set(prev.jobs.map(j => j.id));
      // Only deduplicate by URL if the URL is non-empty
      const existingUrls = new Set(prev.jobs.map(j => j.applicationUrl).filter(Boolean));
      const newJobs = jobs.filter(j => {
        if (existingIds.has(j.id)) return false;
        if (j.applicationUrl && existingUrls.has(j.applicationUrl)) return false;
        return true;
      });
      return { ...prev, jobs: [...prev.jobs, ...newJobs] };
    });
  }, []);

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        jobs: prev.jobs.map(j => j.id === id ? { ...j, ...updates } : j),
      };
    });
  }, []);

  const removeJob = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      return { ...prev, jobs: prev.jobs.filter(j => j.id !== id) };
    });
  }, []);

  const acceptJob = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        jobs: prev.jobs.map(j => {
          if (j.id !== id) return j;
          const draft = j.coverLetterDraft || generateCoverLetter(j, prev.userProfile, prev.coverLetterPatterns);
          return { ...j, status: 'accepted' as const, coverLetterDraft: draft };
        }),
      };
    });
  }, []);

  const rejectJob = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        jobs: prev.jobs.map(j =>
          j.id === id ? { ...j, status: 'rejected' as const } : j
        ),
      };
    });
  }, []);

  const updateApplicationStatus = useCallback((id: string, status: ApplicationStatus) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        jobs: prev.jobs.map(j => {
          if (j.id !== id) return j;
          const updates: Partial<Job> = { applicationStatus: status };
          if (status === 'applied') {
            updates.postApplicationStatus = 'applied';
          }
          return { ...j, ...updates };
        }),
      };
    });
  }, []);

  const updatePostApplicationStatus = useCallback((id: string, status: PostApplicationStatus) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        jobs: prev.jobs.map(j =>
          j.id === id ? { ...j, postApplicationStatus: status } : j
        ),
      };
    });
  }, []);

  const togglePriority = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        jobs: prev.jobs.map(j =>
          j.id === id ? { ...j, priority: j.priority === 'high' ? 'normal' : 'high' } : j
        ),
      };
    });
  }, []);

  const saveCoverLetter = useCallback((id: string, draft: string) => {
    setState(prev => {
      if (!prev) return prev;
      const job = prev.jobs.find(j => j.id === id);
      if (!job) return prev;

      const pattern = extractEditPattern(job.coverLetterDraft, draft);
      const newPatterns = pattern
        ? [...prev.coverLetterPatterns, pattern]
        : prev.coverLetterPatterns;

      return {
        ...prev,
        coverLetterPatterns: newPatterns.slice(-20), // Keep last 20 patterns
        jobs: prev.jobs.map(j => {
          if (j.id !== id) return j;
          return {
            ...j,
            coverLetterDraft: draft,
            coverLetterHistory: [...j.coverLetterHistory, draft],
            applicationStatus: j.applicationStatus === 'not_started' ? 'started' : j.applicationStatus,
          };
        }),
      };
    });
  }, []);

  const addJobSite = useCallback((site: JobSite) => {
    setState(prev => prev ? { ...prev, jobSites: [...prev.jobSites, site] } : prev);
  }, []);

  const updateJobSite = useCallback((id: string, updates: Partial<JobSite>) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        jobSites: prev.jobSites.map(s => s.id === id ? { ...s, ...updates } : s),
      };
    });
  }, []);

  const removeJobSite = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      return { ...prev, jobSites: prev.jobSites.filter(s => s.id !== id) };
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setState(prev => {
      if (!prev) return prev;
      return { ...prev, userProfile: { ...prev.userProfile, ...updates } };
    });
  }, []);

  if (!isInitialised || !state) {
    return <div className="flex items-center justify-center min-h-screen font-light tracking-wide text-neutral-500">Loading…</div>;
  }

  const appliedJobs = state.jobs.filter(j => j.applicationStatus === 'applied');
  const stats = {
    totalApplications: appliedJobs.length,
    invitedToTest: appliedJobs.filter(j => j.postApplicationStatus === 'invited_to_test').length,
    invitedToInterview: appliedJobs.filter(j => j.postApplicationStatus === 'invited_to_interview').length,
    rejected: appliedJobs.filter(j => j.postApplicationStatus === 'rejected').length,
    accepted: appliedJobs.filter(j => j.postApplicationStatus === 'accepted').length,
  };

  const value: JobContextType = {
    state,
    addJobs,
    updateJob,
    removeJob,
    acceptJob,
    rejectJob,
    updateApplicationStatus,
    updatePostApplicationStatus,
    togglePriority,
    saveCoverLetter,
    addJobSite,
    updateJobSite,
    removeJobSite,
    updateProfile,
    stats,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
}

export function useJobs() {
  const context = useContext(JobContext);
  if (!context) throw new Error('useJobs must be used within JobProvider');
  return context;
}
