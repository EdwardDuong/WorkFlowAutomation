using WorkflowAutomation.Domain.Common;

namespace WorkflowAutomation.Domain.Entities;

public class WorkflowEdge : BaseEntity
{
    public Guid WorkflowId { get; set; }
    public string EdgeId { get; set; } = string.Empty; // React Flow edge ID
    public string SourceNodeId { get; set; } = string.Empty;
    public string TargetNodeId { get; set; } = string.Empty;
    public string? SourceHandle { get; set; }
    public string? TargetHandle { get; set; }
    public string? EdgeType { get; set; }

    // Navigation properties
    public virtual Workflow Workflow { get; set; } = null!;

    public WorkflowEdge() : base() { }

    public WorkflowEdge(Guid workflowId, string edgeId, string sourceNodeId, string targetNodeId)
    {
        WorkflowId = workflowId;
        EdgeId = edgeId;
        SourceNodeId = sourceNodeId;
        TargetNodeId = targetNodeId;
    }
}
