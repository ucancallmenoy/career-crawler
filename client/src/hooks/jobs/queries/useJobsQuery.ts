import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/axios";
import type { PaginatedJobs, JobFilters } from "../../../types/job";

export function useJobsQuery(filters: JobFilters = {}) {
  return useQuery<PaginatedJobs>({
    queryKey: ["jobs", filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (filters.search) params.search = filters.search;
      if (filters.location) params.location = filters.location;
      if (filters.company_id) params.company_id = filters.company_id;
      if (filters.page) params.page = filters.page;
      if (filters.size) params.size = filters.size;

      const { data } = await apiClient.get<PaginatedJobs>("/jobs", { params });
      return data;
    },
  });
}
