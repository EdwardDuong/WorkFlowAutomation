using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quartz;
using WorkflowAutomation.Application.Scheduling.DTOs;
using WorkflowAutomation.Application.Scheduling.Services;
using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Interfaces;

namespace WorkflowAutomation.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ScheduledWorkflowController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<ScheduledWorkflowController> _logger;
    private readonly ScheduledWorkflowService _scheduledWorkflowService;

    public ScheduledWorkflowController(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<ScheduledWorkflowController> logger,
        IEnumerable<IHostedService> hostedServices)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
        _scheduledWorkflowService = hostedServices.OfType<ScheduledWorkflowService>().FirstOrDefault()
            ?? throw new InvalidOperationException("ScheduledWorkflowService not found");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ScheduledWorkflowResponse>>> GetAll(CancellationToken cancellationToken)
    {
        try
        {
            var schedules = await _unitOfWork.Repository<ScheduledWorkflow>()
                .GetAllAsync(cancellationToken);

            // Load workflow names
            var workflowIds = schedules.Select(s => s.WorkflowId).Distinct().ToList();
            var workflows = await _unitOfWork.Workflows.GetAllAsync(cancellationToken);
            var workflowDict = workflows.ToDictionary(w => w.Id, w => w.Name);

            var responses = schedules.Select(s =>
            {
                var response = _mapper.Map<ScheduledWorkflowResponse>(s);
                response.WorkflowName = workflowDict.GetValueOrDefault(s.WorkflowId, "Unknown");
                return response;
            }).ToList();

            return Ok(responses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving scheduled workflows");
            return StatusCode(500, new { message = "An error occurred while retrieving scheduled workflows" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ScheduledWorkflowResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var schedule = await _unitOfWork.Repository<ScheduledWorkflow>()
                .GetByIdAsync(id, cancellationToken);

            if (schedule == null)
            {
                return NotFound(new { message = "Scheduled workflow not found" });
            }

            var workflow = await _unitOfWork.Workflows.GetByIdAsync(schedule.WorkflowId, cancellationToken);
            var response = _mapper.Map<ScheduledWorkflowResponse>(schedule);
            response.WorkflowName = workflow?.Name ?? "Unknown";

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving scheduled workflow {Id}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the scheduled workflow" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ScheduledWorkflowResponse>> Create([FromBody] ScheduledWorkflowRequest request, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate cron expression
            if (!CronExpression.IsValidExpression(request.CronExpression))
            {
                return BadRequest(new { message = "Invalid cron expression" });
            }

            // Check if workflow exists
            var workflow = await _unitOfWork.Workflows.GetByIdAsync(request.WorkflowId, cancellationToken);
            if (workflow == null)
            {
                return NotFound(new { message = "Workflow not found" });
            }

            var schedule = _mapper.Map<ScheduledWorkflow>(request);

            // Calculate next run time
            var cronExpression = new CronExpression(request.CronExpression);
            var nextRun = cronExpression.GetNextValidTimeAfter(DateTimeOffset.UtcNow);
            if (nextRun.HasValue)
            {
                schedule.UpdateNextRun(nextRun.Value.UtcDateTime);
            }

            await _unitOfWork.Repository<ScheduledWorkflow>().AddAsync(schedule, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Created scheduled workflow for workflow {WorkflowId}", request.WorkflowId);

            // Schedule in Quartz if active
            if (schedule.IsActive)
            {
                await _scheduledWorkflowService.ScheduleWorkflowAsync(schedule, cancellationToken);
            }

            var response = _mapper.Map<ScheduledWorkflowResponse>(schedule);
            response.WorkflowName = workflow.Name;

            return CreatedAtAction(nameof(GetById), new { id = schedule.Id }, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating scheduled workflow");
            return StatusCode(500, new { message = "An error occurred while creating the scheduled workflow" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ScheduledWorkflowResponse>> Update(Guid id, [FromBody] ScheduledWorkflowRequest request, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate cron expression
            if (!CronExpression.IsValidExpression(request.CronExpression))
            {
                return BadRequest(new { message = "Invalid cron expression" });
            }

            var schedule = await _unitOfWork.Repository<ScheduledWorkflow>().GetByIdAsync(id, cancellationToken);
            if (schedule == null)
            {
                return NotFound(new { message = "Scheduled workflow not found" });
            }

            var workflow = await _unitOfWork.Workflows.GetByIdAsync(request.WorkflowId, cancellationToken);
            if (workflow == null)
            {
                return NotFound(new { message = "Workflow not found" });
            }

            // Unschedule if it was active
            if (schedule.IsActive)
            {
                await _scheduledWorkflowService.UnscheduleWorkflowAsync(schedule.Id, cancellationToken);
            }

            schedule.WorkflowId = request.WorkflowId;
            schedule.CronExpression = request.CronExpression;
            schedule.IsActive = request.IsActive;
            schedule.UpdatedAt = DateTime.UtcNow;

            // Calculate next run time
            var cronExpression = new CronExpression(request.CronExpression);
            var nextRun = cronExpression.GetNextValidTimeAfter(DateTimeOffset.UtcNow);
            if (nextRun.HasValue)
            {
                schedule.UpdateNextRun(nextRun.Value.UtcDateTime);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Updated scheduled workflow {Id}", id);

            // Reschedule if active
            if (schedule.IsActive)
            {
                await _scheduledWorkflowService.ScheduleWorkflowAsync(schedule, cancellationToken);
            }

            var response = _mapper.Map<ScheduledWorkflowResponse>(schedule);
            response.WorkflowName = workflow.Name;

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating scheduled workflow {Id}", id);
            return StatusCode(500, new { message = "An error occurred while updating the scheduled workflow" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var schedule = await _unitOfWork.Repository<ScheduledWorkflow>().GetByIdAsync(id, cancellationToken);
            if (schedule == null)
            {
                return NotFound(new { message = "Scheduled workflow not found" });
            }

            // Unschedule from Quartz
            await _scheduledWorkflowService.UnscheduleWorkflowAsync(schedule.Id, cancellationToken);

            await _unitOfWork.Repository<ScheduledWorkflow>().DeleteAsync(schedule, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Deleted scheduled workflow {Id}", id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting scheduled workflow {Id}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the scheduled workflow" });
        }
    }

    [HttpPost("{id}/activate")]
    public async Task<ActionResult<ScheduledWorkflowResponse>> Activate(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var schedule = await _unitOfWork.Repository<ScheduledWorkflow>().GetByIdAsync(id, cancellationToken);
            if (schedule == null)
            {
                return NotFound(new { message = "Scheduled workflow not found" });
            }

            schedule.Activate();
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Schedule in Quartz
            await _scheduledWorkflowService.ScheduleWorkflowAsync(schedule, cancellationToken);

            _logger.LogInformation("Activated scheduled workflow {Id}", id);

            var workflow = await _unitOfWork.Workflows.GetByIdAsync(schedule.WorkflowId, cancellationToken);
            var response = _mapper.Map<ScheduledWorkflowResponse>(schedule);
            response.WorkflowName = workflow?.Name ?? "Unknown";

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating scheduled workflow {Id}", id);
            return StatusCode(500, new { message = "An error occurred while activating the scheduled workflow" });
        }
    }

    [HttpPost("{id}/deactivate")]
    public async Task<ActionResult<ScheduledWorkflowResponse>> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var schedule = await _unitOfWork.Repository<ScheduledWorkflow>().GetByIdAsync(id, cancellationToken);
            if (schedule == null)
            {
                return NotFound(new { message = "Scheduled workflow not found" });
            }

            schedule.Deactivate();
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Unschedule from Quartz
            await _scheduledWorkflowService.UnscheduleWorkflowAsync(schedule.Id, cancellationToken);

            _logger.LogInformation("Deactivated scheduled workflow {Id}", id);

            var workflow = await _unitOfWork.Workflows.GetByIdAsync(schedule.WorkflowId, cancellationToken);
            var response = _mapper.Map<ScheduledWorkflowResponse>(schedule);
            response.WorkflowName = workflow?.Name ?? "Unknown";

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating scheduled workflow {Id}", id);
            return StatusCode(500, new { message = "An error occurred while deactivating the scheduled workflow" });
        }
    }
}
