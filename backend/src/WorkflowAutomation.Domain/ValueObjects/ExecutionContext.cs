namespace WorkflowAutomation.Domain.ValueObjects;

public class ExecutionContext
{
    private readonly Dictionary<string, object> _data = new();

    public void SetValue(string key, object value)
    {
        _data[key] = value;
    }

    public T? GetValue<T>(string key)
    {
        if (_data.TryGetValue(key, out var value))
        {
            if (value is T typedValue)
                return typedValue;
        }
        return default;
    }

    public bool TryGetValue<T>(string key, out T? value)
    {
        if (_data.TryGetValue(key, out var objValue) && objValue is T typedValue)
        {
            value = typedValue;
            return true;
        }
        value = default;
        return false;
    }

    public bool ContainsKey(string key) => _data.ContainsKey(key);

    public void Clear() => _data.Clear();

    public Dictionary<string, object> GetAll() => new(_data);
}
