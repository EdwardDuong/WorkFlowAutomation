using WorkflowAutomation.Domain.Enums;

namespace WorkflowAutomation.Application.Executions.DTOs;

public class ExecutionLogResponse
{
    public Guid Id { get; set; }
    public string NodeId { get; set; } = string.Empty;
    public NodeType NodeType { get; set; }
    public ExecutionStatus Status { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? InputDataJson { get; set; }
    public string? OutputDataJson { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public TimeSpan? Duration { get; set; }
}
