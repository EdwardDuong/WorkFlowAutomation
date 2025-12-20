using AutoMapper;
using WorkflowAutomation.Application.Workflows.DTOs;
using WorkflowAutomation.Domain.Entities;

namespace WorkflowAutomation.Application.Workflows.Mappings;

public class WorkflowMappingProfile : Profile
{
    public WorkflowMappingProfile()
    {
        // Workflow mappings
        CreateMap<Workflow, WorkflowResponse>();

        CreateMap<Workflow, WorkflowDetailResponse>()
            .ForMember(dest => dest.Nodes, opt => opt.MapFrom(src => src.Nodes))
            .ForMember(dest => dest.Edges, opt => opt.MapFrom(src => src.Edges));

        CreateMap<CreateWorkflowRequest, Workflow>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.Nodes, opt => opt.Ignore())
            .ForMember(dest => dest.Edges, opt => opt.Ignore())
            .ForMember(dest => dest.Executions, opt => opt.Ignore())
            .ForMember(dest => dest.ScheduledWorkflows, opt => opt.Ignore());

        // WorkflowNode mappings
        CreateMap<WorkflowNode, WorkflowNodeResponse>();

        // WorkflowEdge mappings
        CreateMap<WorkflowEdge, WorkflowEdgeResponse>();
    }
}
