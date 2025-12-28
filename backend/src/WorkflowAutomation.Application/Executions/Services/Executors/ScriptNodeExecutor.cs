using System.Text.Json;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;
using Microsoft.Extensions.Logging;
using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Enums;

namespace WorkflowAutomation.Application.Executions.Services.Executors;

public class ScriptNodeExecutor : INodeExecutor
{
    private readonly ILogger<ScriptNodeExecutor> _logger;

    public ScriptNodeExecutor(ILogger<ScriptNodeExecutor> logger)
    {
        _logger = logger;
    }

    public async Task<object?> ExecuteAsync(WorkflowNode node, Dictionary<string, object?> context, CancellationToken cancellationToken = default)
    {
        if (node.NodeType != NodeType.Script)
        {
            throw new InvalidOperationException($"Invalid node type. Expected Script, got {node.NodeType}");
        }

        var config = node.GetConfiguration<ScriptConfig>();
        if (config == null || string.IsNullOrWhiteSpace(config.Code))
        {
            throw new InvalidOperationException("Script node requires code configuration");
        }

        try
        {
            var globals = new ScriptGlobals
            {
                context = context,
                previousOutput = context.ContainsKey("previousOutput") ? context["previousOutput"] : null,
                inputData = context.ContainsKey("inputData") ? context["inputData"] : null
            };

            var options = ScriptOptions.Default
                .AddReferences(typeof(Console).Assembly, typeof(JsonSerializer).Assembly)
                .AddImports("System", "System.Linq", "System.Collections.Generic", "System.Text.Json");

            var result = await CSharpScript.EvaluateAsync(config.Code, options, globals, cancellationToken: cancellationToken);

            context["previousOutput"] = result;
            _logger.LogInformation("Script executed successfully");
            return result;
        }
        catch (CompilationErrorException ex)
        {
            _logger.LogError(ex, "Script compilation failed");
            throw new InvalidOperationException($"Script compilation failed: {string.Join(", ", ex.Diagnostics)}", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Script execution failed");
            throw new InvalidOperationException($"Script execution failed: {ex.Message}", ex);
        }
    }

    public class ScriptGlobals
    {
        public Dictionary<string, object?>? context { get; set; }
        public object? previousOutput { get; set; }
        public object? inputData { get; set; }
    }

    private class ScriptConfig
    {
        public string? Code { get; set; }
    }
}
