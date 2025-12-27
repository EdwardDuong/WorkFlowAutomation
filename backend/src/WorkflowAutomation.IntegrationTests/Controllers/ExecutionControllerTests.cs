using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using WorkflowAutomation.Application.Authentication.DTOs;
using WorkflowAutomation.Application.Executions.DTOs;
using WorkflowAutomation.Application.Workflows.DTOs;
using WorkflowAutomation.Domain.Enums;

namespace WorkflowAutomation.IntegrationTests.Controllers;

public class ExecutionControllerTests : IClassFixture<WebApplicationFactoryBase>
{
    private readonly HttpClient _client;

    public ExecutionControllerTests(WebApplicationFactoryBase factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<(string token, Guid workflowId)> SetupWorkflowAsync()
    {
        // Register and get token
        var registerRequest = new RegisterRequest
        {
            Email = $"user-{Guid.NewGuid()}@example.com",
            Password = "Test123456!",
            FullName = "Test User"
        };

        var authResponse = await _client.PostAsJsonAsync("/api/Auth/register", registerRequest);
        var authResult = await authResponse.Content.ReadFromJsonAsync<LoginResponse>();
        var token = authResult!.AccessToken;

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create a workflow
        var createWorkflowRequest = new CreateWorkflowRequest
        {
            Name = "Execution Test Workflow",
            Description = "Test Description",
            IsActive = true
        };

        var workflowResponse = await _client.PostAsJsonAsync("/api/Workflow", createWorkflowRequest);
        var workflow = await workflowResponse.Content.ReadFromJsonAsync<WorkflowResponse>();

        return (token, workflow!.Id);
    }

    [Fact]
    public async Task StartExecution_WithValidWorkflowId_ReturnsSuccess()
    {
        // Arrange
        var (token, workflowId) = await SetupWorkflowAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new StartExecutionRequest
        {
            WorkflowId = workflowId,
            InputData = "{\"testKey\":\"testValue\"}"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/Execution/start", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<ExecutionResponse>();
        result.Should().NotBeNull();
        result!.WorkflowId.Should().Be(workflowId);
        result.Status.Should().BeOneOf(ExecutionStatus.Pending, ExecutionStatus.Running);
    }

    [Fact]
    public async Task StartExecution_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        var request = new StartExecutionRequest
        {
            WorkflowId = Guid.NewGuid(),
            InputData = "{}"
        };

        // Clear authorization header
        _client.DefaultRequestHeaders.Authorization = null;

        // Act
        var response = await _client.PostAsJsonAsync("/api/Execution/start", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetExecutions_ReturnsUserExecutions()
    {
        // Arrange
        var (token, workflowId) = await SetupWorkflowAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var startRequest = new StartExecutionRequest
        {
            WorkflowId = workflowId,
            InputData = "{}"
        };
        await _client.PostAsJsonAsync("/api/Execution/start", startRequest);

        // Act
        var response = await _client.GetAsync("/api/Execution");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<ExecutionResponse>>();
        result.Should().NotBeNull();
        result.Should().HaveCountGreaterThanOrEqualTo(1);
        result.Should().Contain(e => e.WorkflowId == workflowId);
    }

    [Fact]
    public async Task GetExecutionById_WithValidId_ReturnsExecution()
    {
        // Arrange
        var (token, workflowId) = await SetupWorkflowAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var startRequest = new StartExecutionRequest
        {
            WorkflowId = workflowId,
            InputData = "{\"key\":\"value\"}"
        };
        var startResponse = await _client.PostAsJsonAsync("/api/Execution/start", startRequest);
        var execution = await startResponse.Content.ReadFromJsonAsync<ExecutionResponse>();

        // Act
        var response = await _client.GetAsync($"/api/Execution/{execution!.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ExecutionDetailResponse>();
        result.Should().NotBeNull();
        result!.Id.Should().Be(execution.Id);
        result.WorkflowId.Should().Be(workflowId);
    }

    [Fact]
    public async Task GetExecutionsByWorkflowId_ReturnsWorkflowExecutions()
    {
        // Arrange
        var (token, workflowId) = await SetupWorkflowAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Create multiple executions
        var startRequest = new StartExecutionRequest
        {
            WorkflowId = workflowId,
            InputData = "{}"
        };
        await _client.PostAsJsonAsync("/api/Execution/start", startRequest);
        await _client.PostAsJsonAsync("/api/Execution/start", startRequest);

        // Act
        var response = await _client.GetAsync($"/api/Execution/workflow/{workflowId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<ExecutionResponse>>();
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().OnlyContain(e => e.WorkflowId == workflowId);
    }
}
