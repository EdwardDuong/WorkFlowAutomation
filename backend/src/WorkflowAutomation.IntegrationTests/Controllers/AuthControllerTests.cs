using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using WorkflowAutomation.Application.Authentication.DTOs;

namespace WorkflowAutomation.IntegrationTests.Controllers;

public class AuthControllerTests : IClassFixture<WebApplicationFactoryBase>
{
    private readonly HttpClient _client;

    public AuthControllerTests(WebApplicationFactoryBase factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsSuccessAndToken()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = "Test123456!",
            FullName = "Test User"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/Auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        result.Should().NotBeNull();
        result!.AccessToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
        result.Email.Should().Be(request.Email);
        result.FullName.Should().Be(request.FullName);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "duplicate@example.com",
            Password = "Test123456!",
            FullName = "Test User"
        };

        // Register first user
        await _client.PostAsJsonAsync("/api/Auth/register", request);

        // Act - Try to register again with same email
        var response = await _client.PostAsJsonAsync("/api/Auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsSuccessAndToken()
    {
        // Arrange
        var registerRequest = new RegisterRequest
        {
            Email = "login@example.com",
            Password = "Test123456!",
            FullName = "Login User"
        };
        await _client.PostAsJsonAsync("/api/Auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "login@example.com",
            Password = "Test123456!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/Auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        result.Should().NotBeNull();
        result!.AccessToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        // Arrange
        var registerRequest = new RegisterRequest
        {
            Email = "wrongpass@example.com",
            Password = "Test123456!",
            FullName = "Wrong Pass User"
        };
        await _client.PostAsJsonAsync("/api/Auth/register", registerRequest);

        var loginRequest = new LoginRequest
        {
            Email = "wrongpass@example.com",
            Password = "WrongPassword!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/Auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Refresh_WithValidRefreshToken_ReturnsNewTokens()
    {
        // Arrange
        var registerRequest = new RegisterRequest
        {
            Email = "refresh@example.com",
            Password = "Test123456!",
            FullName = "Refresh User"
        };
        var registerResponse = await _client.PostAsJsonAsync("/api/Auth/register", registerRequest);
        var registerResult = await registerResponse.Content.ReadFromJsonAsync<LoginResponse>();

        var refreshRequest = new RefreshTokenRequest
        {
            RefreshToken = registerResult!.RefreshToken
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/Auth/refresh", refreshRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        result.Should().NotBeNull();
        result!.AccessToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
    }
}
