import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/axios";
import type { Job } from "../../../types/job";

export function useJobQuery(jobId: number) {
  return useQuery<Job>({
    queryKey: ["jobs", jobId],
    queryFn: async () => {
      const { data } = await apiClient.get<Job>(`/jobs/${jobId}`);
      return data;
    },
    enabled: jobId > 0,
  });
}
