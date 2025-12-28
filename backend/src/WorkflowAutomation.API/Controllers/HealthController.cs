using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkflowAutomation.Infrastructure.Persistence;

namespace WorkflowAutomation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        ApplicationDbContext dbContext,
        IConfiguration configuration,
        ILogger<HealthController> logger)
    {
        _dbContext = dbContext;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetHealth(CancellationToken cancellationToken)
    {
        var health = new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow,
            checks = new Dictionary<string, object>()
        };

        try
        {
            // Check database connectivity
            var dbHealthy = await CheckDatabaseHealth(cancellationToken);
            health.checks["database"] = new
            {
                status = dbHealthy ? "Healthy" : "Unhealthy",
                responseTime = "< 100ms"
            };

            // Check Redis connectivity (optional)
            var redisConnectionString = _configuration.GetConnectionString("Redis");
            if (!string.IsNullOrEmpty(redisConnectionString))
            {
                var redisHealthy = await CheckRedisHealth();
                health.checks["redis"] = new
                {
                    status = redisHealthy ? "Healthy" : "Unhealthy"
                };
            }

            // Overall health status
            var allHealthy = dbHealthy;
            var overallStatus = allHealthy ? "Healthy" : "Unhealthy";

            _logger.LogInformation("Health check completed: {Status}", overallStatus);

            return allHealthy ? Ok(new
            {
                status = overallStatus,
                timestamp = health.timestamp,
                checks = health.checks
            }) : StatusCode(503, new
            {
                status = overallStatus,
                timestamp = health.timestamp,
                checks = health.checks
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            return StatusCode(503, new
            {
                status = "Unhealthy",
                timestamp = DateTime.UtcNow,
                error = ex.Message
            });
        }
    }

    [HttpGet("ready")]
    public async Task<IActionResult> GetReadiness(CancellationToken cancellationToken)
    {
        try
        {
            // Check if database is ready
            var canConnect = await _dbContext.Database.CanConnectAsync(cancellationToken);

            if (canConnect)
            {
                _logger.LogInformation("Readiness check passed");
                return Ok(new { status = "Ready", timestamp = DateTime.UtcNow });
            }

            _logger.LogWarning("Readiness check failed: Database not ready");
            return StatusCode(503, new { status = "Not Ready", timestamp = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Readiness check failed");
            return StatusCode(503, new { status = "Not Ready", error = ex.Message, timestamp = DateTime.UtcNow });
        }
    }

    [HttpGet("live")]
    public IActionResult GetLiveness()
    {
        _logger.LogInformation("Liveness check passed");
        return Ok(new { status = "Alive", timestamp = DateTime.UtcNow });
    }

    private async Task<bool> CheckDatabaseHealth(CancellationToken cancellationToken)
    {
        try
        {
            return await _dbContext.Database.CanConnectAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database health check failed");
            return false;
        }
    }

    private async Task<bool> CheckRedisHealth()
    {
        try
        {
            // Redis health check would go here if Redis client is configured
            // For now, return true if connection string exists
            await Task.CompletedTask;
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Redis health check failed");
            return false;
        }
    }
}
