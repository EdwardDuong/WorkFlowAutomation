namespace WorkflowAutomation.Domain.Exceptions;

public class InvalidConfigurationException : DomainException
{
    public InvalidConfigurationException(string message)
        : base(message)
    {
    }

    public InvalidConfigurationException(string configurationType, string reason)
        : base($"Invalid configuration for '{configurationType}': {reason}")
    {
    }
}
