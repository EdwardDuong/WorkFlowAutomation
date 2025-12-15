using WorkflowAutomation.Domain.Common;

namespace WorkflowAutomation.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public bool IsRevoked { get; set; } = false;

    // Navigation properties
    public virtual User User { get; set; } = null!;

    public RefreshToken() : base() { }

    public RefreshToken(Guid userId, string token, DateTime expiresAt)
    {
        UserId = userId;
        Token = token;
        ExpiresAt = expiresAt;
    }

    public bool IsExpired() => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive() => !IsExpired() && !IsRevoked;

    public void Revoke()
    {
        IsRevoked = true;
        RevokedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
