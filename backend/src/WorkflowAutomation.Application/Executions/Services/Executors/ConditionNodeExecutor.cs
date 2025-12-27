using Jint;
using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Enums;

namespace WorkflowAutomation.Application.Executions.Services.Executors;

public class ConditionNodeExecutor : INodeExecutor
{
    public Task<object?> ExecuteAsync(WorkflowNode node, Dictionary<string, object?> context, CancellationToken cancellationToken = default)
    {
        if (node.NodeType != NodeType.Condition)
        {
            throw new InvalidOperationException($"Invalid node type. Expected Condition, got {node.NodeType}");
        }

        var config = node.GetConfiguration<ConditionConfig>();
        if (config == null || string.IsNullOrWhiteSpace(config.Condition))
        {
            throw new InvalidOperationException("Condition node requires a condition expression");
        }

        var engine = new Engine();

        // Set context variables
        engine.SetValue("context", context);
        engine.SetValue("previousOutput", context.GetValueOrDefault("previousOutput"));

        // Evaluate condition
        var result = engine.Evaluate(config.Condition);
        var boolResult = result.AsBoolean();

        var output = new { Result = boolResult };
        context["previousOutput"] = output;
        context["conditionResult"] = boolResult;

        return Task.FromResult<object?>(output);
    }

    private class ConditionConfig
    {
        public string? Condition { get; set; }
    }
}
