using AutoMapper;
using WorkflowAutomation.Application.Scheduling.DTOs;
using WorkflowAutomation.Domain.Entities;

namespace WorkflowAutomation.Application.Scheduling.Mappings;

public class ScheduledWorkflowMappingProfile : Profile
{
    public ScheduledWorkflowMappingProfile()
    {
        CreateMap<ScheduledWorkflow, ScheduledWorkflowResponse>()
            .ForMember(dest => dest.WorkflowName, opt => opt.MapFrom(src => src.Workflow != null ? src.Workflow.Name : string.Empty));

        CreateMap<ScheduledWorkflowRequest, ScheduledWorkflow>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Workflow, opt => opt.Ignore())
            .ForMember(dest => dest.LastRunAt, opt => opt.Ignore())
            .ForMember(dest => dest.NextRunAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
    }
}
