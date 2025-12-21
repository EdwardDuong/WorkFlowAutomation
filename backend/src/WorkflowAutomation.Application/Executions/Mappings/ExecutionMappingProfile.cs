using AutoMapper;
using WorkflowAutomation.Application.Executions.DTOs;
using WorkflowAutomation.Domain.Entities;

namespace WorkflowAutomation.Application.Executions.Mappings;

public class ExecutionMappingProfile : Profile
{
    public ExecutionMappingProfile()
    {
        // WorkflowExecution mappings
        CreateMap<WorkflowExecution, ExecutionResponse>()
            .ForMember(dest => dest.Duration, opt => opt.MapFrom(src => src.GetDuration()));

        CreateMap<WorkflowExecution, ExecutionDetailResponse>()
            .ForMember(dest => dest.Duration, opt => opt.MapFrom(src => src.GetDuration()))
            .ForMember(dest => dest.Logs, opt => opt.MapFrom(src => src.Logs));

        // ExecutionLog mappings
        CreateMap<ExecutionLog, ExecutionLogResponse>()
            .ForMember(dest => dest.Duration, opt => opt.MapFrom(src => src.GetDuration()));
    }
}
