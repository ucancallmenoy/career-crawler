import logging
import os
from datetime import datetime, timezone

import psycopg2
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class PostgresPipeline:
    def open_spider(self):
        database_url = os.getenv(
            "DATABASE_URL",
            "postgresql://postgres:postgres@localhost:5432/job_aggregator",
        )
        self.conn = psycopg2.connect(database_url)
        self.conn.autocommit = False
        self.cur = self.conn.cursor()
        self._ensure_tables()

    def close_spider(self):
        try:
            self.conn.commit()
        except Exception:
            self.conn.rollback()
        finally:
            self.cur.close()
            self.conn.close()

    def _ensure_tables(self):
        try:
            self.cur.execute(
                """
                CREATE TABLE IF NOT EXISTS companies (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL UNIQUE,
                    career_page_url VARCHAR(512) NOT NULL,
                    logo_url VARCHAR(512),
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
                """
            )
            self.cur.execute(
                """
                CREATE TABLE IF NOT EXISTS jobs (
                    id SERIAL PRIMARY KEY,
                    external_id VARCHAR(255),
                    title VARCHAR(512) NOT NULL,
                    location VARCHAR(255),
                    employment_type VARCHAR(100),
                    job_url VARCHAR(1024) NOT NULL UNIQUE,
                    company_id INTEGER NOT NULL REFERENCES companies(id),
                    is_active BOOLEAN DEFAULT TRUE,
                    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
                    last_seen_at TIMESTAMPTZ DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON jobs(external_id);
                CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
                CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(title);
                CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
                """
            )
            self.cur.execute(
                "ALTER TABLE jobs ALTER COLUMN is_active SET DEFAULT TRUE;"
            )
            self.cur.execute(
                "UPDATE jobs SET is_active = TRUE WHERE is_active IS NULL;"
            )
            self.conn.commit()
        except Exception:
            self.conn.rollback()
            raise

    def _get_or_create_company(self, name: str, career_page_url: str) -> int:
        self.cur.execute("SELECT id FROM companies WHERE name = %s", (name,))
        row = self.cur.fetchone()
        if row:
            return row[0]
        self.cur.execute(
            "INSERT INTO companies (name, career_page_url) VALUES (%s, %s) RETURNING id",
            (name, career_page_url),
        )
        company_id = self.cur.fetchone()[0]
        self.conn.commit()
        return company_id

    def process_item(self, item):
        try:
            company_id = self._get_or_create_company(
                item["company_name"], item["career_page_url"]
            )
            now = datetime.now(timezone.utc)

            self.cur.execute(
                "SELECT id FROM jobs WHERE job_url = %s", (item["job_url"],)
            )
            existing = self.cur.fetchone()

            if existing:
                self.cur.execute(
                    "UPDATE jobs SET last_seen_at = %s, is_active = TRUE WHERE id = %s",
                    (now, existing[0]),
                )
            else:
                self.cur.execute(
                    """
                    INSERT INTO jobs
                        (external_id, title, location, employment_type, job_url, company_id, is_active, first_seen_at, last_seen_at)
                    VALUES (%s, %s, %s, %s, %s, %s, TRUE, %s, %s)
                    """,
                    (
                        item.get("external_id"),
                        item["title"],
                        item.get("location"),
                        item.get("employment_type"),
                        item["job_url"],
                        company_id,
                        now,
                        now,
                    ),
                )

            self.conn.commit()
        except Exception as exc:
            self.conn.rollback()
            logger.error("Failed to process item %s: %s", item.get("job_url"), exc)

        return item
