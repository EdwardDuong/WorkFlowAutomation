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
            .Include(e => e.Logs.OrderBy(l => l.CreatedAt))
            .Include(e => e.Workflow)
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<List<WorkflowExecution>> GetByWorkflowIdAsync(Guid workflowId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.WorkflowId == workflowId)
            .OrderByDescending(e => e.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<WorkflowExecution>> GetByUserIdAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.UserId == userId)
            .Include(e => e.Workflow)
            .OrderByDescending(e => e.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<WorkflowExecution>> GetByStatusAsync(ExecutionStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.Status == status)
            .Include(e => e.Workflow)
            .OrderBy(e => e.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountByWorkflowIdAsync(Guid workflowId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.WorkflowId == workflowId)
            .CountAsync(cancellationToken);
    }

    public async Task<int> CountByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.UserId == userId)
            .CountAsync(cancellationToken);
    }

    public async Task<Dictionary<ExecutionStatus, int>> GetStatusCountsByWorkflowIdAsync(Guid workflowId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => e.WorkflowId == workflowId)
            .GroupBy(e => e.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count, cancellationToken);
    }
}
