using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Enums;

namespace WorkflowAutomation.Domain.Interfaces;

public interface IWorkflowExecutionRepository : IRepository<WorkflowExecution>
{
    Task<WorkflowExecution?> GetByIdWithLogsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<WorkflowExecution>> GetByWorkflowIdAsync(Guid workflowId, CancellationToken cancellationToken = default);
    Task<IEnumerable<WorkflowExecution>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<WorkflowExecution>> GetByStatusAsync(ExecutionStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<WorkflowExecution>> GetRecentExecutionsAsync(int count, CancellationToken cancellationToken = default);
}
