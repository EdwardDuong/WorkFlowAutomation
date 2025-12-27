using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Enums;

namespace WorkflowAutomation.Application.Executions.Services.Executors;

public class DelayNodeExecutor : INodeExecutor
{
    public async Task<object?> ExecuteAsync(WorkflowNode node, Dictionary<string, object?> context, CancellationToken cancellationToken = default)
    {
        if (node.NodeType != NodeType.Delay)
        {
            throw new InvalidOperationException($"Invalid node type. Expected Delay, got {node.NodeType}");
        }

        var config = node.GetConfiguration<DelayConfig>();
        var duration = config?.Duration ?? 1000;

        await Task.Delay(duration, cancellationToken);

        var result = new { DelayedFor = duration };
        context["previousOutput"] = result;
        return result;
    }

    private class DelayConfig
    {
        public int Duration { get; set; }
    }
}
