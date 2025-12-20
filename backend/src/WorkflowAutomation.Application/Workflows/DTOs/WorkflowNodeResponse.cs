using WorkflowAutomation.Domain.Enums;

namespace WorkflowAutomation.Application.Workflows.DTOs;

public class WorkflowNodeResponse
{
    public Guid Id { get; set; }
    public string NodeId { get; set; } = string.Empty;
    public NodeType NodeType { get; set; }
    public string? Label { get; set; }
    public float? PositionX { get; set; }
    public float? PositionY { get; set; }
    public string ConfigurationJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
