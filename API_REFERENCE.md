# API Reference

Complete API documentation for the Workflow Automation Platform.

**Base URL:** `http://localhost:5000/api`

**Authentication:** Bearer token (JWT) in Authorization header

## Table of Contents

- [Authentication](#authentication)
- [Workflows](#workflows)
- [Executions](#executions)
- [Scheduled Workflows](#scheduled-workflows)
- [Health Checks](#health-checks)
- [Error Responses](#error-responses)

---

## Authentication

### Register

Create a new user account.

**Endpoint:** `POST /Auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "8Q5plmHIfcXoNr/cba3omU...",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "User",
  "expiresAt": "2025-12-29T14:00:00Z"
}
```

**Validation:**
- Email must be valid format
- Password minimum 6 characters
- Full name required

---

### Login

Authenticate existing user.

**Endpoint:** `POST /Auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "8Q5plmHIfcXoNr/cba3omU...",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "User",
  "expiresAt": "2025-12-29T14:00:00Z"
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "message": "Invalid email or password"
}
```

---

### Refresh Token

Get new access token using refresh token.

**Endpoint:** `POST /Auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "8Q5plmHIfcXoNr/cba3omU..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "newRefreshToken...",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "User",
  "expiresAt": "2025-12-29T14:00:00Z"
}
```

---

### Logout

Invalidate refresh token.

**Endpoint:** `POST /Auth/logout`

**Authorization:** Required (Bearer token)

**Request Body:**
```json
{
  "refreshToken": "8Q5plmHIfcXoNr/cba3omU..."
}
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## Workflows

### List Workflows

Get all workflows for authenticated user with pagination and filtering.

**Endpoint:** `GET /Workflows`

**Authorization:** Required

**Query Parameters:**
- `page` (optional): Page number, default 1
- `pageSize` (optional): Items per page, default 10
- `search` (optional): Search by name or description
- `isActive` (optional): Filter by active status

**Example Request:**
```
GET /Workflows?page=1&pageSize=10&search=report&isActive=true
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Daily Report Workflow",
      "description": "Sends daily report emails",
      "isActive": true,
      "createdAt": "2025-12-28T10:00:00Z",
      "updatedAt": "2025-12-28T10:00:00Z",
      "nodesCount": 5,
      "lastExecutionStatus": "Completed"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

---

### Get Workflow

Get workflow details including nodes and edges.

**Endpoint:** `GET /Workflows/{id}`

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Daily Report Workflow",
  "description": "Sends daily report emails",
  "isActive": true,
  "createdAt": "2025-12-28T10:00:00Z",
  "updatedAt": "2025-12-28T10:00:00Z",
  "nodes": [
    {
      "id": "node-1",
      "type": "Start",
      "positionX": 100,
      "positionY": 100,
      "label": "Start",
      "configuration": {}
    },
    {
      "id": "node-2",
      "type": "HttpRequest",
      "positionX": 300,
      "positionY": 100,
      "label": "Fetch Data",
      "configuration": {
        "method": "GET",
        "url": "https://api.example.com/data",
        "headers": {}
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "sourceHandle": null,
      "targetHandle": null
    }
  ]
}
```

**Error Response:** `404 Not Found`
```json
{
  "message": "Workflow not found"
}
```

---

### Create Workflow

Create a new workflow.

**Endpoint:** `POST /Workflows`

**Authorization:** Required

**Request Body:**
```json
{
  "name": "New Workflow",
  "description": "Description here",
  "nodes": [
    {
      "id": "node-1",
      "type": "Start",
      "positionX": 100,
      "positionY": 100,
      "label": "Start",
      "configuration": {}
    }
  ],
  "edges": []
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Workflow created successfully"
}
```

**Validation Rules:**
- Name required, max 255 characters
- Must have at least one Start node
- Must have at least one End node
- No circular dependencies
- All edges must reference valid nodes

---

### Update Workflow

Update existing workflow.

**Endpoint:** `PUT /Workflows/{id}`

**Authorization:** Required

**Request Body:**
```json
{
  "name": "Updated Workflow Name",
  "description": "Updated description",
  "nodes": [...],
  "edges": [...]
}
```

**Response:** `200 OK`
```json
{
  "message": "Workflow updated successfully"
}
```

---

### Delete Workflow

Delete a workflow.

**Endpoint:** `DELETE /Workflows/{id}`

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "message": "Workflow deleted successfully"
}
```

---

### Execute Workflow

Execute a workflow immediately.

**Endpoint:** `POST /Workflows/{id}/execute`

**Authorization:** Required

**Request Body (optional):**
```json
{
  "parameters": {
    "customParam": "value"
  }
}
```

**Response:** `200 OK`
```json
{
  "executionId": "660e8400-e29b-41d4-a716-446655440000",
  "status": "Running",
  "message": "Workflow execution started"
}
```

---

### Validate Workflow

Validate workflow before saving/executing.

**Endpoint:** `POST /Workflows/validate`

**Authorization:** Required

**Request Body:**
```json
{
  "nodes": [...],
  "edges": [...]
}
```

**Response:** `200 OK`
```json
{
  "isValid": true,
  "errors": [],
  "warnings": [
    "Node 'node-3' has no outgoing connections"
  ]
}
```

**Invalid Response:** `200 OK`
```json
{
  "isValid": false,
  "errors": [
    "Workflow must have exactly one Start node",
    "Circular dependency detected: node-2 -> node-3 -> node-2"
  ],
  "warnings": []
}
```

---

## Executions

### List Executions

Get workflow executions with filtering.

**Endpoint:** `GET /Executions`

**Authorization:** Required

**Query Parameters:**
- `workflowId` (optional): Filter by workflow
- `status` (optional): Filter by status (Pending, Running, Completed, Failed)
- `page` (optional): Page number
- `pageSize` (optional): Items per page

**Example:**
```
GET /Executions?workflowId=550e8400-e29b-41d4-a716-446655440000&status=Completed&page=1
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "workflowId": "550e8400-e29b-41d4-a716-446655440000",
      "workflowName": "Daily Report",
      "status": "Completed",
      "startedAt": "2025-12-28T10:00:00Z",
      "completedAt": "2025-12-28T10:05:00Z",
      "duration": "00:05:00",
      "errorMessage": null
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

---

### Get Execution Details

Get detailed execution information including logs.

**Endpoint:** `GET /Executions/{id}`

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "workflowId": "550e8400-e29b-41d4-a716-446655440000",
  "workflowName": "Daily Report",
  "status": "Completed",
  "startedAt": "2025-12-28T10:00:00Z",
  "completedAt": "2025-12-28T10:05:00Z",
  "duration": "00:05:00",
  "errorMessage": null,
  "logs": [
    {
      "nodeId": "node-1",
      "nodeLabel": "Start",
      "nodeType": "Start",
      "status": "Completed",
      "startedAt": "2025-12-28T10:00:00Z",
      "completedAt": "2025-12-28T10:00:01Z",
      "output": {},
      "errorMessage": null
    },
    {
      "nodeId": "node-2",
      "nodeLabel": "Fetch Data",
      "nodeType": "HttpRequest",
      "status": "Completed",
      "startedAt": "2025-12-28T10:00:01Z",
      "completedAt": "2025-12-28T10:00:03Z",
      "output": {
        "statusCode": 200,
        "data": {...}
      },
      "errorMessage": null
    }
  ]
}
```

---

### Retry Execution

Retry a failed execution.

**Endpoint:** `POST /Executions/{id}/retry`

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "executionId": "770e8400-e29b-41d4-a716-446655440000",
  "message": "Execution retry started"
}
```

---

## Scheduled Workflows

### List Scheduled Workflows

Get all scheduled workflows.

**Endpoint:** `GET /ScheduledWorkflows`

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "workflowId": "550e8400-e29b-41d4-a716-446655440000",
      "workflowName": "Daily Report",
      "cronExpression": "0 9 * * *",
      "description": "Every day at 9 AM",
      "isActive": true,
      "lastRunAt": "2025-12-28T09:00:00Z",
      "nextRunAt": "2025-12-29T09:00:00Z",
      "parameters": {}
    }
  ]
}
```

---

### Create Scheduled Workflow

Schedule a workflow to run automatically.

**Endpoint:** `POST /ScheduledWorkflows`

**Authorization:** Required

**Request Body:**
```json
{
  "workflowId": "550e8400-e29b-41d4-a716-446655440000",
  "cronExpression": "0 9 * * *",
  "parameters": {
    "customParam": "value"
  }
}
```

**Cron Expression Examples:**
- `0 9 * * *` - Every day at 9 AM
- `0 */2 * * *` - Every 2 hours
- `0 0 * * 1` - Every Monday at midnight
- `*/15 * * * *` - Every 15 minutes

**Response:** `201 Created`
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "message": "Workflow scheduled successfully",
  "nextRunAt": "2025-12-29T09:00:00Z"
}
```

---

### Update Scheduled Workflow

Update schedule settings.

**Endpoint:** `PUT /ScheduledWorkflows/{id}`

**Authorization:** Required

**Request Body:**
```json
{
  "cronExpression": "0 10 * * *",
  "isActive": true,
  "parameters": {}
}
```

**Response:** `200 OK`
```json
{
  "message": "Schedule updated successfully",
  "nextRunAt": "2025-12-29T10:00:00Z"
}
```

---

### Delete Scheduled Workflow

Remove a schedule.

**Endpoint:** `DELETE /ScheduledWorkflows/{id}`

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "message": "Schedule deleted successfully"
}
```

---

## Health Checks

### Overall Health

Check overall application health including database and Redis.

**Endpoint:** `GET /health`

**Authorization:** Not required

**Response:** `200 OK` (Healthy)
```json
{
  "status": "Healthy",
  "timestamp": "2025-12-28T10:00:00Z",
  "checks": {
    "database": {
      "status": "Healthy",
      "responseTime": "45ms"
    },
    "redis": {
      "status": "Healthy"
    }
  }
}
```

**Response:** `503 Service Unavailable` (Unhealthy)
```json
{
  "status": "Unhealthy",
  "timestamp": "2025-12-28T10:00:00Z",
  "checks": {
    "database": {
      "status": "Unhealthy",
      "error": "Connection timeout"
    }
  }
}
```

---

### Readiness Probe

Check if API is ready to accept requests.

**Endpoint:** `GET /health/ready`

**Authorization:** Not required

**Response:** `200 OK`
```json
{
  "status": "Ready",
  "timestamp": "2025-12-28T10:00:00Z"
}
```

---

### Liveness Probe

Check if API is alive (for Kubernetes).

**Endpoint:** `GET /health/live`

**Authorization:** Not required

**Response:** `200 OK`
```json
{
  "status": "Alive",
  "timestamp": "2025-12-28T10:00:00Z"
}
```

---

## Error Responses

All endpoints follow a consistent error response format.

### 400 Bad Request
Invalid request data or validation errors.

```json
{
  "message": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "email": ["Invalid email format"]
  }
}
```

### 401 Unauthorized
Missing or invalid authentication token.

```json
{
  "message": "Unauthorized access"
}
```

### 403 Forbidden
Authenticated but insufficient permissions.

```json
{
  "message": "Insufficient permissions to access this resource"
}
```

### 404 Not Found
Resource not found.

```json
{
  "message": "Workflow not found"
}
```

### 500 Internal Server Error
Unexpected server error.

```json
{
  "message": "An error occurred during workflow execution"
}
```

---

## Rate Limiting

API endpoints are rate limited:
- **Authenticated users:** 100 requests per minute
- **Unauthenticated:** 20 requests per minute

Rate limit headers included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1735471200
```

---

## Pagination

All list endpoints support pagination with consistent parameters:

**Request:**
```
GET /Workflows?page=2&pageSize=20
```

**Response Format:**
```json
{
  "data": [...],
  "page": 2,
  "pageSize": 20,
  "totalCount": 45,
  "totalPages": 3
}
```

---

## Node Types Configuration

### Start Node
```json
{
  "type": "Start",
  "configuration": {}
}
```

### HTTP Request Node
```json
{
  "type": "HttpRequest",
  "configuration": {
    "method": "GET|POST|PUT|DELETE",
    "url": "https://api.example.com/endpoint",
    "headers": {
      "Authorization": "Bearer token",
      "Content-Type": "application/json"
    },
    "body": {},
    "timeout": 30000
  }
}
```

### Delay Node
```json
{
  "type": "Delay",
  "configuration": {
    "duration": 5000
  }
}
```

### Condition Node
```json
{
  "type": "Condition",
  "configuration": {
    "conditionType": "equals|contains|greaterThan|lessThan",
    "leftOperand": "{{response.status}}",
    "rightOperand": "200"
  }
}
```

### Transform Node
```json
{
  "type": "Transform",
  "configuration": {
    "script": "return { fullName: context.firstName + ' ' + context.lastName };"
  }
}
```

### Email Node
```json
{
  "type": "Email",
  "configuration": {
    "to": "recipient@example.com",
    "subject": "Subject here",
    "body": "Email body with {{variables}}",
    "smtpHost": "smtp.gmail.com",
    "smtpPort": 587,
    "username": "sender@example.com",
    "password": "app-password"
  }
}
```

### Script Node
```json
{
  "type": "Script",
  "configuration": {
    "code": "// C# code here\nreturn new { result = 42 };"
  }
}
```

### Database Node
```json
{
  "type": "Database",
  "configuration": {
    "connectionString": "Host=localhost;Database=mydb;...",
    "query": "SELECT * FROM users WHERE id = @userId",
    "parameters": {
      "userId": "{{context.userId}}"
    }
  }
}
```

### End Node
```json
{
  "type": "End",
  "configuration": {}
}
```

---

## Swagger Documentation

Interactive API documentation available at:
- **Development:** http://localhost:5000/swagger
- **Production:** https://your-domain.com/swagger

Try out all endpoints directly from the Swagger UI.
