using WorkflowAutomation.Domain.Entities;

namespace WorkflowAutomation.Application.Executions.Services;

public interface INodeExecutor
{
    Task<object?> ExecuteAsync(WorkflowNode node, Dictionary<string, object?> context, CancellationToken cancellationToken = default);
}
