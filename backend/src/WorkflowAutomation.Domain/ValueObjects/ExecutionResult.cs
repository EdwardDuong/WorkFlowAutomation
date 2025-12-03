namespace WorkflowAutomation.Domain.ValueObjects;

public class ExecutionResult
{
    public bool Success { get; private set; }
    public object? Data { get; private set; }
    public string? ErrorMessage { get; private set; }
    public Dictionary<string, object> Metadata { get; private set; } = new();

    private ExecutionResult() { }

    public static ExecutionResult SuccessResult(object? data = null)
    {
        return new ExecutionResult
        {
            Success = true,
            Data = data
        };
    }

    public static ExecutionResult FailureResult(string errorMessage)
    {
        return new ExecutionResult
        {
            Success = false,
            ErrorMessage = errorMessage
        };
    }

    public ExecutionResult WithMetadata(string key, object value)
    {
        Metadata[key] = value;
        return this;
    }

    public T? GetData<T>()
    {
        if (Data is T typedData)
            return typedData;
        return default;
    }
}
