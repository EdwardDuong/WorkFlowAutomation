# User Guide - Workflow Automation Platform

Complete guide to using the Workflow Automation Platform for creating, managing, and executing automated workflows.

## Table of Contents

- [Getting Started](#getting-started)
- [Creating Your First Workflow](#creating-your-first-workflow)
- [Node Types](#node-types)
- [Executing Workflows](#executing-workflows)
- [Scheduling Workflows](#scheduling-workflows)
- [Monitoring Executions](#monitoring-executions)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Creating an Account

1. Navigate to http://localhost:3000 (or your deployment URL)
2. Click **"Sign up"** on the login page
3. Fill in:
   - **Email:** Your email address
   - **Password:** Secure password (minimum 6 characters)
   - **Full Name:** Your display name
4. Click **"Create Account"**
5. You'll be automatically logged in

### Logging In

1. Enter your email and password
2. Click **"Sign in"**
3. You'll be redirected to the Dashboard

### Dashboard Overview

The dashboard shows:
- **Total Workflows:** Number of workflows you've created
- **Active Workflows:** Workflows currently enabled
- **Total Executions:** All workflow runs
- **Success Rate:** Percentage of successful executions
- **Recent Executions:** Latest workflow runs with status

---

## Creating Your First Workflow

### Step 1: Navigate to Workflows

- Click **"Workflows"** in the sidebar (or press **W**)
- Click **"New Workflow"** button (or press **N**)

### Step 2: Name Your Workflow

1. Enter a **Name** (e.g., "Daily Report Generator")
2. Add a **Description** (optional but recommended)
3. Click **"Create"**

### Step 3: Design Your Workflow

The workflow designer opens with a canvas where you can:
- **Add Nodes:** Click node types from the left sidebar
- **Connect Nodes:** Drag from one node's handle to another
- **Configure Nodes:** Click a node to edit its settings
- **Move Nodes:** Drag nodes to organize your workflow

### Step 4: Add Your First Nodes

**Every workflow needs:**
1. **One Start Node** - Entry point
2. **One or more Action Nodes** - Do the work
3. **One End Node** - Exit point

**Example Simple Workflow:**

```
[Start] → [HTTP Request] → [Email] → [End]
```

1. The **Start** node is added automatically
2. Click **"HTTP Request"** from the sidebar
3. Click **"Email"** from the sidebar
4. Click **"End"** from the sidebar
5. Connect them by dragging from Start → HTTP Request → Email → End

### Step 5: Configure Nodes

Click each node to configure:

**HTTP Request Node:**
- **Label:** "Fetch Weather Data"
- **Method:** GET
- **URL:** `https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY`

**Email Node:**
- **Label:** "Send Weather Report"
- **To:** your-email@example.com
- **Subject:** "Daily Weather Report"
- **Body:** "The weather today is: {{httpRequest.data.weather[0].description}}"
- **SMTP Settings:** Configure your email server

### Step 6: Save and Test

1. Click **"Save Workflow"**
2. Click **"Execute Now"** to test
3. Check execution results in the **Executions** page

---

## Node Types

### Start Node

**Purpose:** Entry point for every workflow

**Configuration:** None required

**Usage:** Every workflow must start with exactly one Start node

---

### HTTP Request Node

**Purpose:** Make API calls to external services

**Configuration:**
- **Method:** GET, POST, PUT, DELETE
- **URL:** The API endpoint
- **Headers:** HTTP headers (optional)
  ```json
  {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
  }
  ```
- **Body:** Request payload for POST/PUT (JSON)

**Output:**
```json
{
  "statusCode": 200,
  "data": { ... },
  "headers": { ... }
}
```

**Use Cases:**
- Fetch data from APIs
- Send data to external services
- Trigger webhooks

**Example - Fetch GitHub User:**
```
Method: GET
URL: https://api.github.com/users/octocat
Headers: {
  "Accept": "application/vnd.github.v3+json"
}
```

---

### Delay Node

**Purpose:** Wait for a specified duration

**Configuration:**
- **Duration:** Time in milliseconds

**Examples:**
- `1000` = 1 second
- `60000` = 1 minute
- `3600000` = 1 hour

**Use Cases:**
- Rate limiting between API calls
- Waiting for external processes
- Scheduling delays

---

### Condition Node

**Purpose:** Branch workflow based on conditions

**Configuration:**
- **Condition Type:** equals, contains, greaterThan, lessThan
- **Left Operand:** Value or variable to check
- **Right Operand:** Value to compare against

**Outputs:**
- **True Handle:** Connect to next node if condition is true
- **False Handle:** Connect to next node if condition is false

**Variable Syntax:**
- Use `{{nodeName.output.field}}` to reference previous node outputs
- Example: `{{httpRequest.statusCode}}`

**Example - Check HTTP Status:**
```
Condition Type: equals
Left Operand: {{httpRequest.statusCode}}
Right Operand: 200
```

If true → Send success email
If false → Send error alert

---

### Transform Node

**Purpose:** Transform data using C# scripts

**Configuration:**
- **Script:** C# code to transform data

**Available Variables:**
- `context` - Execution context with all previous node outputs
- Access outputs: `context["nodeName"]`

**Example - Combine Data:**
```csharp
var user = context["httpRequest"];
return new {
    fullName = user.firstName + " " + user.lastName,
    email = user.email.ToLower(),
    createdAt = DateTime.UtcNow
};
```

**Return Value:** Your script must return an object

---

### Email Node

**Purpose:** Send emails via SMTP

**Configuration:**
- **To:** Recipient email address
- **Subject:** Email subject line
- **Body:** Email content (supports variables)
- **SMTP Host:** Mail server (e.g., smtp.gmail.com)
- **SMTP Port:** Usually 587 or 465
- **Username:** SMTP username
- **Password:** SMTP password or app password

**Variable Syntax in Body:**
```
Hello {{userName}},

The status is: {{httpRequest.status}}

Data: {{transform.result}}
```

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use app password in configuration

---

### Script Node

**Purpose:** Execute custom C# code with full context access

**Configuration:**
- **Code:** Complete C# script

**Example - Complex Logic:**
```csharp
var data = context["httpRequest"];
var results = new List<object>();

foreach (var item in data.items) {
    if (item.price > 100) {
        results.Add(new {
            name = item.name,
            discount = item.price * 0.1
        });
    }
}

return new { discountedItems = results };
```

---

### Database Node

**Purpose:** Execute SQL queries

**Configuration:**
- **Connection String:** Database connection
- **Query:** SQL query (supports parameters)
- **Parameters:** Query parameters

**Example - Query Users:**
```sql
SELECT * FROM users
WHERE created_at > @startDate
AND status = @status
```

Parameters:
```json
{
  "startDate": "{{context.startDate}}",
  "status": "active"
}
```

**Supported Databases:**
- PostgreSQL
- SQL Server
- MySQL (with appropriate connection string)

---

### End Node

**Purpose:** Mark workflow completion

**Configuration:** None required

**Usage:** Every workflow must end with at least one End node

---

## Executing Workflows

### Manual Execution

1. Go to **Workflows** page
2. Find your workflow
3. Click **"Execute"** button
4. Optionally provide parameters
5. Click **"Start Execution"**
6. Execution starts immediately

### Execution with Parameters

Some workflows accept input parameters:

```json
{
  "userId": "12345",
  "reportDate": "2025-12-28"
}
```

Parameters are accessible in nodes via `{{parameters.userId}}`

### Viewing Execution Status

- Navigate to **Executions** page (press **E**)
- Statuses:
  - **Running:** Currently executing
  - **Completed:** Finished successfully
  - **Failed:** Error occurred
  - **Pending:** Queued for execution

---

## Scheduling Workflows

### Create a Schedule

1. Go to **Schedules** page (press **S**)
2. Click **"New Schedule"**
3. Select **Workflow** to schedule
4. Enter **Cron Expression**
5. Optionally add **Parameters**
6. Click **"Create Schedule"**

### Cron Expression Guide

Format: `minute hour day month dayOfWeek`

**Common Examples:**

| Expression | Description | Example Time |
|-----------|-------------|--------------|
| `0 9 * * *` | Every day at 9 AM | 09:00:00 |
| `0 */2 * * *` | Every 2 hours | 00:00, 02:00, 04:00... |
| `*/15 * * * *` | Every 15 minutes | :00, :15, :30, :45 |
| `0 0 * * 1` | Every Monday at midnight | Mon 00:00:00 |
| `0 9 * * 1-5` | Weekdays at 9 AM | Mon-Fri 09:00:00 |
| `0 0 1 * *` | First day of month | 1st, 00:00:00 |

**Cron Fields:**
1. **Minute:** 0-59
2. **Hour:** 0-23
3. **Day:** 1-31
4. **Month:** 1-12
5. **Day of Week:** 0-6 (0 = Sunday)

**Special Characters:**
- `*` - Any value
- `*/n` - Every n units
- `n-m` - Range
- `n,m` - Multiple values

### Managing Schedules

- **Pause:** Click toggle to disable schedule
- **Edit:** Update cron expression or parameters
- **Delete:** Remove schedule permanently
- **Next Run:** Shows when workflow will execute next

---

## Monitoring Executions

### Execution List

The **Executions** page shows all workflow runs:

**Filters:**
- By Workflow
- By Status (Running, Completed, Failed)
- By Date Range

**Information Displayed:**
- Workflow name
- Status with color indicator
- Start time
- Duration
- Error message (if failed)

### Execution Details

Click any execution to see:

1. **Overview:**
   - Workflow name
   - Status
   - Start/end time
   - Total duration

2. **Node Execution Logs:**
   - Each node's status
   - Start/end time per node
   - Input/output data
   - Error messages

3. **Actions:**
   - **Retry:** Re-run failed execution
   - **View Workflow:** Open workflow designer
   - **Export Logs:** Download execution details

### Understanding Execution Logs

**Log Entry Example:**
```
Node: Fetch User Data (HTTP Request)
Status: Completed
Duration: 342ms
Input: {}
Output: {
  "statusCode": 200,
  "data": {
    "id": 123,
    "name": "John Doe"
  }
}
```

**Status Colors:**
- 🟢 Green: Completed successfully
- 🔵 Blue: Running
- 🔴 Red: Failed
- ⚪ Gray: Pending

---

## Keyboard Shortcuts

Press **?** anywhere to see all shortcuts.

### Navigation
- **D** - Dashboard
- **W** - Workflows
- **E** - Executions
- **S** - Schedules

### Workflows Page
- **N** - New Workflow
- **/** - Search workflows

### Workflow Designer
- **Ctrl + S** - Save workflow
- **Delete** - Delete selected node/edge
- **Ctrl + Z** - Undo (coming soon)
- **Esc** - Close dialogs

### General
- **Esc** - Close any dialog/modal
- **?** - Show shortcuts help

---

## Best Practices

### Workflow Design

1. **Use Descriptive Names**
   - ✅ "Daily Sales Report Generator"
   - ❌ "Workflow 1"

2. **Label Your Nodes**
   - ✅ "Fetch Customer Data"
   - ❌ "HTTP Request"

3. **Handle Errors**
   - Add Condition nodes to check for errors
   - Use false branches for error handling
   - Send alerts when workflows fail

4. **Keep It Simple**
   - Break complex workflows into smaller ones
   - Maximum 10-15 nodes per workflow
   - Use Transform nodes to simplify logic

5. **Test Before Scheduling**
   - Execute manually first
   - Verify all nodes work correctly
   - Check execution logs

### Security

1. **Never Hardcode Secrets**
   - Don't put API keys directly in nodes
   - Use environment variables
   - Consider using a secrets manager

2. **Validate External Data**
   - Check API responses before using data
   - Use Condition nodes to validate

3. **Limit Permissions**
   - Only give workflows minimum required access
   - Use read-only database connections when possible

### Performance

1. **Use Delays Wisely**
   - Don't add unnecessary delays
   - Respect API rate limits

2. **Optimize Queries**
   - Database queries should be specific
   - Use indexed columns in WHERE clauses
   - Limit result sets

3. **Avoid Infinite Loops**
   - Don't create circular connections
   - Validation will prevent this

### Monitoring

1. **Check Execution Logs**
   - Review failed executions
   - Look for patterns in errors
   - Monitor execution duration

2. **Set Up Alerts**
   - Create workflows that monitor other workflows
   - Send email/Slack on failures
   - Track success rates

---

## Troubleshooting

### Workflow Won't Save

**Problem:** "Validation failed" error

**Solutions:**
1. Check you have exactly one Start node
2. Check you have at least one End node
3. Ensure all edges connect to valid nodes
4. Look for circular dependencies

### HTTP Request Fails

**Problem:** Request timeout or connection error

**Solutions:**
1. Verify URL is correct and accessible
2. Check authentication headers
3. Ensure API is available (test in browser/Postman)
4. Increase timeout if needed
5. Check firewall/network settings

### Email Not Sending

**Problem:** Email node fails

**Solutions:**
1. Verify SMTP settings:
   - Correct host and port
   - Valid username/password
   - Try app password for Gmail
2. Check recipient email is valid
3. Verify network allows SMTP connections
4. Test SMTP settings separately

### Condition Not Working

**Problem:** Wrong branch executed

**Solutions:**
1. Check variable syntax: `{{nodeName.field}}`
2. Verify node names match exactly
3. Use Script node to debug:
   ```csharp
   // Log the value
   var value = context["httpRequest"].statusCode;
   Console.WriteLine($"Status: {value}");
   return value;
   ```

### Scheduled Workflow Not Running

**Problem:** Schedule created but not executing

**Solutions:**
1. Check schedule is active (toggle on)
2. Verify cron expression is correct
3. Look at "Next Run" time
4. Check workflow is active
5. Review execution logs for errors

### Variables Not Resolving

**Problem:** `{{variable}}` appears in output as literal text

**Solutions:**
1. Ensure previous node completed successfully
2. Check node name is correct (case-sensitive)
3. Verify field path: `{{nodeName.output.field}}`
4. View execution logs to see actual output structure

### Database Connection Fails

**Problem:** Database node can't connect

**Solutions:**
1. Test connection string separately
2. Verify database is accessible from API
3. Check credentials are correct
4. Ensure database allows remote connections
5. Check firewall rules

---

## Templates

### Quick Start Templates

Use pre-built templates to get started:

1. **Daily Report Email**
   - Fetches data from API
   - Sends formatted email report
   - Scheduled daily at 9 AM

2. **Database Sync**
   - Queries database
   - Transforms data
   - Posts to external API

3. **Conditional Alert**
   - Checks API health
   - Sends alert if unhealthy
   - Runs every 5 minutes

4. **API Processing Pipeline**
   - Multi-step API calls
   - Data transformation
   - Error handling

5. **Database Report Generator**
   - Runs SQL query
   - Formats results
   - Emails report

**To Use a Template:**
1. Go to Workflows page
2. Click "New Workflow"
3. Select "Use Template"
4. Choose a template
5. Customize and save

---

## Advanced Features

### Using Context Variables

Access any previous node's output:

```
{{startNode.timestamp}}
{{httpRequest.statusCode}}
{{httpRequest.data.user.name}}
{{transform.result.items[0].price}}
{{database.rows[0].email}}
```

### Chaining Transformations

Transform node output can be used in subsequent nodes:

```
[HTTP] → [Transform 1] → [Transform 2] → [Email]

Transform 1: Extract relevant fields
Transform 2: Calculate derived values
Email: Use transformed data
```

### Error Recovery Workflows

Create workflows that monitor and retry failed executions:

```
[Start]
  ↓
[Get Failed Executions (Last Hour)]
  ↓
[Condition: Any failures?]
  ├─ True → [Retry Execution] → [Send Alert]
  └─ False → [End]
```

---

## Getting Help

### Resources
- **API Documentation:** [API_REFERENCE.md](./API_REFERENCE.md)
- **Architecture Guide:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Swagger UI:** http://localhost:5000/swagger

### Support
- Check execution logs for detailed error messages
- Review this guide's troubleshooting section
- Test nodes individually before combining
- Simplify workflow to isolate issues

---

## Next Steps

1. ✅ Create your first workflow
2. ✅ Test it manually
3. ✅ Schedule it to run automatically
4. ✅ Monitor executions
5. ✅ Create more complex workflows
6. ✅ Build workflows that work together
7. ✅ Set up monitoring and alerts

Happy Automating! 🚀
