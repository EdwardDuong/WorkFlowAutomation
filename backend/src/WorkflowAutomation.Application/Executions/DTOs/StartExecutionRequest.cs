namespace WorkflowAutomation.Application.Executions.DTOs;

public class StartExecutionRequest
{
    public Guid WorkflowId { get; set; }
    public string? InputData { get; set; }
}
