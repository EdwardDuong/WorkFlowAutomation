using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.ValueObjects;

namespace WorkflowAutomation.Domain.Interfaces;

public interface IWorkflowExecutor
{
    Task<ExecutionResult> ExecuteAsync(Workflow workflow, ValueObjects.ExecutionContext context, CancellationToken cancellationToken = default);
    Task<ExecutionResult> ExecuteAsync(Guid workflowId, ValueObjects.ExecutionContext context, CancellationToken cancellationToken = default);
}
