using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using WorkflowAutomation.Domain.Interfaces;

namespace WorkflowAutomation.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IUserRepository? _userRepository;
    private IWorkflowRepository? _workflowRepository;
    private IWorkflowExecutionRepository? _workflowExecutionRepository;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUserRepository Users => _userRepository ??= new UserRepository(_context);

    public IWorkflowRepository Workflows => _workflowRepository ??= new WorkflowRepository(_context);

    public IWorkflowExecutionRepository WorkflowExecutions => _workflowExecutionRepository ??= new WorkflowExecutionRepository(_context);

    public IRepository<T> Repository<T>() where T : class
    {
        return new GenericRepository<T>(_context) as IRepository<T>
            ?? throw new InvalidOperationException($"Repository for type {typeof(T)} could not be created");
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
