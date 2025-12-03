using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WorkflowAutomation.Application.Authentication.Services;
using WorkflowAutomation.Domain.Interfaces;
using WorkflowAutomation.Infrastructure.Authentication;
using WorkflowAutomation.Infrastructure.Configuration;
using WorkflowAutomation.Infrastructure.Persistence;
using WorkflowAutomation.Infrastructure.Persistence.Repositories;

namespace WorkflowAutomation.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register DbContext with PostgreSQL
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        // Register JWT settings
        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));

        // Register authentication services
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        // Register repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IWorkflowRepository, WorkflowRepository>();
        services.AddScoped<IWorkflowExecutionRepository, WorkflowExecutionRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Register workflow executors will be added here later

        return services;
    }
}
