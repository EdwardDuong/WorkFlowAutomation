using WorkflowAutomation.Domain.Common;

namespace WorkflowAutomation.Domain.Entities;

public class ScheduledWorkflow : BaseEntity
{
    public Guid WorkflowId { get; set; }
    public string CronExpression { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string? Parameters { get; set; }
    public DateTime? LastRunAt { get; set; }
    public DateTime? NextRunAt { get; set; }

    // Navigation properties
    public virtual Workflow Workflow { get; set; } = null!;

    public ScheduledWorkflow() : base() { }

    public ScheduledWorkflow(Guid workflowId, string cronExpression, DateTime? nextRunAt = null)
    {
        WorkflowId = workflowId;
        CronExpression = cronExpression;
        NextRunAt = nextRunAt;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void UpdateLastRun(DateTime lastRun)
    {
        LastRunAt = lastRun;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateNextRun(DateTime nextRun)
    {
        NextRunAt = nextRun;
        UpdatedAt = DateTime.UtcNow;
    }
}
