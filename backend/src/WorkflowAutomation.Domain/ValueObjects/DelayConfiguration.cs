namespace WorkflowAutomation.Domain.ValueObjects;

public class DelayConfiguration
{
    public int Duration { get; set; }
    public string Unit { get; set; } = "milliseconds"; // milliseconds, seconds, minutes

    public TimeSpan GetTimeSpan()
    {
        return Unit.ToLowerInvariant() switch
        {
            "milliseconds" => TimeSpan.FromMilliseconds(Duration),
            "seconds" => TimeSpan.FromSeconds(Duration),
            "minutes" => TimeSpan.FromMinutes(Duration),
            "hours" => TimeSpan.FromHours(Duration),
            _ => TimeSpan.FromMilliseconds(Duration)
        };
    }

    public bool IsValid()
    {
        if (Duration <= 0)
            return false;

        var validUnits = new[] { "milliseconds", "seconds", "minutes", "hours" };
        return validUnits.Contains(Unit.ToLowerInvariant());
    }
}
