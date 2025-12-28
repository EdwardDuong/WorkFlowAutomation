namespace WorkflowAutomation.Domain.Enums;

public enum NodeType
{
    Start = 0,
    HttpRequest = 1,
    Delay = 2,
    Condition = 3,
    Transform = 4,
    End = 5,
    Email = 6,
    Script = 7,
    Database = 8
}
