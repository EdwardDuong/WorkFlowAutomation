using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using WorkflowAutomation.Application.Authentication.Services;

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

        return services;
    }
}
