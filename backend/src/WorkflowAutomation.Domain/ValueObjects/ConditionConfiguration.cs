namespace WorkflowAutomation.Domain.ValueObjects;

public class ConditionConfiguration
{
    public string Expression { get; set; } = string.Empty;
    public string? TrueTarget { get; set; }
    public string? FalseTarget { get; set; }

    public bool IsValid()
    {
        return !string.IsNullOrWhiteSpace(Expression);
    }
}
