import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../api/axios";
import type { Job, JobCreate } from "../../../types/job";

export function useCreateJobMutation() {
  const queryClient = useQueryClient();

  return useMutation<Job, Error, JobCreate>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<Job>("/jobs", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
