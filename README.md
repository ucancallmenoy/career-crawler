# CareerCrawler

CareerCrawler is a full-stack job aggregation app that crawls multiple job sources, stores jobs in PostgreSQL, and serves them through a FastAPI backend and React frontend.

## Stack

| Component | Stack | Port |
| --- | --- | --- |
| API | FastAPI, SQLAlchemy, PostgreSQL | 8000 |
| Client | React, TypeScript, Vite, TanStack Query | 5173 |
| Crawler | Scrapy, psycopg2 | - |
| Database | PostgreSQL | 5432 |

## What This Project Is Used For

- Aggregate job listings from multiple sources into one database.
- Expose searchable and filterable job/company endpoints.
- Provide a simple UI for browsing jobs.
- Run crawling repeatedly to keep job data fresh.

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (local install or Docker)

## Run Locally

### 1. Configure environment

Create a root `.env` from `.env.example`:

```bash
cp .env.example .env
```

Set `DATABASE_URL` to your local PostgreSQL instance, for example:

```env
DATABASE_URL=postgresql://admin:admin@localhost:5432/job_aggregator
```

### 2. Start PostgreSQL

Use your local PostgreSQL service, or run just DB via Docker:

```bash
docker compose up postgres -d
```

### 3. Run API

```bash
cd api
python -m venv venv
source venv/Scripts/activate  # Git Bash on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API health check:

- `GET http://localhost:8000/`

### 4. Run crawler

```bash
cd crawler
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
export DATABASE_URL='postgresql://admin:admin@localhost:5432/job_aggregator'
scrapy crawl company_spider -L INFO
```

Notes:

- The crawler writes directly to PostgreSQL.
- It does not call the API.
- You can override `DATABASE_URL` with `export` before crawling.

### 5. Run client

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## API Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/companies` | List companies |
| GET | `/jobs` | List jobs with filters/pagination |
| GET | `/jobs?search=keyword` | Search jobs |
| GET | `/jobs?location=manila` | Filter by location |
| GET | `/jobs?company_id=1` | Filter by company |
| GET | `/jobs/{id}` | Job details |

## How To Add Another Crawl Source

Update `crawler/jobcrawler/spiders/company_spider.py`.

1. Add a source entry in `SOURCES`:

```python
{
    "name": "Example Source",
    "career_page_url": "https://example.com",
    "url": "https://example.com/api/jobs",
    "parser": "parse_example",
}
```

2. Implement the parser method `parse_example(self, response)` in the spider.

3. Parse response data and yield normalized `JobItem` using `_make_item(...)` with:
- `title`
- `job_url`
- `company_name`
- `career_page_url`
- `location` (optional but recommended)
- `employment_type` (optional)
- `external_id` (recommended for dedupe consistency)

4. If source is HTML (not JSON), set source format and parse links/content accordingly.

5. Run and verify:

```bash
scrapy crawl company_spider -L INFO
```

6. Validate data in DB and API:
- `GET /companies`
- `GET /jobs`

## License

MIT
