# Job Aggregator

A full-stack application that aggregates job postings from company career pages.

## Architecture

| Component  | Stack                              | Port |
| ---------- | ---------------------------------- | ---- |
| **API**    | FastAPI · SQLAlchemy · PostgreSQL  | 8000 |
| **Client** | React · TypeScript · TanStack Query | 5173 |
| **Crawler**| Scrapy · psycopg2                  | —    |
| **DB**     | PostgreSQL 16                      | 5432 |

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 16 (or Docker)

## Quick Start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

The API will be available at `http://localhost:8000` and the client at `http://localhost:5173`.

## Local Development

### 1. Database

```bash
# Start PostgreSQL (Docker)
docker compose up postgres -d
```

Or use a local PostgreSQL instance and update `.env` accordingly.

### 2. API

```bash
cd api
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create a .env in /api or export DATABASE_URL
cp ../.env.example .env

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API auto-creates all tables on startup.

### 3. Crawler

```bash
cd crawler
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Ensure DATABASE_URL is set
scrapy crawl company_spider
```

The crawler writes directly to PostgreSQL — it does **not** call the API.

### 4. Client

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## API Endpoints

| Method | Path                     | Description               |
| ------ | ------------------------ | ------------------------- |
| GET    | `/companies`             | List all companies        |
| GET    | `/jobs`                  | List jobs (with filters)  |
| GET    | `/jobs?search=keyword`   | Search jobs by keyword    |
| GET    | `/jobs?location=manila`  | Filter jobs by location   |
| GET    | `/jobs?company_id=1`     | Filter jobs by company    |
| GET    | `/jobs?page=1&size=20`   | Paginated results         |
| GET    | `/jobs/{id}`             | Single job detail         |

## Deploying to Render

### Database

Create a PostgreSQL instance on Render and note the **Internal Database URL**.

### API

1. Create a **Web Service** pointing to the `api/` directory.
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set environment variable `DATABASE_URL` to the Render PostgreSQL URL.

### Client

1. Create a **Static Site** pointing to the `client/` directory.
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`
4. Set environment variable `VITE_API_BASE_URL` to the API URL.

### Crawler

Run the crawler as a **Cron Job** on Render:
- Command: `cd crawler && scrapy crawl company_spider`
- Schedule: daily or as needed.

## License

MIT
