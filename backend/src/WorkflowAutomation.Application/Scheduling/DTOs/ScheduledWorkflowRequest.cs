namespace WorkflowAutomation.Application.Scheduling.DTOs;

public class ScheduledWorkflowRequest
{
    public Guid WorkflowId { get; set; }
    public string CronExpression { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string? Parameters { get; set; }
}
