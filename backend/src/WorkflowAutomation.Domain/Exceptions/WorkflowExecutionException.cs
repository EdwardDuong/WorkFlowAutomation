namespace WorkflowAutomation.Domain.Exceptions;

public class WorkflowExecutionException : DomainException
{
    public string? NodeId { get; }

    public WorkflowExecutionException(string message)
        : base(message)
    {
    }

    public WorkflowExecutionException(string message, string nodeId)
        : base(message)
    {
        NodeId = nodeId;
    }

    public WorkflowExecutionException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
