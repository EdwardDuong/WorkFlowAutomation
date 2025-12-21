using FluentValidation;
using WorkflowAutomation.Application.Executions.DTOs;

namespace WorkflowAutomation.Application.Executions.Validators;

public class StartExecutionRequestValidator : AbstractValidator<StartExecutionRequest>
{
    public StartExecutionRequestValidator()
    {
        RuleFor(x => x.WorkflowId)
            .NotEmpty().WithMessage("Workflow ID is required");

        RuleFor(x => x.InputData)
            .Must(BeValidJson).WithMessage("Input data must be valid JSON")
            .When(x => !string.IsNullOrEmpty(x.InputData));
    }

    private bool BeValidJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return true;

        try
        {
            System.Text.Json.JsonDocument.Parse(json);
            return true;
        }
        catch
        {
            return false;
        }
    }
}
