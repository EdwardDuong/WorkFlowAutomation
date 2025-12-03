using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorkflowAutomation.Domain.Entities;

namespace WorkflowAutomation.Infrastructure.Persistence.Configurations;

public class WorkflowConfiguration : IEntityTypeConfiguration<Workflow>
{
    public void Configure(EntityTypeBuilder<Workflow> builder)
    {
        builder.ToTable("workflows");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(w => w.Name)
            .HasColumnName("name")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(w => w.Description)
            .HasColumnName("description")
            .HasMaxLength(1000);

        builder.Property(w => w.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(w => w.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(w => w.Version)
            .HasColumnName("version")
            .HasDefaultValue(1)
            .IsRequired();

        builder.Property(w => w.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(w => w.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();

        // Indexes
        builder.HasIndex(w => w.UserId)
            .HasDatabaseName("idx_workflows_user_id");

        builder.HasIndex(w => w.IsActive)
            .HasDatabaseName("idx_workflows_is_active");

        // Relationships
        builder.HasOne(w => w.User)
            .WithMany(u => u.Workflows)
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(w => w.Nodes)
            .WithOne(n => n.Workflow)
            .HasForeignKey(n => n.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(w => w.Edges)
            .WithOne(e => e.Workflow)
            .HasForeignKey(e => e.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(w => w.Executions)
            .WithOne(e => e.Workflow)
            .HasForeignKey(e => e.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
