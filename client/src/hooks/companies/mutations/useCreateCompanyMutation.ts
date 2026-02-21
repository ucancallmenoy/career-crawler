import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../api/axios";
import type { Company, CompanyCreate } from "../../../types/company";

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation<Company, Error, CompanyCreate>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<Company>("/companies", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}
