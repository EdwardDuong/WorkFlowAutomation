using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WorkflowAutomation.Application.Workflows.DTOs;
using WorkflowAutomation.Domain.Entities;
using WorkflowAutomation.Domain.Interfaces;

namespace WorkflowAutomation.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WorkflowController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<WorkflowController> _logger;

    public WorkflowController(IUnitOfWork unitOfWork, IMapper mapper, ILogger<WorkflowController> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkflowResponse>>> GetAll(CancellationToken cancellationToken)
    {
        try
        {
            var workflows = await _unitOfWork.Workflows.GetAllAsync(cancellationToken);
            var response = _mapper.Map<IEnumerable<WorkflowResponse>>(workflows);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflows");
            return StatusCode(500, new { message = "An error occurred while retrieving workflows" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WorkflowResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var workflow = await _unitOfWork.Workflows.GetByIdAsync(id, cancellationToken);
            if (workflow == null)
            {
                return NotFound(new { message = "Workflow not found" });
            }

            var response = _mapper.Map<WorkflowResponse>(workflow);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow {WorkflowId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the workflow" });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<WorkflowResponse>>> GetByUserId(Guid userId, CancellationToken cancellationToken)
    {
        try
        {
            var workflows = await _unitOfWork.Workflows.GetByUserIdAsync(userId, cancellationToken);
            var response = _mapper.Map<IEnumerable<WorkflowResponse>>(workflows);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflows for user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while retrieving workflows" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<WorkflowResponse>> Create([FromBody] CreateWorkflowRequest request, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedAccessException());

            var workflow = _mapper.Map<Workflow>(request);
            workflow.UserId = userId;

            await _unitOfWork.Workflows.AddAsync(workflow, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Workflow created: {WorkflowId}", workflow.Id);

            var response = _mapper.Map<WorkflowResponse>(workflow);
            return CreatedAtAction(nameof(GetById), new { id = workflow.Id }, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating workflow");
            return StatusCode(500, new { message = "An error occurred while creating the workflow" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<WorkflowResponse>> Update(Guid id, [FromBody] UpdateWorkflowRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var existing = await _unitOfWork.Workflows.GetByIdAsync(id, cancellationToken);
            if (existing == null)
            {
                return NotFound(new { message = "Workflow not found" });
            }

            existing.Name = request.Name;
            existing.Description = request.Description;
            existing.IsActive = request.IsActive;
            existing.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Workflow updated: {WorkflowId}", id);

            var response = _mapper.Map<WorkflowResponse>(existing);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating workflow {WorkflowId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the workflow" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var workflow = await _unitOfWork.Workflows.GetByIdAsync(id, cancellationToken);
            if (workflow == null)
            {
                return NotFound(new { message = "Workflow not found" });
            }

            await _unitOfWork.Repository<Workflow>().DeleteAsync(workflow, cancellationToken);

            _logger.LogInformation("Workflow deleted: {WorkflowId}", id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting workflow {WorkflowId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the workflow" });
        }
    }

    [HttpGet("{id}/with-nodes")]
    public async Task<ActionResult<WorkflowDetailResponse>> GetWithNodes(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var workflow = await _unitOfWork.Workflows.GetByIdWithNodesAndEdgesAsync(id, cancellationToken);
            if (workflow == null)
            {
                return NotFound(new { message = "Workflow not found" });
            }

            var response = _mapper.Map<WorkflowDetailResponse>(workflow);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow with nodes {WorkflowId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the workflow" });
        }
    }
}
