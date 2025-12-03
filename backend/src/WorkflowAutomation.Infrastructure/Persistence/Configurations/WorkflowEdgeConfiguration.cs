using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkflowAutomation.Domain.Entities;

namespace WorkflowAutomation.Infrastructure.Persistence.Configurations;

public class WorkflowEdgeConfiguration : IEntityTypeConfiguration<WorkflowEdge>
{
    public void Configure(EntityTypeBuilder<WorkflowEdge> builder)
    {
        builder.ToTable("workflow_edges");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(e => e.WorkflowId)
            .HasColumnName("workflow_id")
            .IsRequired();

        builder.Property(e => e.EdgeId)
            .HasColumnName("edge_id")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.SourceNodeId)
            .HasColumnName("source_node_id")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.TargetNodeId)
            .HasColumnName("target_node_id")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.SourceHandle)
            .HasColumnName("source_handle")
            .HasMaxLength(100);

        builder.Property(e => e.TargetHandle)
            .HasColumnName("target_handle")
            .HasMaxLength(100);

        builder.Property(e => e.EdgeType)
            .HasColumnName("edge_type")
            .HasMaxLength(50);

        builder.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        // Indexes
        builder.HasIndex(e => e.WorkflowId)
            .HasDatabaseName("idx_workflow_edges_workflow_id");

        builder.HasIndex(e => new { e.WorkflowId, e.EdgeId })
            .HasDatabaseName("idx_workflow_edges_workflow_edge_id");

        // Relationships
        builder.HasOne(e => e.Workflow)
            .WithMany(w => w.Edges)
            .HasForeignKey(e => e.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
