using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Quartz;
using WorkflowAutomation.Application.Scheduling.Jobs;
using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Interfaces;

namespace WorkflowAutomation.Application.Scheduling.Services;

public class ScheduledWorkflowService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ISchedulerFactory _schedulerFactory;
    private readonly ILogger<ScheduledWorkflowService> _logger;
    private IScheduler? _scheduler;

    public ScheduledWorkflowService(
        IServiceProvider serviceProvider,
        ISchedulerFactory schedulerFactory,
        ILogger<ScheduledWorkflowService> logger)
    {
        _serviceProvider = serviceProvider;
        _schedulerFactory = schedulerFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Scheduled Workflow Service starting...");

        _scheduler = await _schedulerFactory.GetScheduler(stoppingToken);
        await _scheduler.Start(stoppingToken);

        // Load and schedule all active workflows
        await LoadScheduledWorkflowsAsync(stoppingToken);

        _logger.LogInformation("Scheduled Workflow Service started");

        // Keep the service running
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

    public async Task LoadScheduledWorkflowsAsync(CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        try
        {
            var schedules = await unitOfWork.Repository<ScheduledWorkflow>().GetAllAsync(cancellationToken);
            var activeSchedules = schedules.Where(s => s.IsActive).ToList();

            _logger.LogInformation("Loading {Count} active scheduled workflows", activeSchedules.Count);

            foreach (var schedule in activeSchedules)
            {
                await ScheduleWorkflowAsync(schedule, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading scheduled workflows");
        }
    }

    public async Task ScheduleWorkflowAsync(ScheduledWorkflow schedule, CancellationToken cancellationToken = default)
    {
        if (_scheduler == null)
        {
            _logger.LogWarning("Scheduler not initialized");
            return;
        }

        try
        {
            var jobKey = new JobKey($"workflow-{schedule.WorkflowId}", $"schedule-{schedule.Id}");

            // Remove existing job if it exists
            if (await _scheduler.CheckExists(jobKey, cancellationToken))
            {
                await _scheduler.DeleteJob(jobKey, cancellationToken);
            }

            // Create job
            var job = JobBuilder.Create<WorkflowExecutionJob>()
                .WithIdentity(jobKey)
                .UsingJobData("ScheduleId", schedule.Id.ToString())
                .UsingJobData("WorkflowId", schedule.WorkflowId.ToString())
                .Build();

            // Create trigger with cron expression
            var trigger = TriggerBuilder.Create()
                .WithIdentity($"trigger-{schedule.Id}", $"schedule-{schedule.Id}")
                .WithCronSchedule(schedule.CronExpression)
                .Build();

            await _scheduler.ScheduleJob(job, trigger, cancellationToken);

            // Update next run time if not set
            if (schedule.NextRunAt == null)
            {
                var nextFireTime = trigger.GetNextFireTimeUtc();
                if (nextFireTime.HasValue)
                {
                    schedule.UpdateNextRun(nextFireTime.Value.UtcDateTime);

                    using var scope = _serviceProvider.CreateScope();
                    var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                    await unitOfWork.SaveChangesAsync(cancellationToken);
                }
            }

            _logger.LogInformation("Scheduled workflow {WorkflowId} with cron expression '{CronExpression}'",
                schedule.WorkflowId, schedule.CronExpression);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scheduling workflow {WorkflowId}", schedule.WorkflowId);
        }
    }

    public async Task UnscheduleWorkflowAsync(Guid scheduleId, CancellationToken cancellationToken = default)
    {
        if (_scheduler == null)
        {
            _logger.LogWarning("Scheduler not initialized");
            return;
        }

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            var schedule = await unitOfWork.Repository<ScheduledWorkflow>().GetByIdAsync(scheduleId, cancellationToken);
            if (schedule == null)
            {
                return;
            }

            var jobKey = new JobKey($"workflow-{schedule.WorkflowId}", $"schedule-{schedule.Id}");

            if (await _scheduler.CheckExists(jobKey, cancellationToken))
            {
                await _scheduler.DeleteJob(jobKey, cancellationToken);
                _logger.LogInformation("Unscheduled workflow {WorkflowId}", schedule.WorkflowId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unscheduling workflow for schedule {ScheduleId}", scheduleId);
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Scheduled Workflow Service stopping...");

        if (_scheduler != null)
        {
            await _scheduler.Shutdown(cancellationToken);
        }

        await base.StopAsync(cancellationToken);

        _logger.LogInformation("Scheduled Workflow Service stopped");
    }
}
