using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WorkflowAutomation.Application.Executions.DTOs;
using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Enums;
using WorkflowAutomation.Domain.Interfaces;

namespace WorkflowAutomation.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ExecutionController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<ExecutionController> _logger;

    public ExecutionController(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ExecutionController> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExecutionResponse>>> GetAll(CancellationToken cancellationToken)
    {
        try
        {
            var executions = await _unitOfWork.WorkflowExecutions.GetAllAsync(cancellationToken);
            var response = _mapper.Map<IEnumerable<ExecutionResponse>>(executions);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving executions");
            return StatusCode(500, new { message = "An error occurred while retrieving executions" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExecutionResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var execution = await _unitOfWork.WorkflowExecutions.GetByIdAsync(id, cancellationToken);
            if (execution == null)
            {
                return NotFound(new { message = "Execution not found" });
            }

            var response = _mapper.Map<ExecutionResponse>(execution);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving execution {ExecutionId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the execution" });
        }
    }

    [HttpGet("workflow/{workflowId}")]
    public async Task<ActionResult<IEnumerable<ExecutionResponse>>> GetByWorkflowId(Guid workflowId, CancellationToken cancellationToken)
    {
        try
        {
            var executions = await _unitOfWork.WorkflowExecutions.GetByWorkflowIdAsync(workflowId, cancellationToken);
            var response = _mapper.Map<IEnumerable<ExecutionResponse>>(executions);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving executions for workflow {WorkflowId}", workflowId);
            return StatusCode(500, new { message = "An error occurred while retrieving executions" });
        }
    }

    [HttpPost("start")]
    public async Task<ActionResult<ExecutionResponse>> StartExecution([FromBody] StartExecutionRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var workflow = await _unitOfWork.Workflows.GetByIdAsync(request.WorkflowId, cancellationToken);
            if (workflow == null)
            {
                return NotFound(new { message = "Workflow not found" });
            }

            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());

            var execution = new WorkflowExecution
            {
                WorkflowId = request.WorkflowId,
                UserId = userId,
                Status = ExecutionStatus.Running,
                StartedAt = DateTime.UtcNow,
                ExecutionContextJson = request.InputData ?? "{}"
            };

            await _unitOfWork.WorkflowExecutions.AddAsync(execution, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Workflow execution started: {ExecutionId} for workflow {WorkflowId}",
                execution.Id, request.WorkflowId);

            var response = _mapper.Map<ExecutionResponse>(execution);
            return CreatedAtAction(nameof(GetById), new { id = execution.Id }, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting workflow execution");
            return StatusCode(500, new { message = "An error occurred while starting the execution" });
        }
    }

    [HttpPost("{id}/stop")]
    public async Task<ActionResult<ExecutionResponse>> StopExecution(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var execution = await _unitOfWork.WorkflowExecutions.GetByIdAsync(id, cancellationToken);
            if (execution == null)
            {
                return NotFound(new { message = "Execution not found" });
            }

            if (execution.Status != ExecutionStatus.Running)
            {
                return BadRequest(new { message = "Execution is not running" });
            }

            execution.Status = ExecutionStatus.Cancelled;
            execution.CompletedAt = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Workflow execution stopped: {ExecutionId}", id);

            var response = _mapper.Map<ExecutionResponse>(execution);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error stopping execution {ExecutionId}", id);
            return StatusCode(500, new { message = "An error occurred while stopping the execution" });
        }
    }

    [HttpGet("{id}/logs")]
    public async Task<ActionResult<IEnumerable<ExecutionLogResponse>>> GetExecutionLogs(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var execution = await _unitOfWork.WorkflowExecutions.GetByIdWithLogsAsync(id, cancellationToken);
            if (execution == null)
            {
                return NotFound(new { message = "Execution not found" });
            }

            var response = _mapper.Map<IEnumerable<ExecutionLogResponse>>(execution.Logs);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving logs for execution {ExecutionId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving execution logs" });
        }
    }

    [HttpGet("running")]
    public async Task<ActionResult<IEnumerable<ExecutionResponse>>> GetRunningExecutions(CancellationToken cancellationToken)
    {
        try
        {
            var executions = await _unitOfWork.WorkflowExecutions.GetByStatusAsync(ExecutionStatus.Running, cancellationToken);
            var response = _mapper.Map<IEnumerable<ExecutionResponse>>(executions);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving running executions");
            return StatusCode(500, new { message = "An error occurred while retrieving running executions" });
        }
    }
}
