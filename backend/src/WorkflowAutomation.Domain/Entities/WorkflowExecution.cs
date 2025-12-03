using WorkflowAutomation.Domain.Common;
using WorkflowAutomation.Domain.Enums;

namespace WorkflowAutomation.Domain.Entities;

public class WorkflowExecution : BaseEntity
{
    public Guid WorkflowId { get; set; }
    public Guid? UserId { get; set; }
    public ExecutionStatus Status { get; set; } = ExecutionStatus.Pending;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public string ExecutionContext { get; set; } = "{}"; // JSON string for initial input data

    // Navigation properties
    public virtual Workflow Workflow { get; set; } = null!;
    public virtual User? User { get; set; }
    public virtual ICollection<ExecutionLog> ExecutionLogs { get; set; } = new List<ExecutionLog>();

    public WorkflowExecution() : base() { }

    public WorkflowExecution(Guid workflowId, Guid? userId, string executionContext = "{}")
    {
        WorkflowId = workflowId;
        UserId = userId;
        ExecutionContext = executionContext;
        Status = ExecutionStatus.Pending;
    }

    public void Start()
    {
        Status = ExecutionStatus.Running;
        StartedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        Status = ExecutionStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Fail(string errorMessage)
    {
        Status = ExecutionStatus.Failed;
        ErrorMessage = errorMessage;
        CompletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        Status = ExecutionStatus.Cancelled;
        CompletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public TimeSpan? GetDuration()
    {
        if (StartedAt.HasValue && CompletedAt.HasValue)
        {
            return CompletedAt.Value - StartedAt.Value;
        }
        return null;
    }

    public bool IsFinished() => Status == ExecutionStatus.Completed ||
                                Status == ExecutionStatus.Failed ||
                                Status == ExecutionStatus.Cancelled;

    public bool IsSuccessful() => Status == ExecutionStatus.Completed;
}
