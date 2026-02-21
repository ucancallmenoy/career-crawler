import { useState } from "react";
import { Search, Building2, ServerCrash } from "lucide-react";
import { useCompaniesQuery } from "../hooks/companies/queries/useCompaniesQuery";
import CompanyCard from "../components/CompanyCard";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const { data: companies, isLoading, isError, error } = useCompaniesQuery();

  const filtered = companies?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header__top">
          <h1 className="page-title">Companies</h1>
          {companies && (
            <span className="page-count">{companies.length} sources</span>
          )}
        </div>
        <p className="page-subtitle">Organizations with active job listings in the aggregator</p>
      </div>

      {/* Search */}
      <div className="filter-bar" style={{ marginBottom: "1.75rem" }}>
        <div className="filter-field filter-field--grow">
          <span className="filter-field__icon"><Search size={15} strokeWidth={2} /></span>
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-field__input"
          />
        </div>
      </div>

      {/* Results meta */}
      {!isLoading && filtered && (
        <div className="results-meta">
          <span className="results-meta__count">
            {filtered.length} {filtered.length === 1 ? "company" : "companies"}
            {search ? ` matching "${search}"` : ""}
          </span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="state-message state-message--error">
          <div className="state-message__icon">
            <ServerCrash size={22} strokeWidth={1.5} />
          </div>
          <p className="state-message__title">Failed to load companies</p>
          <p className="state-message__body">{error.message}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="companies-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div style={{ display: "flex", gap: "0.875rem", alignItems: "center" }}>
                <div className="skeleton" style={{ width: 40, height: 40, flexShrink: 0 }} />
                <div className="skeleton" style={{ height: 15, flex: 1 }} />
              </div>
              <div style={{ paddingTop: "0.875rem", borderTop: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ height: 13, width: 140 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered && filtered.length === 0 && (
        <div className="state-message">
          <div className="state-message__icon">
            <Building2 size={22} strokeWidth={1.5} />
          </div>
          <p className="state-message__title">
            {search ? "No companies found" : "No companies yet"}
          </p>
          <p className="state-message__body">
            {search
              ? "Try a different search term."
              : "Run the crawler to populate company data."}
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && filtered && filtered.length > 0 && (
        <div className="companies-grid">
          {filtered.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  );
}
