using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using WorkflowAutomation.Application.Authentication.Services;
using WorkflowAutomation.Application.Executions.Services;
using WorkflowAutomation.Application.Scheduling.Jobs;
using WorkflowAutomation.Application.Scheduling.Services;

namespace WorkflowAutomation.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Register MediatR
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

        // Register FluentValidation validators
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // Register AutoMapper
        services.AddAutoMapper(cfg =>
        {
            // AutoMapper profiles will be added here later
        }, Assembly.GetExecutingAssembly());

        // Register Authentication Services
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        // Register Workflow Execution Services
        services.AddScoped<IWorkflowExecutionService, WorkflowExecutionService>();
        services.AddHttpClient(); // For HTTP Request node executor

        // Register Quartz.NET
        services.AddQuartz(q =>
        {
            // Register jobs as durable (persists without triggers)
            q.AddJob<WorkflowExecutionJob>(opts => opts
                .WithIdentity("workflow-execution-job")
                .StoreDurably());
        });

        services.AddQuartzHostedService(options =>
        {
            options.WaitForJobsToComplete = true;
        });

        // Register Scheduled Workflow Background Service
        services.AddHostedService<ScheduledWorkflowService>();

        return services;
    }
}
