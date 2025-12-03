# Workflow Automation App

A full-stack workflow automation platform with visual workflow designer, built with React and .NET Core.

## Features

- Visual workflow designer using React Flow
- Multiple node types: HTTP Request, Delay, Condition, Transform
- Background workflow execution with retry logic
- Real-time execution monitoring and logs
- User authentication and role-based access control
- Workflow scheduling with cron expressions
- Admin dashboard for user management

## Tech Stack

**Backend:**
- .NET 8 with Clean Architecture
- Entity Framework Core + PostgreSQL
- Hangfire for background jobs
- JWT authentication
- MediatR (CQRS pattern)

**Frontend:**
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS + shadcn/ui
- React Flow for workflow designer
- Zustand for state management
- TanStack Query for data fetching

## Project Structure

```
WorkFlowAutomation/
├── backend/              # .NET solution
│   ├── src/
│   │   ├── WorkflowAutomation.Domain/
│   │   ├── WorkflowAutomation.Application/
│   │   ├── WorkflowAutomation.Infrastructure/
│   │   └── WorkflowAutomation.API/
│   └── tests/
└── frontend/             # React app
    └── workflow-automation-ui/
```

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js 18+
- PostgreSQL 15
- Docker (optional, for containerized setup)

### Backend Setup

1. Navigate to backend directory
```bash
cd backend
```

2. Restore dependencies
```bash
dotnet restore
```

3. Update connection string in `appsettings.json`

4. Run migrations
```bash
dotnet ef database update --project src/WorkflowAutomation.Infrastructure
```

5. Run the API
```bash
dotnet run --project src/WorkflowAutomation.API
```

API will be available at `https://localhost:7001`

### Frontend Setup

1. Navigate to frontend directory
```bash
cd frontend/workflow-automation-ui
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```env
VITE_API_URL=https://localhost:7001/api
```

4. Run development server
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Docker Setup (Alternative)

Run both backend and database with Docker Compose:

```bash
docker-compose up -d
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system architecture and design patterns.

## Development Roadmap

- [ ] Phase 1: Project setup and authentication
- [ ] Phase 2: Workflow designer UI
- [ ] Phase 3: Workflow execution engine
- [ ] Phase 4: Background processing
- [ ] Phase 5: Dashboard and analytics
- [ ] Phase 6: Testing and deployment

## API Documentation

Once the API is running, visit `https://localhost:7001/swagger` for interactive API documentation.

## License

MIT
