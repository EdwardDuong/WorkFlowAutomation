using Microsoft.EntityFrameworkCore;
using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Enums;
using WorkflowAutomation.Domain.Interfaces;

namespace WorkflowAutomation.Infrastructure.Persistence.Repositories;

public class WorkflowExecutionRepository : GenericRepository<WorkflowExecution>, IWorkflowExecutionRepository
{
    public WorkflowExecutionRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<WorkflowExecution?> GetByIdWithLogsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(e => e.ExecutionLogs.OrderBy(l => l.CreatedAt))
            .Include(e => e.Workflow)
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<WorkflowExecution>> GetByWorkflowIdAsync(Guid workflowId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.WorkflowId == workflowId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<WorkflowExecution>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.UserId == userId)
            .Include(e => e.Workflow)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<WorkflowExecution>> GetByStatusAsync(ExecutionStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.Status == status)
            .Include(e => e.Workflow)
            .OrderBy(e => e.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<WorkflowExecution>> GetRecentExecutionsAsync(int count, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(e => e.Workflow)
            .OrderByDescending(e => e.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }
}
