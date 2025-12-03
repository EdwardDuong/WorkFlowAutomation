namespace WorkflowAutomation.Domain.ValueObjects;

public class TransformConfiguration
{
    public string Script { get; set; } = string.Empty;
    public Dictionary<string, string> Mappings { get; set; } = new();

    public bool IsValid()
    {
        return !string.IsNullOrWhiteSpace(Script) || Mappings.Count > 0;
    }
}
