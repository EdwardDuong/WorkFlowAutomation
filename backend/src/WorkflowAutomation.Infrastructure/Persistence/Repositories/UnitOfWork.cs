using WorkflowAutomation.Domain.Interfaces;

namespace WorkflowAutomation.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IUserRepository? _userRepository;
    private IWorkflowRepository? _workflowRepository;
    private IWorkflowExecutionRepository? _workflowExecutionRepository;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUserRepository Users => _userRepository ??= new UserRepository(_context);

    public IWorkflowRepository Workflows => _workflowRepository ??= new WorkflowRepository(_context);

    public IWorkflowExecutionRepository WorkflowExecutions => _workflowExecutionRepository ??= new WorkflowExecutionRepository(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
