using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkflowAutomation.Domain.Entities;

namespace WorkflowAutomation.Infrastructure.Persistence.Configurations;

public class ExecutionLogConfiguration : IEntityTypeConfiguration<ExecutionLog>
{
    public void Configure(EntityTypeBuilder<ExecutionLog> builder)
    {
        builder.ToTable("execution_logs");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(l => l.ExecutionId)
            .HasColumnName("execution_id")
            .IsRequired();

        builder.Property(l => l.NodeId)
            .HasColumnName("node_id")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(l => l.NodeType)
            .HasColumnName("node_type")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(l => l.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(l => l.StartedAt)
            .HasColumnName("started_at");

        builder.Property(l => l.CompletedAt)
            .HasColumnName("completed_at");

        builder.Property(l => l.InputDataJson)
            .HasColumnName("input_data")
            .HasColumnType("jsonb");

        builder.Property(l => l.OutputDataJson)
            .HasColumnName("output_data")
            .HasColumnType("jsonb");

        builder.Property(l => l.ErrorMessage)
            .HasColumnName("error_message")
            .HasMaxLength(2000);

        builder.Property(l => l.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        // Indexes
        builder.HasIndex(l => l.ExecutionId)
            .HasDatabaseName("idx_logs_execution_id");

        builder.HasIndex(l => new { l.ExecutionId, l.CreatedAt })
            .HasDatabaseName("idx_logs_execution_created");

        // Relationships
        builder.HasOne(l => l.Execution)
            .WithMany(e => e.Logs)
            .HasForeignKey(l => l.ExecutionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
