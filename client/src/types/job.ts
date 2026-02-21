import type { Company } from "./company";

export interface Job {
  id: number;
  external_id: string | null;
  title: string;
  location: string | null;
  employment_type: string | null;
  job_url: string;
  company_id: number;
  is_active: boolean;
  first_seen_at: string;
  last_seen_at: string;
  company: Company;
}

export interface JobCreate {
  title: string;
  location?: string;
  employment_type?: string;
  job_url: string;
  external_id?: string;
  company_id: number;
}

export interface PaginatedJobs {
  items: Job[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface JobFilters {
  search?: string;
  location?: string;
  company_id?: number;
  page?: number;
  size?: number;
}
