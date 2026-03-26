// Job site configuration
export interface JobSiteFilters {
  maxYearsExperience: number | null;
  jobLevel: string[];
  sector: string[];
  excludeTerms: string[];
}

export interface JobSite {
  id: string;
  name: string;
  careerPageUrl: string;
  searchTerms: string[];
  filters: JobSiteFilters;
  enabled: boolean;
  lastScanned: string | null;
}

// Job statuses
export type JobStatus = 'potential' | 'accepted' | 'rejected';
export type ApplicationStatus = 'not_started' | 'started' | 'applied';
export type PostApplicationStatus = 'applied' | 'invited_to_test' | 'invited_to_interview' | 'rejected' | 'accepted';
export type Priority = 'normal' | 'high';

export const POST_APPLICATION_LABELS: Record<PostApplicationStatus, string> = {
  applied: 'Applied',
  invited_to_test: 'Invited to Test',
  invited_to_interview: 'Invited to Interview',
  rejected: 'Rejected',
  accepted: 'Accepted',
};

// Core job entity
export interface Job {
  id: string;
  title: string;
  organisation: string;
  location: string;
  deadline: string | null;
  applicationUrl: string;
  description: string;
  salary: string;
  sourceSite: string;
  scannedAt: string;
  relevanceScore: number;
  relevanceReasons: string[];
  status: JobStatus;
  applicationStatus: ApplicationStatus;
  priority: Priority;
  postApplicationStatus: PostApplicationStatus | null;
  coverLetterDraft: string;
  coverLetterHistory: string[];
}

// User profile
export interface UserProfile {
  name: string;
  summary: string;
  skills: string[];
  experience: string;
  yearsOfExperience: number;
  preferredLocations: string[];
  coverLetterFolderPath: string;
}

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  summary: '',
  skills: [],
  experience: '',
  yearsOfExperience: 0,
  preferredLocations: [],
  coverLetterFolderPath: '',
};

// Full app state
export interface AppState {
  jobs: Job[];
  jobSites: JobSite[];
  userProfile: UserProfile;
  coverLetterPatterns: string[];
  relevanceThreshold: number;
}

export const DEFAULT_STATE: AppState = {
  jobs: [],
  jobSites: [],
  userProfile: DEFAULT_PROFILE,
  coverLetterPatterns: [],
  relevanceThreshold: 30,
};
