using Microsoft.EntityFrameworkCore;
using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Interfaces;

namespace WorkflowAutomation.Infrastructure.Persistence.Repositories;

public class WorkflowRepository : GenericRepository<Workflow>, IWorkflowRepository
{
    public WorkflowRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Workflow?> GetByIdWithNodesAndEdgesAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(w => w.Nodes)
            .Include(w => w.Edges)
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Workflow>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.UpdatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Workflow>> GetActiveWorkflowsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(w => w.IsActive)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> IsWorkflowOwnedByUserAsync(Guid workflowId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AnyAsync(w => w.Id == workflowId && w.UserId == userId, cancellationToken);
    }
}
