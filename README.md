# Workflow Automation Platform

A powerful enterprise-grade workflow automation platform with visual designer, built with .NET 8 and React.

## Features

- **Visual Workflow Designer** - Drag-and-drop interface using React Flow
- **9 Node Types** - Start, HTTP Request, Delay, Condition, Transform, Email, Script, Database, End
- **Workflow Scheduling** - Cron-based scheduling with Quartz.NET
- **Real-time Monitoring** - Execution tracking and detailed logs
- **Template Library** - 5 pre-built workflow templates
- **Bulk Operations** - Manage multiple workflows at once
- **Import/Export** - JSON-based workflow portability
- **Execution Retry** - Automatically retry failed workflows
- **Keyboard Shortcuts** - Fast navigation (press `?` to see all)
- **Search & Filtering** - Find workflows and executions quickly
- **Pagination** - Efficient handling of large datasets

## Tech Stack

**Backend:**
- .NET 8 with Clean Architecture
- Entity Framework Core + PostgreSQL
- Quartz.NET for job scheduling
- Redis for caching
- JWT authentication
- Microsoft.CodeAnalysis for C# script execution

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS
- React Flow for workflow designer
- Zustand for state management
- Sonner for toast notifications

## Project Structure

```
WorkFlowAutomation/
├── backend/              # .NET 8 solution
│   ├── src/
│   │   ├── WorkflowAutomation.Domain/          # Domain entities and enums
│   │   ├── WorkflowAutomation.Application/     # Business logic and executors
│   │   ├── WorkflowAutomation.Infrastructure/  # Data access and external services
│   │   └── WorkflowAutomation.API/            # Web API controllers
│   └── Dockerfile
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── types/        # TypeScript type definitions
│   │   └── data/         # Workflow templates
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml    # Full stack orchestration
```

## Quick Start with Docker

### Prerequisites
- Docker Desktop (or Docker Engine + Docker Compose)
- 4GB+ RAM recommended
- Ports 3000, 5000, 5432, 6379 available

### Run the Application

```bash
# Start all services (PostgreSQL, Redis, API, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### First Time Setup
1. Navigate to http://localhost:3000/register
2. Create a new account
3. Login and start building workflows!

## Development Setup

### Backend Development

**Prerequisites:** .NET 8 SDK, PostgreSQL 15+, Redis (optional)

```bash
cd backend

# Restore dependencies
dotnet restore

# Run migrations
dotnet ef database update --project src/WorkflowAutomation.Infrastructure --startup-project src/WorkflowAutomation.API

# Run the API
cd src/WorkflowAutomation.API
dotnet run
```

API available at http://localhost:5000

### Frontend Development

**Prerequisites:** Node.js 20+

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

Frontend available at http://localhost:5173

## Keyboard Shortcuts

Press `?` anywhere in the application to see all shortcuts.

- **D** - Go to Dashboard
- **W** - Go to Workflows
- **E** - Go to Executions
- **S** - Go to Schedules
- **N** - New Workflow (on Workflows page)
- **Esc** - Close dialogs

## Available Node Types

1. **Start** - Workflow entry point
2. **HTTP Request** - Make API calls (GET, POST, PUT, DELETE)
3. **Delay** - Wait for a specified duration
4. **Condition** - Branch based on conditions
5. **Transform** - Transform data using C# scripts
6. **Email** - Send emails via SMTP
7. **Script** - Execute custom C# code with full access to context
8. **Database** - Run SQL queries (PostgreSQL, SQL Server)
9. **End** - Workflow completion

## Workflow Templates

The platform includes 5 pre-built templates:
- **Daily Report Email** - Fetch data from API and send email report
- **Database Sync** - Sync data between API and database
- **Conditional Alert** - Check API health and send alert if unhealthy
- **API Processing Pipeline** - Multi-step API processing with delays
- **Database Report Generator** - Query database and email formatted results

## Health Check Endpoints

The API includes comprehensive health check endpoints for monitoring:

- **GET /api/health** - Overall health status with database and Redis checks
- **GET /api/health/ready** - Readiness probe (checks if database is ready)
- **GET /api/health/live** - Liveness probe (checks if API is responsive)

Docker Compose includes automated health checks for all services:
- PostgreSQL: `pg_isready` check every 10s
- Redis: `redis-cli ping` check every 10s
- API: HTTP check on `/api/health/live` every 30s
- Frontend: HTTP check on root path every 30s

## API Documentation

Once the API is running, visit http://localhost:5000/swagger for interactive API documentation.

## License

MIT
