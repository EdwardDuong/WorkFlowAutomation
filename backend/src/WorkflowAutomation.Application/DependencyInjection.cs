using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

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

        return services;
    }
}
