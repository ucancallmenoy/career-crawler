export interface Company {
  id: number;
  name: string;
  career_page_url: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyCreate {
  name: string;
  career_page_url: string;
  logo_url?: string;
}
