using WorkflowAutomation.Domain.Common;
using WorkflowAutomation.Domain.Enums;
using System.Text.Json;

namespace WorkflowAutomation.Domain.Entities;

public class WorkflowNode : BaseEntity
{
    public Guid WorkflowId { get; set; }
    public NodeType NodeType { get; set; }
    public string NodeId { get; set; } = string.Empty; // React Flow node ID
    public float? PositionX { get; set; }
    public float? PositionY { get; set; }
    public string Configuration { get; set; } = "{}"; // JSON string

    // Navigation properties
    public virtual Workflow Workflow { get; set; } = null!;

    public WorkflowNode() : base() { }

    public WorkflowNode(Guid workflowId, NodeType nodeType, string nodeId, float? positionX, float? positionY, string configuration)
    {
        WorkflowId = workflowId;
        NodeType = nodeType;
        NodeId = nodeId;
        PositionX = positionX;
        PositionY = positionY;
        Configuration = configuration;
    }

    public T? GetConfiguration<T>() where T : class
    {
        try
        {
            return JsonSerializer.Deserialize<T>(Configuration);
        }
        catch
        {
            return null;
        }
    }

    public void SetConfiguration<T>(T config) where T : class
    {
        Configuration = JsonSerializer.Serialize(config);
        UpdatedAt = DateTime.UtcNow;
    }
}
