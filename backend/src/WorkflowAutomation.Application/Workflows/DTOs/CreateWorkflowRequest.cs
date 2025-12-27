namespace WorkflowAutomation.Application.Workflows.DTOs;

public class CreateWorkflowRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public List<WorkflowNodeRequest> Nodes { get; set; } = new();
    public List<WorkflowEdgeRequest> Edges { get; set; } = new();
}
