using API.Extensions;
using API.Service;
using Core.Entities;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Serilog;
using System.Text;
using System.Text.Json;



var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
                .WriteTo.Console()
                .Enrich.FromLogContext()
                .CreateLogger();
builder.Host.UseSerilog();

Log.Logger.Information("Starting API...");
builder.Services.AddDbContext<AppDbContext>();

Log.Logger.Information("Configure Identity...");
builder.Services.AddIdentity<Usuario, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();


//Config JWT
Log.Logger.Information("Configure JWT...");
builder.Services.AddJwtAuthentication(builder.Configuration);


//registrar Services
Log.Logger.Information("Configure Services...");
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<ICampeonatoService, CampeonatoService>();
builder.Services.AddScoped<ITimeService, TimeService>();
builder.Services.AddScoped<IInscricaoService, InscricaoService>();


//registrar Repositories
Log.Logger.Information("Configure Repositories...");
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ICampeonatoRepository, CampeonatoRepository>();
builder.Services.AddScoped<ITimeRepository, TimeRepository>();
builder.Services.AddScoped<IInscricaoRepository, InscricaoRepository>();


Log.Logger.Information("Configure Controllers...");
builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        o.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddOpenApi();

Log.Logger.Information("Configure CORS...");
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "*")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowAnyOrigin();
        //  .AllowCredentials();
    });
});


// Add services to the container.

var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
    
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    
    if (context.Database.GetPendingMigrations().Any())
    {
        context.Database.Migrate();
    }

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    string[] roles = { "User", "Admin" };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
}


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}


if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

Log.Logger.Information("Running API...");
app.Run();
