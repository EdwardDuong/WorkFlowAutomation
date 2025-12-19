using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkflowAutomation.Domain.Entities;

namespace WorkflowAutomation.Infrastructure.Persistence.Configurations;

public class WorkflowNodeConfiguration : IEntityTypeConfiguration<WorkflowNode>
{
    public void Configure(EntityTypeBuilder<WorkflowNode> builder)
    {
        builder.ToTable("workflow_nodes");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(n => n.WorkflowId)
            .HasColumnName("workflow_id")
            .IsRequired();

        builder.Property(n => n.NodeType)
            .HasColumnName("node_type")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(n => n.NodeId)
            .HasColumnName("node_id")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(n => n.PositionX)
            .HasColumnName("position_x");

        builder.Property(n => n.PositionY)
            .HasColumnName("position_y");

        builder.Property(n => n.ConfigurationJson)
            .HasColumnName("configuration")
            .HasColumnType("jsonb")
            .IsRequired();

        builder.Property(n => n.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(n => n.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Indexes
        builder.HasIndex(n => n.WorkflowId)
            .HasDatabaseName("idx_workflow_nodes_workflow_id");

        builder.HasIndex(n => new { n.WorkflowId, n.NodeId })
            .HasDatabaseName("idx_workflow_nodes_workflow_node_id");

        // Relationships
        builder.HasOne(n => n.Workflow)
            .WithMany(w => w.Nodes)
            .HasForeignKey(n => n.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
