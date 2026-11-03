# ERP-MAS-and-KB-RAG

Modular ERP with a FastAPI backend and a Next.js frontend. Finance, sales, inventory, projects, and process-control APIs are implemented. Multi-agent and knowledge-graph RAG support is scaffolding.

## Features

### Implemented

The HTTP API lives in `backend/main.py` and is served by Uvicorn.

- **Authentication.** `POST /token` accepts an OAuth2 password form (username and password) and returns a JWT. `GET /` requires that bearer token and returns the API version plus a module list. Passwords are hashed with bcrypt.
- **Finance and accounting** (`/api/finance`). Accounts, transactions, and invoices, plus income-statement, balance-sheet, and cash-flow reports.
- **Sales and orders** (`/api/sales`). Customers, orders, order status, and sales reports by customer, product, and period.
- **Inventory and supply chain** (`/api/inventory`). Products, stock movements, suppliers, purchase orders, inventory valuation, stock-movement history, and a low-stock report.
- **Business process controls** (`/api/processes`). Process events, workflow rules, active alerts, delayed shipments, and a process-performance report.
- **Projects** (`/api/projects`). Projects, tasks, status updates, a project-performance report, and a resource-allocation report.
- **Dashboard summary.** `GET /api/dashboard/summary` returns revenue, expenses, profit, active order count, low-stock count, a six-month sales trend, and pending process events.
- **API reference.** Swagger UI at `/api/docs`, ReDoc at `/api/redoc`, OpenAPI schema at `/api/openapi.json`.

The web app is a Next.js App Router project under `frontend/`.

- Pages: `/`, `/login`, `/register`, `/dashboard`, `/sales`, `/inventory`, `/finance`, `/projects`, `/hr`, `/analytics`, `/settings`.
- Sign-in state is stored in the browser with Zustand (`frontend/store/auth.ts`) and persisted in `localStorage`.
- Light, dark, and system themes via `next-themes`.

Backend tests in `backend/tests/` cover login and the finance, sales, inventory, project, and dashboard routes. They run against an in-memory SQLite database.

### On the roadmap

The repository name and several screens refer to a multi-agent system (MAS) and knowledge-graph RAG (KG-RAG). Those pieces store records and report `in_progress`. They do not run agents or generate answers.

- **MAS.** `/api/mas/agents` creates, lists, reads, updates, and deletes rows in `agent_configs` (name, type, JSON configuration, active flag). `GET /api/extension/mas/status` returns `"status": "in_progress"`. The dashboard card `MASExtensionPoint` disables its button with the label "Configure MAS (Coming Soon)". The status payload also names `/api/extension/mas/tasks` and `/api/extension/mas/coordination`, which have no route handlers.
- **Knowledge graph and RAG.** `/api/knowledge/entities` stores `knowledge_entities` rows, including an optional float array. `search_knowledge_entities` builds a constant 768-dimension vector (`[0.1] * 768`) and orders by `cosine_distance`. The function comments say embedding generation still has to be replaced with a real model. There is no language-model call and no retrieval-augmented generation step. `entity_relationships` is declared on the SQLAlchemy metadata and has no API. `GET /api/extension/kg-rag/status` returns `"status": "in_progress"` and names `/api/knowledge/query` and `/api/knowledge/relationships`, which have no handlers. The search route is registered after `GET /entities/{entity_id}` (`entity_id` is an integer), so `/api/knowledge/entities/search` does not reach the search function. The dashboard card `KGRAGExtensionPoint` is labeled "Configure KG-RAG (Coming Soon)".
- **Browser auth is separate from the API.** `/login` and `/register` write a name and email into the Zustand store. They do not call `POST /token`, and the API has no registration route. A role-check helper exists in `backend/main.py` and is not attached to the module routers. Module routes answer without a bearer token. Only `GET /` requires one.
- **Most module pages do not load API data.** Sales, inventory, finance, projects, HR, and analytics each simulate a request whose success branch is `if (false)`, then show an error. HR, analytics, and settings have no backend module. Settings renders three static cards (General, Users, Roles).
- **Dashboard request path.** `frontend/app/dashboard/page.tsx` and `frontend/components/recent-alerts.tsx` call `GET http://localhost:8000/api/dashboard`. The implemented summary route is `GET /api/dashboard/summary`, and its JSON uses `financial_kpis`, `active_orders`, `low_stock_items`, `sales_trend`, and `notifications`.
- **Models with little or no API surface.** Marking an order `shipped` via `PUT /api/sales/orders/{order_id}/status` inserts a `Shipment` with carrier `"Default Carrier"` and a generated tracking number. `GET /api/processes/monitoring/delayed-shipments` lists shipments whose status is `delayed`; no route sets that status. `BOMItem`, `ProductionOrder`, `Report`, `Dashboard`, and `DashboardWidget` have SQLAlchemy models and Pydantic schemas, and no service routes. The `GET /` payload lists "Material Requirements Planning" and "Integration Layer"; neither name has a router.
- **Unused database clients.** `frontend/lib/db.ts` builds a Neon/Drizzle client and is not imported anywhere. `supabase/config.toml` is a Supabase CLI config. The API connects with the URL hardcoded in `backend/database.py`.

## Tech stack

Versions below are the ones pinned in the manifest files.

| Area | Stack |
| --- | --- |
| Frontend | Next.js 15.2.4, React 19, TypeScript 5, Tailwind CSS 3.4, Radix UI, Tremor 3, Zustand 5, next-themes. Package name in `frontend/package.json`: `my-v0-project`. |
| Backend | Python, FastAPI 0.109.2, Uvicorn 0.27.1, SQLAlchemy 2.0.27, Pydantic 2.6.1, PyJWT 2.8.0, passlib with bcrypt, psycopg, pgvector 0.2.2, python-dotenv 1.1.0 (the `load_dotenv()` call in `database.py` is commented out). |
| Database | PostgreSQL. Tables are created with `Base.metadata.create_all` when the API process imports `backend/main.py`, and again when `backend/seed_core_data.py` runs. |
| Tests | pytest 7.4.3, pytest-cov, pytest-asyncio, httpx, from `backend/`. |

`.github/workflows/main.yml` installs Python 3.8 and 3.9 for the test job. Alembic config is checked in (`alembic.ini`, `backend/alembic/`). `alembic` is not listed in `backend/requirements.txt`, `alembic.ini` still has `sqlalchemy.url = driver://user:pass@localhost/dbname`, and `backend/alembic/env.py` sets `target_metadata = None`.

## Project layout

```
.
├── backend/
│   ├── main.py                 # FastAPI app and routers
│   ├── database.py             # SQLAlchemy engine (hardcoded PostgreSQL URL)
│   ├── models.py
│   ├── schemas.py
│   ├── seed_core_data.py
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── services/               # finance, sales, inventory, process, project, dashboard, agent, knowledge
│   ├── tests/
│   └── alembic/
├── frontend/
│   ├── app/                    # Next.js routes
│   ├── package.json
│   ├── pnpm-lock.yaml          # pnpm lockfileVersion 9.0
│   └── package-lock.json
├── supabase/config.toml        # Supabase CLI config; the API does not read it
├── alembic.ini
├── AGENTS.md
└── LICENSE
```

## Prerequisites

- Git
- Python 3.8 or newer and pip (the GitHub Actions test matrix uses 3.8 and 3.9)
- PostgreSQL accepting connections on `127.0.0.1` port **5433**
- Node.js 18.18 or newer (the range Next.js 15.2.4 supports)
- pnpm 9 or newer, matching `frontend/pnpm-lock.yaml` (`lockfileVersion: 9.0`). `frontend/package-lock.json` is also in the tree; the commands below use pnpm, which is what `AGENTS.md` uses.

The repository has no Docker Compose file.

## Setup

Clone the repository:

```bash
git clone https://github.com/inasfarras/ERP-MAS-and-KB-RAG.git
cd ERP-MAS-and-KB-RAG
```

### PostgreSQL

`backend/database.py` sets the engine URL in code:

```text
postgresql+psycopg://erpuser:testpass@127.0.0.1:5433/erpdb
```

Create that role and database (the password is the one already committed in `database.py`):

```sql
CREATE USER erpuser WITH PASSWORD 'testpass';
CREATE DATABASE erpdb OWNER erpuser;
```

The API connects to PostgreSQL on port 5433. A server left on the default port 5432 will not match this URL. `DATABASE_URL` is not read; the `os.getenv` and `load_dotenv` lines in `database.py` are comments.

### Backend

From `backend/` (imports are `database`, `models`, and `services`, so the working directory matters):

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed_core_data.py
```

`seed_core_data.py` creates tables and, when the tables are empty, inserts users, customers, suppliers, products, inventory movements, and five ledger accounts.

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `adminpass` | admin |
| `sales_mgr` | `salespass` | sales |
| `inv_mgr` | `invpass` | inventory |

### Frontend

```bash
cd frontend
pnpm install
```

## Run

Start the API from `backend/` with the virtual environment active:

```bash
uvicorn main:app --reload
```

`backend/main.py` binds `0.0.0.0:8000` when launched as a script. The command above uses Uvicorn’s default, `http://127.0.0.1:8000`.

- API root (requires a bearer token): http://127.0.0.1:8000/
- Swagger UI: http://127.0.0.1:8000/api/docs
- ReDoc: http://127.0.0.1:8000/api/redoc

Request a token for the seeded admin user:

```bash
curl -X POST http://127.0.0.1:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=adminpass"
```

Start the frontend from `frontend/`:

```bash
pnpm dev
```

Next.js serves the app at http://localhost:3000.

Scripts defined in `frontend/package.json`:

| Script | What it runs |
| --- | --- |
| `pnpm dev` | `next dev` |
| `pnpm build` | `next build` |
| `pnpm start` | `next start` |
| `pnpm lint` | `next lint` |

`frontend/package.json` has no `test` script.

## Tests

Run the backend suite from `backend/`, where `pytest.ini` sets `testpaths = tests`:

```bash
pytest
```

The tests override `get_db` with in-memory SQLite. Importing `main.py` still executes `create_all` on the PostgreSQL engine, so PostgreSQL has to be reachable at the hardcoded URL before `pytest` or `uvicorn` starts.

`AGENTS.md` also lists `flake8`, `black --check .`, `isort --check-only .`, and `pnpm lint` (run from `frontend/`). The workflow's lint job installs flake8, black, and isort. Those three tools are not in `backend/requirements.txt`. The workflow does not run `pnpm lint`.

`.github/workflows/main.yml` triggers on `push` and `pull_request` to the branch `main`. This repository’s default branch is `master`. The deploy job prints `Deploying to production...` and has no further deploy commands.

## Contributing

Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`). Contributor checks are described in `AGENTS.md`.

## License

This project is licensed under the MIT License. Copyright (c) 2026 Farras Inas. See [LICENSE](LICENSE).
