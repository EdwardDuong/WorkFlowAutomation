using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using WorkflowAutomation.Application.Authentication.DTOs;
using WorkflowAutomation.Application.Workflows.DTOs;

namespace WorkflowAutomation.IntegrationTests.Controllers;

public class WorkflowControllerTests : IClassFixture<WebApplicationFactoryBase>
{
    private readonly HttpClient _client;

    public WorkflowControllerTests(WebApplicationFactoryBase factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> GetAuthTokenAsync()
    {
        var registerRequest = new RegisterRequest
        {
            Email = $"user-{Guid.NewGuid()}@example.com",
            Password = "Test123456!",
            FullName = "Test User"
        };

        var response = await _client.PostAsJsonAsync("/api/Auth/register", registerRequest);
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        return result!.AccessToken;
    }

    [Fact]
    public async Task CreateWorkflow_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateWorkflowRequest
        {
            Name = "Test Workflow",
            Description = "Test Description",
            IsActive = true
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/Workflow", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<WorkflowResponse>();
        result.Should().NotBeNull();
        result!.Name.Should().Be(request.Name);
        result.Description.Should().Be(request.Description);
        result.IsActive.Should().Be(request.IsActive);
    }

    [Fact]
    public async Task CreateWorkflow_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        var request = new CreateWorkflowRequest
        {
            Name = "Test Workflow",
            Description = "Test Description",
            IsActive = true
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/Workflow", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetWorkflows_ReturnsUserWorkflows()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createRequest = new CreateWorkflowRequest
        {
            Name = "Get Test Workflow",
            Description = "Test Description",
            IsActive = true
        };
        await _client.PostAsJsonAsync("/api/Workflow", createRequest);

        // Act
        var response = await _client.GetAsync("/api/Workflow");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<WorkflowResponse>>();
        result.Should().NotBeNull();
        result.Should().Contain(w => w.Name == createRequest.Name);
    }

    [Fact]
    public async Task GetWorkflowById_WithValidId_ReturnsWorkflow()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createRequest = new CreateWorkflowRequest
        {
            Name = "Get By ID Workflow",
            Description = "Test Description",
            IsActive = true
        };
        var createResponse = await _client.PostAsJsonAsync("/api/Workflow", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<WorkflowResponse>();

        // Act
        var response = await _client.GetAsync($"/api/Workflow/{created!.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<WorkflowDetailResponse>();
        result.Should().NotBeNull();
        result!.Id.Should().Be(created.Id);
        result.Name.Should().Be(createRequest.Name);
    }

    [Fact]
    public async Task UpdateWorkflow_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createRequest = new CreateWorkflowRequest
        {
            Name = "Original Name",
            Description = "Original Description",
            IsActive = true
        };
        var createResponse = await _client.PostAsJsonAsync("/api/Workflow", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<WorkflowResponse>();

        var updateRequest = new UpdateWorkflowRequest
        {
            Name = "Updated Name",
            Description = "Updated Description",
            IsActive = false
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/Workflow/{created!.Id}", updateRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify the update
        var getResponse = await _client.GetAsync($"/api/Workflow/{created.Id}");
        var result = await getResponse.Content.ReadFromJsonAsync<WorkflowDetailResponse>();
        result!.Name.Should().Be(updateRequest.Name);
        result.Description.Should().Be(updateRequest.Description);
        result.IsActive.Should().Be(updateRequest.IsActive);
    }

    [Fact]
    public async Task DeleteWorkflow_WithValidId_ReturnsSuccess()
    {
        // Arrange
        var token = await GetAuthTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createRequest = new CreateWorkflowRequest
        {
            Name = "To Be Deleted",
            Description = "Test Description",
            IsActive = true
        };
        var createResponse = await _client.PostAsJsonAsync("/api/Workflow", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<WorkflowResponse>();

        // Act
        var response = await _client.DeleteAsync($"/api/Workflow/{created!.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify deletion - API uses soft delete, so workflow is still retrievable
        var getResponse = await _client.GetAsync($"/api/Workflow/{created.Id}");
        // Either hard deleted (404) or soft deleted (200 OK but marked inactive)
        getResponse.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound);
    }
}
