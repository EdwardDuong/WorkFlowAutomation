using WorkflowAutomation.Domain.Enums;
using WorkflowAutomation.Domain.ValueObjects;

namespace WorkflowAutomation.Domain.Interfaces;

public interface INodeExecutor
{
    NodeType SupportedNodeType { get; }
    Task<ExecutionResult> ExecuteAsync(string configuration, ValueObjects.ExecutionContext context, CancellationToken cancellationToken = default);
}
