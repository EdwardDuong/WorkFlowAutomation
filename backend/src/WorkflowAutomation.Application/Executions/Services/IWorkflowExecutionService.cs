namespace WorkflowAutomation.Application.Executions.Services;

public interface IWorkflowExecutionService
{
    Task<Guid> StartExecutionAsync(Guid workflowId, string? inputData, CancellationToken cancellationToken = default);
    Task ExecuteWorkflowAsync(Guid executionId, CancellationToken cancellationToken = default);
}
