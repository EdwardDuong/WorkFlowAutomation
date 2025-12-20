namespace WorkflowAutomation.Application.Workflows.DTOs;

public class CreateWorkflowRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}
