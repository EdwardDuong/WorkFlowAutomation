using FluentValidation;
using WorkflowAutomation.Application.Workflows.DTOs;

namespace WorkflowAutomation.Application.Workflows.Validators;

public class CreateWorkflowRequestValidator : AbstractValidator<CreateWorkflowRequest>
{
    public CreateWorkflowRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Workflow name is required")
            .MaximumLength(255).WithMessage("Workflow name cannot exceed 255 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters")
            .When(x => x.Description != null);
    }
}
