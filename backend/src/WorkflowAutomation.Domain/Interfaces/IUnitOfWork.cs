using WorkflowAutomation.Domain.Common;

namespace WorkflowAutomation.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IWorkflowRepository Workflows { get; }
    IWorkflowExecutionRepository WorkflowExecutions { get; }
    IUserRepository Users { get; }
    IRefreshTokenRepository RefreshTokens { get; }
    IRepository<T> Repository<T>() where T : BaseEntity;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
