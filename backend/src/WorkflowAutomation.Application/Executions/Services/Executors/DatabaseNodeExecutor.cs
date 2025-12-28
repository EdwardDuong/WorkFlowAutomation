using System.Data;
using System.Data.Common;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Npgsql;
using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Enums;

namespace WorkflowAutomation.Application.Executions.Services.Executors;

public class DatabaseNodeExecutor : INodeExecutor
{
    private readonly ILogger<DatabaseNodeExecutor> _logger;

    public DatabaseNodeExecutor(ILogger<DatabaseNodeExecutor> logger)
    {
        _logger = logger;
    }

    public async Task<object?> ExecuteAsync(WorkflowNode node, Dictionary<string, object?> context, CancellationToken cancellationToken = default)
    {
        if (node.NodeType != NodeType.Database)
        {
            throw new InvalidOperationException($"Invalid node type. Expected Database, got {node.NodeType}");
        }

        var config = node.GetConfiguration<DatabaseConfig>();
        if (config == null || string.IsNullOrWhiteSpace(config.ConnectionString) || string.IsNullOrWhiteSpace(config.Query))
        {
            throw new InvalidOperationException("Database node requires ConnectionString and Query configuration");
        }

        DbConnection? connection = null;
        try
        {
            connection = CreateConnection(config.DatabaseType ?? "PostgreSQL", config.ConnectionString);
            await connection.OpenAsync(cancellationToken);

            using var command = connection.CreateCommand();
            command.CommandText = config.Query;
            command.CommandType = config.IsStoredProcedure == true ? CommandType.StoredProcedure : CommandType.Text;

            // Add parameters if provided
            if (config.Parameters != null)
            {
                foreach (var param in config.Parameters)
                {
                    var dbParam = command.CreateParameter();
                    dbParam.ParameterName = param.Key;
                    dbParam.Value = param.Value ?? DBNull.Value;
                    command.Parameters.Add(dbParam);
                }
            }

            object? result;

            if (config.Query.TrimStart().StartsWith("SELECT", StringComparison.OrdinalIgnoreCase) ||
                config.IsStoredProcedure == true)
            {
                // Query - return results
                var rows = new List<Dictionary<string, object?>>();
                using var reader = await command.ExecuteReaderAsync(cancellationToken);

                while (await reader.ReadAsync(cancellationToken))
                {
                    var row = new Dictionary<string, object?>();
                    for (int i = 0; i < reader.FieldCount; i++)
                    {
                        row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
                    }
                    rows.Add(row);
                }

                result = new
                {
                    RowCount = rows.Count,
                    Rows = rows
                };
            }
            else
            {
                // Non-query (INSERT, UPDATE, DELETE) - return affected rows
                var affectedRows = await command.ExecuteNonQueryAsync(cancellationToken);
                result = new
                {
                    AffectedRows = affectedRows,
                    Success = true
                };
            }

            context["previousOutput"] = result;
            _logger.LogInformation("Database query executed successfully");
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database query failed");
            throw new InvalidOperationException($"Database query failed: {ex.Message}", ex);
        }
        finally
        {
            if (connection != null)
            {
                await connection.DisposeAsync();
            }
        }
    }

    private DbConnection CreateConnection(string databaseType, string connectionString)
    {
        return databaseType.ToLower() switch
        {
            "postgresql" or "postgres" => new NpgsqlConnection(connectionString),
            "sqlserver" or "mssql" => new SqlConnection(connectionString),
            _ => throw new NotSupportedException($"Database type '{databaseType}' is not supported")
        };
    }

    private class DatabaseConfig
    {
        public string? DatabaseType { get; set; }
        public string? ConnectionString { get; set; }
        public string? Query { get; set; }
        public bool? IsStoredProcedure { get; set; }
        public Dictionary<string, object?>? Parameters { get; set; }
    }
}
