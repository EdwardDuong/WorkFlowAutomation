using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkflowAutomation.Domain.Entities;

namespace WorkflowAutomation.Infrastructure.Persistence.Configurations;

public class ScheduledWorkflowConfiguration : IEntityTypeConfiguration<ScheduledWorkflow>
{
    public void Configure(EntityTypeBuilder<ScheduledWorkflow> builder)
    {
        builder.ToTable("scheduled_workflows");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(s => s.WorkflowId)
            .HasColumnName("workflow_id")
            .IsRequired();

        builder.Property(s => s.CronExpression)
            .HasColumnName("cron_expression")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(s => s.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(s => s.LastRunAt)
            .HasColumnName("last_run_at");

        builder.Property(s => s.NextRunAt)
            .HasColumnName("next_run_at");

        builder.Property(s => s.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(s => s.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Indexes
        builder.HasIndex(s => s.WorkflowId)
            .HasDatabaseName("idx_scheduled_workflow_id");

        builder.HasIndex(s => new { s.NextRunAt, s.IsActive })
            .HasDatabaseName("idx_scheduled_next_run")
            .HasFilter("is_active = true");

        // Relationships
        builder.HasOne(s => s.Workflow)
            .WithMany()
            .HasForeignKey(s => s.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
