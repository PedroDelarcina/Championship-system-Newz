using API.Service;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Infrastructure.Repositories;
using Resend;
using System.Text;

namespace API.Extensions
{
    public static class DependencyInjectionExtensions
    {
        public static IServiceCollection AddDependencyInjection(this IServiceCollection services)
        {
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

            services.AddCoreServices();
            services.AddDomainServices();
            services.AddRepositories();

            return services;
        }

        public static IServiceCollection AddCoreServices(this IServiceCollection services)
        {
            services.AddHttpContextAccessor();
            services.AddScoped<TokenService>();

            return services;
        }

        public static IServiceCollection AddDomainServices(this IServiceCollection services)
        {
            //Serviços principais do sistema
            services.AddScoped<ICampeonatoService, CampeonatoService>();
            services.AddScoped<ITimeService, TimeService>();
            services.AddScoped<IInscricaoService, InscricaoService>();
            services.AddScoped<IEmailService, EmailService>();
           // services.AddTransient<IResend, ResendClient>();

            //Serviço de autenticação
            services.AddScoped<IAuthService, AuthService>();

            return services;
        }

        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            //Repositório genérico
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

            //Repositórios principais
            services.AddScoped<ICampeonatoRepository, CampeonatoRepository>();
            services.AddScoped<ITimeRepository, TimeRepository>();
            services.AddScoped<IInscricaoRepository, InscricaoRepository>();

            return services;
        }
    }
}
