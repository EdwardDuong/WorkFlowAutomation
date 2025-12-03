# Workflow Automation App - System Architecture

## Overview

A full-stack workflow automation platform that allows users to design, schedule, and execute custom workflows through a visual interface. Built with React + .NET Core following Clean Architecture principles.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │     React SPA (Vite + TypeScript + Tailwind)              │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │  │
│  │  │ Workflow   │  │ Dashboard  │  │  Admin Panel     │   │  │
│  │  │ Designer   │  │ & History  │  │  User Mgmt       │   │  │
│  │  │(React Flow)│  │            │  │                  │   │  │
│  │  └────────────┘  └────────────┘  └──────────────────┘   │  │
│  │           │              │                  │            │  │
│  │           └──────────────┴──────────────────┘            │  │
│  │                         │                                │  │
│  │                   API Client Layer                       │  │
│  │              (Axios + TanStack Query)                    │  │
│  └──────────────────────────┬───────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTPS/JSON
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                  Backend Layer (.NET Core)                      │
│  ┌──────────────────────────┴────────────────────────────────┐ │
│  │              API Gateway / Controllers                     │ │
│  │    (Authentication, Rate Limiting, Validation)             │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│  ┌────────────────────┴───────────────────────────────────────┐ │
│  │               Application Layer (CQRS)                     │ │
│  │  ┌──────────────┐         ┌──────────────────────────┐    │ │
│  │  │  Commands    │         │       Queries            │    │ │
│  │  │  (Write)     │         │       (Read)             │    │ │
│  │  └──────────────┘         └──────────────────────────┘    │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│  ┌────────────────────┴───────────────────────────────────────┐ │
│  │               Domain Layer (Core Business Logic)           │ │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐    │ │
│  │  │ Workflow │  │  Execution   │  │    Node Types    │    │ │
│  │  │ Entities │  │  Engine      │  │   (Strategy)     │    │ │
│  │  └──────────┘  └──────────────┘  └──────────────────┘    │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│  ┌────────────────────┴───────────────────────────────────────┐ │
│  │            Infrastructure Layer                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │ │
│  │  │ EF Core      │  │  Background  │  │   External     │  │ │
│  │  │ Repository   │  │  Workers     │  │   Services     │  │ │
│  │  │              │  │  (Hangfire)  │  │   (HTTP, etc)  │  │ │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │ │
│  └────────────────────┬───────────────────────────────────────┘ │
└───────────────────────┼──────────────────────────────────────────┘
                        │
        ┌───────────────┴────────────────┐
        │                                │
┌───────┴────────┐              ┌────────┴────────┐
│  PostgreSQL    │              │  Redis Cache    │
│  Database      │              │  (Optional)     │
└────────────────┘              └─────────────────┘
```

## Clean Architecture - Backend Structure

```
WorkflowAutomation.sln
│
├── src/
│   ├── WorkflowAutomation.Domain/              # Core business logic
│   │   ├── Entities/
│   │   │   ├── Workflow.cs
│   │   │   ├── WorkflowNode.cs
│   │   │   ├── WorkflowEdge.cs
│   │   │   ├── WorkflowExecution.cs
│   │   │   ├── ExecutionLog.cs
│   │   │   └── User.cs
│   │   ├── Enums/
│   │   │   ├── NodeType.cs
│   │   │   ├── ExecutionStatus.cs
│   │   │   └── UserRole.cs
│   │   ├── Interfaces/
│   │   │   ├── IWorkflowExecutor.cs
│   │   │   ├── INodeExecutor.cs
│   │   │   └── IRepository.cs
│   │   └── ValueObjects/
│   │       └── NodeConfiguration.cs
│   │
│   ├── WorkflowAutomation.Application/         # Use cases & orchestration
│   │   ├── Common/
│   │   │   ├── Interfaces/
│   │   │   │   ├── IApplicationDbContext.cs
│   │   │   │   └── IDateTimeProvider.cs
│   │   │   ├── Behaviors/
│   │   │   │   ├── ValidationBehavior.cs
│   │   │   │   └── LoggingBehavior.cs
│   │   │   └── Exceptions/
│   │   │       ├── NotFoundException.cs
│   │   │       └── ValidationException.cs
│   │   ├── Workflows/
│   │   │   ├── Commands/
│   │   │   │   ├── CreateWorkflow/
│   │   │   │   │   ├── CreateWorkflowCommand.cs
│   │   │   │   │   ├── CreateWorkflowCommandHandler.cs
│   │   │   │   │   └── CreateWorkflowValidator.cs
│   │   │   │   ├── UpdateWorkflow/
│   │   │   │   ├── DeleteWorkflow/
│   │   │   │   └── ExecuteWorkflow/
│   │   │   │       ├── ExecuteWorkflowCommand.cs
│   │   │   │       └── ExecuteWorkflowCommandHandler.cs
│   │   │   └── Queries/
│   │   │       ├── GetWorkflows/
│   │   │       │   ├── GetWorkflowsQuery.cs
│   │   │       │   └── GetWorkflowsQueryHandler.cs
│   │   │       ├── GetWorkflowById/
│   │   │       └── GetWorkflowExecutions/
│   │   ├── Authentication/
│   │   │   ├── Commands/
│   │   │   │   ├── Login/
│   │   │   │   ├── Register/
│   │   │   │   └── RefreshToken/
│   │   │   └── Services/
│   │   │       └── ITokenService.cs
│   │   └── DependencyInjection.cs
│   │
│   ├── WorkflowAutomation.Infrastructure/      # External concerns
│   │   ├── Persistence/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Configurations/
│   │   │   │   ├── WorkflowConfiguration.cs
│   │   │   │   └── UserConfiguration.cs
│   │   │   ├── Repositories/
│   │   │   │   ├── WorkflowRepository.cs
│   │   │   │   └── ExecutionRepository.cs
│   │   │   └── Migrations/
│   │   ├── Services/
│   │   │   ├── DateTimeProvider.cs
│   │   │   └── TokenService.cs
│   │   ├── BackgroundJobs/
│   │   │   ├── WorkflowExecutionJob.cs
│   │   │   └── HangfireConfiguration.cs
│   │   ├── Execution/
│   │   │   ├── WorkflowExecutor.cs
│   │   │   └── NodeExecutors/
│   │   │       ├── HttpRequestNodeExecutor.cs
│   │   │       ├── DelayNodeExecutor.cs
│   │   │       ├── ConditionNodeExecutor.cs
│   │   │       └── TransformNodeExecutor.cs
│   │   └── DependencyInjection.cs
│   │
│   └── WorkflowAutomation.API/                 # Entry point
│       ├── Controllers/
│       │   ├── WorkflowsController.cs
│       │   ├── ExecutionsController.cs
│       │   ├── AuthController.cs
│       │   └── UsersController.cs
│       ├── Middleware/
│       │   ├── ExceptionHandlingMiddleware.cs
│       │   └── RateLimitingMiddleware.cs
│       ├── Filters/
│       │   └── AuthorizeAttribute.cs
│       ├── Program.cs
│       └── appsettings.json
│
└── tests/
    ├── WorkflowAutomation.Domain.Tests/
    ├── WorkflowAutomation.Application.Tests/
    └── WorkflowAutomation.Integration.Tests/
```

## Frontend Structure

```
workflow-automation-ui/
├── src/
│   ├── app/                              # App entry point
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── router.tsx                    # React Router setup
│   ├── features/                         # Feature-based modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── api/
│   │   │   │   └── authApi.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   ├── workflows/
│   │   │   ├── components/
│   │   │   │   ├── WorkflowDesigner/
│   │   │   │   │   ├── WorkflowCanvas.tsx
│   │   │   │   │   ├── CustomNodes/
│   │   │   │   │   │   ├── HttpNode.tsx
│   │   │   │   │   │   ├── DelayNode.tsx
│   │   │   │   │   │   └── ConditionNode.tsx
│   │   │   │   │   ├── NodeInspector.tsx
│   │   │   │   │   └── Toolbar.tsx
│   │   │   │   ├── WorkflowList.tsx
│   │   │   │   └── WorkflowCard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useWorkflows.ts
│   │   │   │   ├── useWorkflowDesigner.ts
│   │   │   │   └── useExecuteWorkflow.ts
│   │   │   ├── api/
│   │   │   │   └── workflowApi.ts
│   │   │   ├── store/
│   │   │   │   └── workflowStore.ts        # Zustand store
│   │   │   └── types/
│   │   │       └── workflow.types.ts
│   │   ├── executions/
│   │   │   ├── components/
│   │   │   │   ├── ExecutionHistory.tsx
│   │   │   │   └── ExecutionDetails.tsx
│   │   │   └── api/
│   │   │       └── executionApi.ts
│   │   ├── dashboard/
│   │   │   └── components/
│   │   │       ├── DashboardStats.tsx
│   │   │       └── RecentExecutions.tsx
│   │   └── admin/
│   │       └── components/
│   │           └── UserManagement.tsx
│   ├── shared/                           # Shared utilities
│   │   ├── components/
│   │   │   ├── ui/                       # shadcn components
│   │   │   ├── Layout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── hooks/
│   │   │   └── useToast.ts
│   │   ├── lib/
│   │   │   ├── api-client.ts             # Axios instance
│   │   │   └── utils.ts
│   │   └── types/
│   │       └── common.types.ts
│   └── styles/
│       └── globals.css
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'User',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Workflows
```sql
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflows_user_id ON workflows(user_id);
```

#### Workflow Nodes
```sql
CREATE TABLE workflow_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    node_type VARCHAR(50) NOT NULL, -- 'http', 'delay', 'condition', 'transform'
    node_id VARCHAR(100) NOT NULL,  -- React Flow node ID
    position_x FLOAT,
    position_y FLOAT,
    configuration JSONB NOT NULL,   -- Node-specific config
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);
```

#### Workflow Edges
```sql
CREATE TABLE workflow_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    edge_id VARCHAR(100) NOT NULL,
    source_node_id VARCHAR(100) NOT NULL,
    target_node_id VARCHAR(100) NOT NULL,
    source_handle VARCHAR(100),
    target_handle VARCHAR(100),
    edge_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_edges_workflow_id ON workflow_edges(workflow_id);
```

#### Workflow Executions
```sql
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL, -- 'pending', 'running', 'completed', 'failed'
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    execution_context JSONB,     -- Initial input data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_executions_user_id ON workflow_executions(user_id);
CREATE INDEX idx_executions_status ON workflow_executions(status);
```

#### Execution Logs
```sql
CREATE TABLE execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,
    node_id VARCHAR(100) NOT NULL,
    node_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_execution_id ON execution_logs(execution_id);
```

#### Scheduled Workflows (Optional)
```sql
CREATE TABLE scheduled_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    cron_expression VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scheduled_next_run ON scheduled_workflows(next_run_at) WHERE is_active = true;
```

## API Endpoints Design

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login (returns access + refresh token)
POST   /api/auth/refresh           - Refresh access token
POST   /api/auth/logout            - Invalidate refresh token
GET    /api/auth/me                - Get current user profile
```

### Workflows
```
GET    /api/workflows              - List all workflows (paginated, filtered)
GET    /api/workflows/:id          - Get workflow by ID (includes nodes/edges)
POST   /api/workflows              - Create new workflow
PUT    /api/workflows/:id          - Update workflow
DELETE /api/workflows/:id          - Delete workflow
POST   /api/workflows/:id/execute  - Execute workflow immediately
POST   /api/workflows/:id/schedule - Schedule workflow (cron)
```

### Executions
```
GET    /api/executions             - List executions (filtered by workflow, status)
GET    /api/executions/:id         - Get execution details + logs
DELETE /api/executions/:id         - Cancel running execution
GET    /api/executions/:id/logs    - Get detailed execution logs
```

### Admin (Role: Admin only)
```
GET    /api/admin/users            - List all users
PUT    /api/admin/users/:id/role   - Update user role
DELETE /api/admin/users/:id        - Delete user
GET    /api/admin/stats            - System statistics
```

### Dashboard
```
GET    /api/dashboard/stats        - User's workflow statistics
GET    /api/dashboard/recent       - Recent executions
```

## Key Design Patterns

### 1. CQRS (Command Query Responsibility Segregation)
- **Commands**: Modify state (Create, Update, Delete workflows)
- **Queries**: Read state (Get workflows, executions)
- Implemented using MediatR library

### 2. Strategy Pattern (Node Executors)
```csharp
public interface INodeExecutor
{
    NodeType Type { get; }
    Task<ExecutionResult> ExecuteAsync(NodeConfiguration config, ExecutionContext context);
}

public class HttpRequestNodeExecutor : INodeExecutor
{
    public NodeType Type => NodeType.HttpRequest;
    // Implementation...
}
```

### 3. Repository Pattern
```csharp
public interface IWorkflowRepository
{
    Task<Workflow> GetByIdAsync(Guid id);
    Task<List<Workflow>> GetAllAsync(WorkflowFilter filter);
    Task<Workflow> CreateAsync(Workflow workflow);
    Task UpdateAsync(Workflow workflow);
    Task DeleteAsync(Guid id);
}
```

### 4. Chain of Responsibility (Workflow Execution)
```csharp
public class WorkflowExecutor
{
    public async Task<ExecutionResult> ExecuteAsync(Workflow workflow)
    {
        var context = new ExecutionContext();
        var sortedNodes = TopologicalSort(workflow.Nodes, workflow.Edges);

        foreach (var node in sortedNodes)
        {
            var executor = _nodeExecutorFactory.Create(node.Type);
            var result = await executor.ExecuteAsync(node.Configuration, context);

            if (!result.Success)
                return result; // Stop on failure

            context.SetOutput(node.Id, result.Data);
        }

        return ExecutionResult.Success();
    }
}
```

## Technology Stack

### Backend
- **Framework**: .NET 8 (LTS)
- **ORM**: Entity Framework Core 8
- **Database**: PostgreSQL 15
- **Background Jobs**: Hangfire (for scheduling)
- **Validation**: FluentValidation
- **Mapping**: AutoMapper
- **Authentication**: JWT (ASP.NET Core Identity)
- **API Documentation**: Swagger/OpenAPI
- **Testing**: xUnit, FluentAssertions, Moq

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Flow Editor**: React Flow
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Backend Hosting**: Render / Railway
- **Frontend Hosting**: Vercel
- **Database Hosting**: Railway / Supabase

## Node Types Implementation

### 1. HTTP Request Node
```json
{
  "type": "http",
  "configuration": {
    "method": "GET|POST|PUT|DELETE",
    "url": "https://api.example.com/endpoint",
    "headers": {
      "Authorization": "Bearer {{token}}"
    },
    "body": {},
    "timeout": 30000,
    "retries": 3
  }
}
```

### 2. Delay Node
```json
{
  "type": "delay",
  "configuration": {
    "duration": 5000,
    "unit": "milliseconds"
  }
}
```

### 3. Condition Node
```json
{
  "type": "condition",
  "configuration": {
    "expression": "{{response.status}} === 200",
    "trueTarget": "node-id-1",
    "falseTarget": "node-id-2"
  }
}
```

### 4. Transform Node
```json
{
  "type": "transform",
  "configuration": {
    "script": "return { name: input.firstName + ' ' + input.lastName };"
  }
}
```

## Security Considerations

1. **Authentication**: JWT access tokens (15min) + refresh tokens (7 days)
2. **Authorization**: Role-based (User, Admin)
3. **Rate Limiting**: 100 requests/minute per user
4. **Input Validation**: All inputs validated server-side
5. **SQL Injection**: Parameterized queries via EF Core
6. **XSS Protection**: React auto-escapes, CSP headers
7. **CORS**: Configured for frontend domain only
8. **Secrets**: Environment variables, never committed
9. **HTTPS Only**: Enforced in production
10. **Password Hashing**: BCrypt with salt

## Performance Optimizations

1. **Database Indexes**: On foreign keys and query columns
2. **Caching**: Redis for frequently accessed workflows
3. **Pagination**: All list endpoints support pagination
4. **Lazy Loading**: React code splitting by route
5. **Query Optimization**: EF Core includes/projections
6. **Background Processing**: Long-running workflows in background jobs
7. **Connection Pooling**: Configured in EF Core

## Monitoring & Observability

1. **Structured Logging**: Serilog with JSON output
2. **Metrics**: Execution counts, durations, success rates
3. **Health Checks**: `/health` endpoint for monitoring
4. **Error Tracking**: Centralized exception handling
5. **Audit Logging**: Track all workflow changes

## Next Steps

1. **Setup Phase**: Initialize repos, databases, Docker
2. **Core Backend**: Implement Clean Architecture layers
3. **Core Frontend**: Setup React, routing, auth flow
4. **Workflow Engine**: Build execution engine + node executors
5. **Designer UI**: Implement React Flow canvas
6. **Testing**: Unit + integration tests
7. **DevOps**: CI/CD pipeline + deployment

---

This architecture balances simplicity with demonstrating senior-level skills. It's scalable, maintainable, and follows industry best practices while remaining achievable in your timeline.
