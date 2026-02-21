import json
import re

import scrapy
from jobcrawler.items import JobItem


class CompanySpider(scrapy.Spider):
    """Aggregate tech job listings from multiple public job board APIs.

    Each source has a dedicated parse method because every API returns a
    different JSON schema.  Using public JSON APIs is deliberate — most
    modern career pages are JavaScript SPAs whose content is invisible to a
    plain HTTP fetcher.  Public APIs give us structured, reliable data.
    """

    name = "company_spider"
    custom_settings = {
        "DOWNLOAD_DELAY": 1,
        "CONCURRENT_REQUESTS_PER_DOMAIN": 1,
        "RETRY_TIMES": 2,
        "USER_AGENT": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "ROBOTSTXT_OBEY": False,  # JSON APIs don't serve robots.txt
    }

    SOURCES = [
        {
            "name": "Remotive",
            "career_page_url": "https://remotive.com",
            "url": "https://remotive.com/api/remote-jobs?limit=100",
            "parser": "parse_remotive",
        },
        {
            "name": "Arbeitnow",
            "career_page_url": "https://www.arbeitnow.com",
            "url": "https://www.arbeitnow.com/api/job-board-api",
            "parser": "parse_arbeitnow",
        },
        {
            "name": "Himalayas",
            "career_page_url": "https://himalayas.app",
            "url": "https://himalayas.app/jobs/api?limit=50",
            "parser": "parse_himalayas",
        },
        {
            "name": "Remotive (PH Remote)",
            "career_page_url": "https://remotive.com",
            "url": "https://remotive.com/api/remote-jobs?limit=100&location=philippines",
            "parser": "parse_remotive",
        },
        {
            "name": "Himalayas (PH)",
            "career_page_url": "https://himalayas.app",
            "url": "https://himalayas.app/jobs/api?limit=50&location=Philippines",
            "parser": "parse_himalayas",
        },
        {
            "name": "Kalibrr",
            "career_page_url": "https://www.kalibrr.com/job-board/te/software-engineer/1",
            "url": "https://www.kalibrr.com/job-board/te/software-engineer/1",
            "parser": "parse_kalibrr",  # HTML scraper
            "format": "html",
        },
    ]

    async def start(self):
        for source in self.SOURCES:
            parser_name = source.get("parser", "")
            callback = getattr(self, parser_name, None)
            if callback is None:
                self.logger.error(
                    "Skipping source '%s': parser '%s' is not defined.",
                    source.get("name", "unknown"),
                    parser_name,
                )
                continue

            headers = {"Accept": "application/json"}
            if source.get("format") == "html":
                headers = {"Accept": "text/html,application/xhtml+xml"}

            yield scrapy.Request(
                url=source["url"],
                callback=callback,
                meta={
                    "source_name": source["name"],
                    "career_page_url": source["career_page_url"],
                },
                errback=self.handle_error,
                headers=headers,
            )

    def handle_error(self, failure):
        self.logger.warning(
            "Request failed for %s: %s",
            failure.request.meta.get("source_name", "unknown"),
            failure.request.url,
        )

    # ── helpers ─────────────────────────────────────────────────────────
    def _make_item(self, title, job_url, company_name, career_page_url,
                   location=None, employment_type=None, external_id=None):
        item = JobItem()
        item["title"] = title.strip()
        item["job_url"] = job_url
        item["company_name"] = company_name
        item["career_page_url"] = career_page_url
        item["location"] = (location or "Remote").strip()
        item["employment_type"] = (employment_type or "").strip() or None
        item["external_id"] = external_id or job_url
        return item

    def _parse_json(self, response, source_name):
        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            self.logger.error(
                "%s: could not decode JSON from %s", source_name, response.url
            )
            return None

    def _looks_like_job_title(self, title):
        text = (title or "").strip().lower()
        if len(text) < 5:
            return False
        noise = {
            "careers",
            "jobs",
            "job board",
            "view all jobs",
            "learn more",
            "read more",
            "apply",
            "apply now",
            "see more",
            "next",
            "previous",
        }
        if text in noise:
            return False
        return True

    # ── Remotive ────────────────────────────────────────────────────────
    def parse_remotive(self, response):
        source = response.meta["source_name"]
        career_page = response.meta["career_page_url"]

        data = self._parse_json(response, source)
        if data is None:
            return

        for job in data.get("jobs", []):
            title = job.get("title", "")
            company = job.get("company_name", "")
            if not title or not company:
                continue

            job_url = job.get("url", "")
            if not job_url:
                continue

            location = job.get("candidate_required_location", "Remote")
            emp_type = job.get("job_type", "")
            ext_id = str(job.get("id", ""))

            yield self._make_item(
                title=title,
                job_url=job_url,
                company_name=company,
                career_page_url=career_page,
                location=location,
                employment_type=emp_type,
                external_id=f"remotive-{ext_id}" if ext_id else None,
            )

    # ── Arbeitnow ──────────────────────────────────────────────────────
    def parse_arbeitnow(self, response):
        source = response.meta["source_name"]
        career_page = response.meta["career_page_url"]

        data = self._parse_json(response, source)
        if data is None:
            return

        for job in data.get("data", []):
            title = job.get("title", "")
            company = job.get("company_name", "")
            if not title or not company:
                continue

            job_url = job.get("url", "")
            if not job_url:
                continue

            location = job.get("location", "Remote")
            job_types = job.get("job_types", [])
            emp_type = ", ".join(job_types) if isinstance(job_types, list) else str(job_types)
            slug = job.get("slug", "")

            yield self._make_item(
                title=title,
                job_url=job_url,
                company_name=company,
                career_page_url=career_page,
                location=location,
                employment_type=emp_type,
                external_id=f"arbeitnow-{slug}" if slug else None,
            )

    # ── Himalayas ──────────────────────────────────────────────────────
    def parse_himalayas(self, response):
        source = response.meta["source_name"]
        career_page = response.meta["career_page_url"]

        data = self._parse_json(response, source)
        if data is None:
            return

        for job in data.get("jobs", []):
            title = job.get("title", "")
            company = job.get("companyName", "")
            if not title or not company:
                continue

            job_url = job.get("applicationLink", "")
            if not job_url:
                guid = job.get("guid", "")
                job_url = f"https://himalayas.app/jobs/{guid}" if guid else ""
            if not job_url:
                continue

            restrictions = job.get("locationRestrictions") or []
            location = ", ".join(restrictions) if restrictions else "Remote"
            emp_type = job.get("employmentType", "")
            guid = job.get("guid", "")

            yield self._make_item(
                title=title,
                job_url=job_url,
                company_name=company,
                career_page_url=career_page,
                location=location,
                employment_type=emp_type,
                external_id=f"himalayas-{guid}" if guid else None,
            )

    def parse_kalibrr(self, response):
        career_page = response.meta["career_page_url"]
        links = response.css("a[href*='/job/'], a[href*='job-board'], a[href*='jobs']") or response.css("a[href]")
        seen = set()
        for link in links:
            href = (link.attrib.get("href") or "").strip()
            if not href or href.startswith("#"):
                continue

            job_url = response.urljoin(href)
            if job_url in seen:
                continue
            seen.add(job_url)

            title = " ".join(
                t.strip() for t in link.css("::text").getall() if t.strip()
            )
            title = re.sub(r"\s+", " ", title).strip()
            if not self._looks_like_job_title(title):
                continue

            yield self._make_item(
                title=title,
                job_url=job_url,
                company_name="Kalibrr",
                career_page_url=career_page,
                location="Philippines",
                employment_type=None,
                external_id=f"kalibrr-{job_url}",
            )
