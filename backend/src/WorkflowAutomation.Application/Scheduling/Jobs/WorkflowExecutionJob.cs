using Microsoft.Extensions.Logging;
using Quartz;
using WorkflowAutomation.Application.Executions.Services;
using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Interfaces;

namespace WorkflowAutomation.Application.Scheduling.Jobs;

public class WorkflowExecutionJob : IJob
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IWorkflowExecutionService _executionService;
    private readonly ILogger<WorkflowExecutionJob> _logger;

    public WorkflowExecutionJob(
        IUnitOfWork unitOfWork,
        IWorkflowExecutionService executionService,
        ILogger<WorkflowExecutionJob> logger)
    {
        _unitOfWork = unitOfWork;
        _executionService = executionService;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        var scheduleId = context.JobDetail.JobDataMap.GetGuid("ScheduleId");
        var workflowId = context.JobDetail.JobDataMap.GetGuid("WorkflowId");

        _logger.LogInformation("Executing scheduled workflow {WorkflowId} from schedule {ScheduleId}", workflowId, scheduleId);

        try
        {
            // Start workflow execution
            var executionId = await _executionService.StartExecutionAsync(workflowId, "{}", context.CancellationToken);

            _logger.LogInformation("Started scheduled execution {ExecutionId} for workflow {WorkflowId}", executionId, workflowId);

            // Update last run time
            var schedule = await _unitOfWork.Repository<ScheduledWorkflow>()
                .GetByIdAsync(scheduleId, context.CancellationToken);

            if (schedule != null)
            {
                schedule.UpdateLastRun(DateTime.UtcNow);

                // Calculate next run time from cron expression
                var cronExpression = new CronExpression(schedule.CronExpression);
                var nextRun = cronExpression.GetNextValidTimeAfter(DateTimeOffset.UtcNow);
                if (nextRun.HasValue)
                {
                    schedule.UpdateNextRun(nextRun.Value.UtcDateTime);
                }

                await _unitOfWork.SaveChangesAsync(context.CancellationToken);

                _logger.LogInformation("Updated schedule {ScheduleId}, next run at {NextRun}", scheduleId, schedule.NextRunAt);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing scheduled workflow {WorkflowId}", workflowId);
            throw;
        }
    }
}
