import { useState } from "react";
import {
  Search,
  MapPin,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ServerCrash,
  SearchX,
} from "lucide-react";
import { useJobsQuery } from "../hooks/jobs/queries/useJobsQuery";
import { useCompaniesQuery } from "../hooks/companies/queries/useCompaniesQuery";
import JobCard from "../components/JobCard";
import type { JobFilters } from "../types/job";

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
        <div className="skeleton" style={{ width: 40, height: 40, flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div className="skeleton" style={{ height: 16, width: "70%" }} />
          <div className="skeleton" style={{ height: 13, width: "40%" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <div className="skeleton" style={{ height: 22, width: 90, borderRadius: 9999 }} />
        <div className="skeleton" style={{ height: 22, width: 70, borderRadius: 9999 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.875rem", borderTop: "1px solid var(--border)" }}>
        <div className="skeleton" style={{ height: 13, width: 100 }} />
        <div className="skeleton" style={{ height: 30, width: 72, borderRadius: 8 }} />
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    size: 30,
  });

  const { data, isLoading, isError, error } = useJobsQuery(filters);
  const { data: companies } = useCompaniesQuery();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFilters((prev) => ({ ...prev, search: e.target.value || undefined, page: 1 }));

  const handleLocation = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFilters((prev) => ({ ...prev, location: e.target.value || undefined, page: 1 }));

  const handleCompany = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setFilters((prev) => ({
      ...prev,
      company_id: e.target.value ? Number(e.target.value) : undefined,
      page: 1,
    }));

  const handleType = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setFilters((prev) => ({
      ...prev,
      // employment_type filter not in backend yet; kept for future extension
      page: 1,
    }));

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header__top">
          <h1 className="page-title">Job Listings</h1>
          {data && (
            <span className="page-count">{data.total.toLocaleString()} positions</span>
          )}
        </div>
        <p className="page-subtitle">Browse opportunities aggregated from multiple sources</p>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-field filter-field--grow">
          <span className="filter-field__icon"><Search size={15} strokeWidth={2} /></span>
          <input
            type="text"
            placeholder="Search job titles..."
            value={filters.search ?? ""}
            onChange={handleSearch}
            className="filter-field__input"
          />
        </div>

        <div className="filter-field">
          <span className="filter-field__icon"><MapPin size={15} strokeWidth={2} /></span>
          <input
            type="text"
            placeholder="Location"
            value={filters.location ?? ""}
            onChange={handleLocation}
            className="filter-field__input"
          />
        </div>

        <div className="filter-field">
          <span className="filter-field__icon"><Building2 size={15} strokeWidth={2} /></span>
          <select
            value={filters.company_id ?? ""}
            onChange={handleCompany}
            className="filter-field__select"
          >
            <option value="">All Companies</option>
            {companies?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="filter-field__select-arrow">
            <ChevronRight size={14} strokeWidth={2} style={{ transform: "rotate(90deg)" }} />
          </span>
        </div>

        <div className="filter-field">
          <span className="filter-field__icon"><Briefcase size={15} strokeWidth={2} /></span>
          <select onChange={handleType} className="filter-field__select">
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
          </select>
          <span className="filter-field__select-arrow">
            <ChevronRight size={14} strokeWidth={2} style={{ transform: "rotate(90deg)" }} />
          </span>
        </div>
      </div>

      {/* Results metadata */}
      {data && !isLoading && (
        <div className="results-meta">
          <span className="results-meta__count">
            Showing {data.items.length} of {data.total.toLocaleString()} jobs
            {filters.search ? ` for "${filters.search}"` : ""}
          </span>
          <span>Page {data.page} of {data.pages}</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="state-message state-message--error">
          <div className="state-message__icon">
            <ServerCrash size={22} strokeWidth={1.5} />
          </div>
          <p className="state-message__title">Failed to load jobs</p>
          <p className="state-message__body">{error.message}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="jobs-grid">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data && data.items.length === 0 && (
        <div className="state-message">
          <div className="state-message__icon">
            <SearchX size={22} strokeWidth={1.5} />
          </div>
          <p className="state-message__title">No results found</p>
          <p className="state-message__body">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && data && data.items.length > 0 && (
        <div className="jobs-grid">
          {data.items.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="pagination">
          <button
            className="pagination__btn"
            disabled={data.page <= 1}
            onClick={() => setFilters((prev) => ({ ...prev, page: data.page - 1 }))}
          >
            <ChevronLeft size={15} strokeWidth={2} />
            Previous
          </button>
          <span className="pagination__info">
            Page {data.page} of {data.pages}
          </span>
          <button
            className="pagination__btn"
            disabled={data.page >= data.pages}
            onClick={() => setFilters((prev) => ({ ...prev, page: data.page + 1 }))}
          >
            Next
            <ChevronRight size={15} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
