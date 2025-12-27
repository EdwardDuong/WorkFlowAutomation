using Jint;
using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Enums;

namespace WorkflowAutomation.Application.Executions.Services.Executors;

public class TransformNodeExecutor : INodeExecutor
{
    public Task<object?> ExecuteAsync(WorkflowNode node, Dictionary<string, object?> context, CancellationToken cancellationToken = default)
    {
        if (node.NodeType != NodeType.Transform)
        {
            throw new InvalidOperationException($"Invalid node type. Expected Transform, got {node.NodeType}");
        }

        var config = node.GetConfiguration<TransformConfig>();
        if (config == null || string.IsNullOrWhiteSpace(config.Script))
        {
            throw new InvalidOperationException("Transform node requires a script");
        }

        var engine = new Engine();

        // Set context variables
        engine.SetValue("context", context);
        engine.SetValue("previousOutput", context.GetValueOrDefault("previousOutput"));

        // Execute script
        var result = engine.Evaluate(config.Script);
        var output = result.ToObject();

        context["previousOutput"] = output;
        return Task.FromResult(output);
    }

    private class TransformConfig
    {
        public string? Script { get; set; }
    }
}
