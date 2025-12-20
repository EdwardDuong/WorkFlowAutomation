namespace WorkflowAutomation.Application.Workflows.DTOs;

public class WorkflowEdgeResponse
{
    public Guid Id { get; set; }
    public string EdgeId { get; set; } = string.Empty;
    public string SourceNodeId { get; set; } = string.Empty;
    public string TargetNodeId { get; set; } = string.Empty;
    public string? SourceHandle { get; set; }
    public string? TargetHandle { get; set; }
    public string? EdgeType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
