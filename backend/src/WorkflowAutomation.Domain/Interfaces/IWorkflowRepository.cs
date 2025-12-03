using WorkflowAutomation.Domain.Entities;

namespace WorkflowAutomation.Domain.Interfaces;

public interface IWorkflowRepository : IRepository<Workflow>
{
    Task<Workflow?> GetByIdWithNodesAndEdgesAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Workflow>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Workflow>> GetActiveWorkflowsAsync(CancellationToken cancellationToken = default);
    Task<bool> IsWorkflowOwnedByUserAsync(Guid workflowId, Guid userId, CancellationToken cancellationToken = default);
}
