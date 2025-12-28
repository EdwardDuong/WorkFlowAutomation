using System.Net.Http;
using Microsoft.Extensions.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using WorkflowAutomation.Application.Executions.Services.Executors;
using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Enums;
using WorkflowAutomation.Domain.Interfaces;

namespace WorkflowAutomation.Application.Executions.Services;

public class WorkflowExecutionService : IWorkflowExecutionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<WorkflowExecutionService> _logger;
    private readonly Dictionary<NodeType, INodeExecutor> _executors;

    public WorkflowExecutionService(
        IUnitOfWork unitOfWork,
        ILogger<WorkflowExecutionService> logger,
        IHttpClientFactory httpClientFactory,
        ILogger<EmailNodeExecutor> emailLogger,
        ILogger<ScriptNodeExecutor> scriptLogger,
        ILogger<DatabaseNodeExecutor> databaseLogger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _executors = new Dictionary<NodeType, INodeExecutor>
        {
            { NodeType.HttpRequest, new HttpRequestNodeExecutor(httpClientFactory) },
            { NodeType.Condition, new ConditionNodeExecutor() },
            { NodeType.Transform, new TransformNodeExecutor() },
            { NodeType.Delay, new DelayNodeExecutor() },
            { NodeType.Email, new EmailNodeExecutor(emailLogger) },
            { NodeType.Script, new ScriptNodeExecutor(scriptLogger) },
            { NodeType.Database, new DatabaseNodeExecutor(databaseLogger) }
        };
    }

    public async Task<Guid> StartExecutionAsync(Guid workflowId, string? inputData, CancellationToken cancellationToken = default)
    {
        var workflow = await _unitOfWork.Workflows.GetByIdWithNodesAndEdgesAsync(workflowId, cancellationToken);
        if (workflow == null)
        {
            throw new InvalidOperationException($"Workflow {workflowId} not found");
        }

        if (!workflow.IsActive)
        {
            throw new InvalidOperationException($"Workflow {workflowId} is not active");
        }

        var execution = new WorkflowExecution(workflowId, Guid.Empty) // UserId will be set by controller
        {
            Status = ExecutionStatus.Pending,
            ExecutionContextJson = inputData ?? "{}"
        };

        await _unitOfWork.Repository<WorkflowExecution>().AddAsync(execution, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created execution {ExecutionId} for workflow {WorkflowId}", execution.Id, workflowId);

        // Execute asynchronously
        _ = Task.Run(async () => await ExecuteWorkflowAsync(execution.Id, CancellationToken.None), CancellationToken.None);

        return execution.Id;
    }

    public async Task ExecuteWorkflowAsync(Guid executionId, CancellationToken cancellationToken = default)
    {
        try
        {
            var execution = await _unitOfWork.Repository<WorkflowExecution>()
                .GetByIdAsync(executionId, cancellationToken);

            if (execution == null)
            {
                _logger.LogError("Execution {ExecutionId} not found", executionId);
                return;
            }

            execution.Status = ExecutionStatus.Running;
            execution.StartedAt = DateTime.UtcNow;
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Starting execution {ExecutionId}", executionId);

            var workflow = await _unitOfWork.Workflows.GetByIdWithNodesAndEdgesAsync(execution.WorkflowId, cancellationToken);
            if (workflow == null)
            {
                throw new InvalidOperationException($"Workflow {execution.WorkflowId} not found");
            }

            // Initialize context
            var context = new Dictionary<string, object?>
            {
                ["executionId"] = executionId,
                ["workflowId"] = workflow.Id,
                ["inputData"] = JsonSerializer.Deserialize<object>(execution.ExecutionContextJson)
            };

            // Find start node
            var startNode = workflow.Nodes.FirstOrDefault(n => n.NodeType == NodeType.Start);
            if (startNode == null)
            {
                throw new InvalidOperationException("Workflow has no start node");
            }

            // Execute workflow
            await ExecuteNodeAsync(startNode, workflow, context, executionId, cancellationToken);

            // Update execution status
            execution.Status = ExecutionStatus.Completed;
            execution.CompletedAt = DateTime.UtcNow;
            execution.ExecutionContextJson = JsonSerializer.Serialize(context);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Completed execution {ExecutionId}", executionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing workflow {ExecutionId}", executionId);

            var execution = await _unitOfWork.Repository<WorkflowExecution>()
                .GetByIdAsync(executionId, cancellationToken);

            if (execution != null)
            {
                execution.Status = ExecutionStatus.Failed;
                execution.CompletedAt = DateTime.UtcNow;
                execution.ErrorMessage = ex.Message;
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }
    }

    private async Task ExecuteNodeAsync(
        WorkflowNode node,
        Workflow workflow,
        Dictionary<string, object?> context,
        Guid executionId,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Executing node {NodeId} of type {NodeType}", node.NodeId, node.NodeType);

        // Log execution
        var log = new ExecutionLog(executionId, node.NodeId, node.NodeType);
        log.Start();
        await _unitOfWork.Repository<ExecutionLog>().AddAsync(log, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        try
        {
            object? result = null;

            // Execute node based on type
            if (node.NodeType != NodeType.Start && node.NodeType != NodeType.End)
            {
                if (_executors.TryGetValue(node.NodeType, out var executor))
                {
                    result = await executor.ExecuteAsync(node, context, cancellationToken);
                }
            }

            // Update log
            log.Complete(result != null ? JsonSerializer.Serialize(result) : null);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Find next node(s)
            if (node.NodeType == NodeType.End)
            {
                _logger.LogInformation("Reached end node, execution complete");
                return;
            }

            var outgoingEdges = workflow.Edges.Where(e => e.SourceNodeId == node.NodeId).ToList();

            if (node.NodeType == NodeType.Condition)
            {
                // Branch based on condition result
                var conditionResult = context.GetValueOrDefault("conditionResult") as bool? ?? false;
                var targetEdge = outgoingEdges.FirstOrDefault(e =>
                    (conditionResult && e.SourceHandle == "true") ||
                    (!conditionResult && e.SourceHandle == "false"));

                if (targetEdge != null)
                {
                    var nextNode = workflow.Nodes.FirstOrDefault(n => n.NodeId == targetEdge.TargetNodeId);
                    if (nextNode != null)
                    {
                        await ExecuteNodeAsync(nextNode, workflow, context, executionId, cancellationToken);
                    }
                }
            }
            else
            {
                // Execute next node in sequence
                foreach (var edge in outgoingEdges)
                {
                    var nextNode = workflow.Nodes.FirstOrDefault(n => n.NodeId == edge.TargetNodeId);
                    if (nextNode != null)
                    {
                        await ExecuteNodeAsync(nextNode, workflow, context, executionId, cancellationToken);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing node {NodeId}", node.NodeId);
            log.Fail(ex.Message);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            throw;
        }
    }
}
