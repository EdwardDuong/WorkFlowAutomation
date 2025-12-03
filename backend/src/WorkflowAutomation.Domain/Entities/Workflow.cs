using WorkflowAutomation.Domain.Common;

namespace WorkflowAutomation.Domain.Entities;

public class Workflow : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid UserId { get; set; }
    public bool IsActive { get; set; } = true;
    public int Version { get; set; } = 1;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<WorkflowNode> Nodes { get; set; } = new List<WorkflowNode>();
    public virtual ICollection<WorkflowEdge> Edges { get; set; } = new List<WorkflowEdge>();
    public virtual ICollection<WorkflowExecution> Executions { get; set; } = new List<WorkflowExecution>();
    public virtual ICollection<ScheduledWorkflow> ScheduledWorkflows { get; set; } = new List<ScheduledWorkflow>();

    public Workflow() : base() { }

    public Workflow(string name, string? description, Guid userId)
    {
        Name = name;
        Description = description;
        UserId = userId;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void IncrementVersion()
    {
        Version++;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool HasNodes() => Nodes != null && Nodes.Any();
    public bool HasEdges() => Edges != null && Edges.Any();
}
