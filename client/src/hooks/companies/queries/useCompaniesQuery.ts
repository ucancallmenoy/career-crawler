import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/axios";
import type { Company } from "../../../types/company";

export function useCompaniesQuery() {
  return useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data } = await apiClient.get<Company[]>("/companies");
      return data;
    },
  });
}
