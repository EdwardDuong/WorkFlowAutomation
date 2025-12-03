using WorkflowAutomation.Domain.Entities;

namespace WorkflowAutomation.Application.Authentication.Services;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    Task<RefreshToken> SaveRefreshTokenAsync(Guid userId, string token, CancellationToken cancellationToken = default);
    Task<User?> ValidateRefreshTokenAsync(string token, CancellationToken cancellationToken = default);
    Task RevokeRefreshTokenAsync(string token, CancellationToken cancellationToken = default);
}
