import { ExternalLink } from "lucide-react";
import type { Company } from "../types/company";

interface CompanyCardProps {
  company: Company;
}

const AVATAR_PALETTES = [
  { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#fce7f3", color: "#be185d" },
  { bg: "#d1fae5", color: "#047857" },
  { bg: "#fef3c7", color: "#b45309" },
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#fee2e2", color: "#b91c1c" },
  { bg: "#e0f2fe", color: "#0369a1" },
  { bg: "#f0fdf4", color: "#166534" },
  { bg: "#fdf4ff", color: "#7e22ce" },
  { bg: "#fff7ed", color: "#c2410c" },
];

function getAvatarStyle(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

function shortenUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const avatarStyle = getAvatarStyle(company.name);
  const initial = company.name.charAt(0).toUpperCase();

  return (
    <div className="company-card">
      <div className="company-card__top">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={`${company.name} logo`}
            className="avatar"
            style={{ objectFit: "contain" }}
          />
        ) : (
          <div
            className="avatar"
            style={{ background: avatarStyle.bg, color: avatarStyle.color }}
            aria-hidden="true"
          >
            {initial}
          </div>
        )}
        <div className="company-card__info">
          <h3 className="company-card__name" title={company.name}>
            {company.name}
          </h3>
        </div>
      </div>

      <div className="company-card__footer">
        <a
          href={company.career_page_url}
          target="_blank"
          rel="noopener noreferrer"
          className="company-card__url"
          title={company.career_page_url}
        >
          <ExternalLink size={13} strokeWidth={2} />
          <span>{shortenUrl(company.career_page_url)}</span>
        </a>
      </div>
    </div>
  );
}
