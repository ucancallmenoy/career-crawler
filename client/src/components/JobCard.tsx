import { MapPin, Building2, Clock, ExternalLink } from "lucide-react";
import type { Job } from "../types/job";

interface JobCardProps {
  job: Job;
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

function getTypeBadgeClass(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("contract") || t.includes("freelance")) return "badge--type-contract";
  if (t.includes("part")) return "badge--type-parttime";
  return "badge--type";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function JobCard({ job }: JobCardProps) {
  const avatarStyle = getAvatarStyle(job.company.name);
  const initial = job.company.name.charAt(0).toUpperCase();

  return (
    <div className="job-card">
      <div className="job-card__top">
        <div
          className="avatar"
          style={{ background: avatarStyle.bg, color: avatarStyle.color }}
          aria-hidden="true"
        >
          {initial}
        </div>
        <div className="job-card__header">
          <h3 className="job-card__title" title={job.title}>
            {job.title}
          </h3>
          <span className="job-card__company">
            <Building2 size={12} strokeWidth={2} />
            {job.company.name}
          </span>
        </div>
      </div>

      <div className="job-card__badges">
        {job.location && (
          <span className="badge badge--location">
            <MapPin size={11} strokeWidth={2} />
            {job.location}
          </span>
        )}
        {job.employment_type && (
          <span className={`badge ${getTypeBadgeClass(job.employment_type)}`}>
            {job.employment_type}
          </span>
        )}
      </div>

      <div className="job-card__footer">
        <span className="job-card__date">
          <Clock size={12} strokeWidth={2} />
          {formatDate(job.last_seen_at)}
        </span>
        <a
          href={job.job_url}
          target="_blank"
          rel="noopener noreferrer"
          className="job-card__apply"
        >
          Apply
          <ExternalLink size={12} strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
}
