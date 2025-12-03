namespace WorkflowAutomation.Domain.ValueObjects;

public class HttpRequestConfiguration
{
    public string Method { get; set; } = "GET";
    public string Url { get; set; } = string.Empty;
    public Dictionary<string, string> Headers { get; set; } = new();
    public string? Body { get; set; }
    public int TimeoutSeconds { get; set; } = 30;
    public int MaxRetries { get; set; } = 3;

    public bool IsValid()
    {
        if (string.IsNullOrWhiteSpace(Url))
            return false;

        if (!Uri.TryCreate(Url, UriKind.Absolute, out _))
            return false;

        var validMethods = new[] { "GET", "POST", "PUT", "DELETE", "PATCH" };
        if (!validMethods.Contains(Method.ToUpperInvariant()))
            return false;

        return true;
    }
}
