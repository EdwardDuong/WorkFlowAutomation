namespace WorkflowAutomation.Application.Workflows.DTOs;

public class WorkflowDetailResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<WorkflowNodeResponse> Nodes { get; set; } = new();
    public List<WorkflowEdgeResponse> Edges { get; set; } = new();
}
