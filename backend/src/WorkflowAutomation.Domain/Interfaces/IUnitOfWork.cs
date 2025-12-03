namespace WorkflowAutomation.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IWorkflowRepository Workflows { get; }
    IWorkflowExecutionRepository WorkflowExecutions { get; }
    IUserRepository Users { get; }
    IRepository<T> Repository<T>() where T : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
