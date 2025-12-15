using WorkflowAutomation.Domain.Common;
using WorkflowAutomation.Domain.Enums;

namespace WorkflowAutomation.Domain.Entities;

public class ExecutionLog : BaseEntity
{
    public Guid ExecutionId { get; set; }
    public string NodeId { get; set; } = string.Empty;
    public NodeType NodeType { get; set; }
    public ExecutionStatus Status { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? InputDataJson { get; set; } // JSON string
    public string? OutputDataJson { get; set; } // JSON string
    public string? ErrorMessage { get; set; }

    // Navigation properties
    public virtual WorkflowExecution Execution { get; set; } = null!;

    public ExecutionLog() : base() { }

    public ExecutionLog(Guid executionId, string nodeId, NodeType nodeType)
    {
        ExecutionId = executionId;
        NodeId = nodeId;
        NodeType = nodeType;
        Status = ExecutionStatus.Pending;
    }

    public void Start(string? inputData = null)
    {
        Status = ExecutionStatus.Running;
        StartedAt = DateTime.UtcNow;
        InputDataJson = inputData;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete(string? outputData = null)
    {
        Status = ExecutionStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        OutputDataJson = outputData;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Fail(string errorMessage)
    {
        Status = ExecutionStatus.Failed;
        ErrorMessage = errorMessage;
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
}
