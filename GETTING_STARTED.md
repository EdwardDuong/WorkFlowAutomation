# Getting Started - Step by Step Guide

This guide will help you set up the Workflow Automation App from scratch, following Clean Architecture principles.

## Phase 1: Initial Setup (4-6 hours)

### Step 1: Create Backend Solution Structure

Open terminal in the project root and run:

```bash
# Create solution and directory structure
mkdir backend
cd backend

# Create solution
dotnet new sln -n WorkflowAutomation

# Create projects
dotnet new classlib -n WorkflowAutomation.Domain -o src/WorkflowAutomation.Domain
dotnet new classlib -n WorkflowAutomation.Application -o src/WorkflowAutomation.Application
dotnet new classlib -n WorkflowAutomation.Infrastructure -o src/WorkflowAutomation.Infrastructure
dotnet new webapi -n WorkflowAutomation.API -o src/WorkflowAutomation.API

# Create test projects
dotnet new xunit -n WorkflowAutomation.Domain.Tests -o tests/WorkflowAutomation.Domain.Tests
dotnet new xunit -n WorkflowAutomation.Application.Tests -o tests/WorkflowAutomation.Application.Tests
dotnet new xunit -n WorkflowAutomation.Integration.Tests -o tests/WorkflowAutomation.Integration.Tests

# Add projects to solution
dotnet sln add src/WorkflowAutomation.Domain/WorkflowAutomation.Domain.csproj
dotnet sln add src/WorkflowAutomation.Application/WorkflowAutomation.Application.csproj
dotnet sln add src/WorkflowAutomation.Infrastructure/WorkflowAutomation.Infrastructure.csproj
dotnet sln add src/WorkflowAutomation.API/WorkflowAutomation.API.csproj
dotnet sln add tests/WorkflowAutomation.Domain.Tests/WorkflowAutomation.Domain.Tests.csproj
dotnet sln add tests/WorkflowAutomation.Application.Tests/WorkflowAutomation.Application.Tests.csproj
dotnet sln add tests/WorkflowAutomation.Integration.Tests/WorkflowAutomation.Integration.Tests.csproj

# Set up project references
cd src/WorkflowAutomation.Application
dotnet add reference ../WorkflowAutomation.Domain/WorkflowAutomation.Domain.csproj

cd ../WorkflowAutomation.Infrastructure
dotnet add reference ../WorkflowAutomation.Domain/WorkflowAutomation.Domain.csproj
dotnet add reference ../WorkflowAutomation.Application/WorkflowAutomation.Application.csproj

cd ../WorkflowAutomation.API
dotnet add reference ../WorkflowAutomation.Application/WorkflowAutomation.Application.csproj
dotnet add reference ../WorkflowAutomation.Infrastructure/WorkflowAutomation.Infrastructure.csproj
```

### Step 2: Install NuGet Packages

```bash
# Domain layer (minimal dependencies)
cd src/WorkflowAutomation.Domain
# Domain should have NO external dependencies (pure C#)

# Application layer
cd ../WorkflowAutomation.Application
dotnet add package MediatR
dotnet add package FluentValidation
dotnet add package FluentValidation.DependencyInjectionExtensions
dotnet add package AutoMapper
dotnet add package Microsoft.Extensions.DependencyInjection.Abstractions

# Infrastructure layer
cd ../WorkflowAutomation.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Hangfire.Core
dotnet add package Hangfire.PostgreSql
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt

# API layer
cd ../WorkflowAutomation.API
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Swashbuckle.AspNetCore
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.File

# Test projects
cd ../../tests/WorkflowAutomation.Application.Tests
dotnet add package FluentAssertions
dotnet add package Moq
dotnet add package Microsoft.EntityFrameworkCore.InMemory
```

### Step 3: Setup Database with Docker

```bash
# Navigate back to project root
cd ../../../

# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Verify services are running
docker ps
```

### Step 4: Create Frontend Project

```bash
# From project root
mkdir frontend
cd frontend

# Create Vite + React + TypeScript project
npm create vite@latest workflow-automation-ui -- --template react-ts

cd workflow-automation-ui

# Install dependencies
npm install

# Install additional packages
npm install react-router-dom
npm install @tanstack/react-query
npm install axios
npm install zustand
npm install reactflow
npm install react-hook-form
npm install zod @hookform/resolvers
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node

# Initialize Tailwind CSS
npx tailwindcss init -p

# Install shadcn/ui
npx shadcn-ui@latest init
```

## Phase 2: Domain Layer Implementation (3-4 hours)

### Create Domain Entities

Create these files in `src/WorkflowAutomation.Domain/Entities/`:

1. **User.cs**
```csharp
namespace WorkflowAutomation.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Workflow> Workflows { get; set; } = new List<Workflow>();
}
```

2. **Workflow.cs**
```csharp
namespace WorkflowAutomation.Domain.Entities;

public class Workflow
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid UserId { get; set; }
    public bool IsActive { get; set; }
    public int Version { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
    public ICollection<WorkflowNode> Nodes { get; set; } = new List<WorkflowNode>();
    public ICollection<WorkflowEdge> Edges { get; set; } = new List<WorkflowEdge>();
    public ICollection<WorkflowExecution> Executions { get; set; } = new List<WorkflowExecution>();
}
```

3. **WorkflowNode.cs**, **WorkflowEdge.cs**, **WorkflowExecution.cs**, **ExecutionLog.cs**

### Create Enums

Create `src/WorkflowAutomation.Domain/Enums/`:

```csharp
public enum UserRole { User, Admin }
public enum NodeType { HttpRequest, Delay, Condition, Transform }
public enum ExecutionStatus { Pending, Running, Completed, Failed, Cancelled }
```

## Phase 3: Application Layer (4-6 hours)

### Setup MediatR with CQRS

Create `src/WorkflowAutomation.Application/DependencyInjection.cs`:

```csharp
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        return services;
    }
}
```

### Create Commands and Queries

Example: `src/WorkflowAutomation.Application/Workflows/Commands/CreateWorkflow/`

```csharp
public record CreateWorkflowCommand(string Name, string? Description) : IRequest<Guid>;

public class CreateWorkflowCommandHandler : IRequestHandler<CreateWorkflowCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public async Task<Guid> Handle(CreateWorkflowCommand request, CancellationToken cancellationToken)
    {
        var workflow = new Workflow
        {
            Name = request.Name,
            Description = request.Description,
            // ... set other properties
        };

        _context.Workflows.Add(workflow);
        await _context.SaveChangesAsync(cancellationToken);

        return workflow.Id;
    }
}
```

## Phase 4: Infrastructure Layer (6-8 hours)

### Setup EF Core DbContext

Create `src/WorkflowAutomation.Infrastructure/Persistence/ApplicationDbContext.cs`:

```csharp
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Workflow> Workflows => Set<Workflow>();
    public DbSet<WorkflowNode> WorkflowNodes => Set<WorkflowNode>();
    // ... other DbSets

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
```

### Create Entity Configurations

Example: `src/WorkflowAutomation.Infrastructure/Persistence/Configurations/WorkflowConfiguration.cs`

### Setup Migrations

```bash
cd src/WorkflowAutomation.API
dotnet ef migrations add InitialCreate --project ../WorkflowAutomation.Infrastructure
dotnet ef database update
```

## Phase 5: API Layer (4-6 hours)

### Configure Services in Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* ... */ });

var app = builder.Build();

// Configure middleware
app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### Create Controllers

Example: `src/WorkflowAutomation.API/Controllers/WorkflowsController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
public class WorkflowsController : ControllerBase
{
    private readonly IMediator _mediator;

    [HttpGet]
    public async Task<ActionResult<List<WorkflowDto>>> GetWorkflows()
    {
        var result = await _mediator.Send(new GetWorkflowsQuery());
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> CreateWorkflow(CreateWorkflowCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetWorkflow), new { id }, id);
    }
}
```

## Phase 6: Frontend Setup (4-6 hours)

### Configure Tailwind and Routing

Update `tailwind.config.js`, setup React Router in `src/app/router.tsx`

### Create API Client

`src/shared/lib/api-client.ts`:

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Create Feature Modules

Start with authentication, then workflows, then dashboard.

## Testing Your Setup

### Backend
```bash
cd backend/src/WorkflowAutomation.API
dotnet run
# Visit https://localhost:7001/swagger
```

### Frontend
```bash
cd frontend/workflow-automation-ui
npm run dev
# Visit http://localhost:5173
```

## Next Steps

1. Implement authentication (JWT tokens)
2. Build workflow CRUD operations
3. Create workflow designer UI with React Flow
4. Implement workflow execution engine
5. Add background job processing
6. Build dashboard and analytics
7. Write tests
8. Deploy to production

## Tips for Learning Senior Development

1. **Follow SOLID Principles** - Single Responsibility, Open/Closed, etc.
2. **Write Tests First** - TDD helps you think about design
3. **Code Reviews** - Review your own code after a day
4. **Documentation** - Comment complex logic, write good commit messages
5. **Performance** - Profile before optimizing, use proper indexing
6. **Security** - Never trust user input, use parameterized queries
7. **Error Handling** - Graceful degradation, meaningful error messages
8. **Logging** - Structured logging with context
9. **Refactoring** - Keep improving code structure
10. **Design Patterns** - Use when they solve real problems

## Resources

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [React Flow Documentation](https://reactflow.dev/)
- [.NET Architecture Guides](https://dotnet.microsoft.com/learn/dotnet/architecture-guides)
