using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;

namespace DemoApp.Web.Auth;

public static class AuthSetupExtensions
{
    public static void SetupAuthentication(
        this WebApplicationBuilder builder)
    {
        var domain = builder.Configuration["Auth0:Domain"]!;

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options =>
        {
            options.Authority = domain;
            options.Audience = builder.Configuration["Auth0:Audience"];
            options.TokenValidationParameters = new TokenValidationParameters
            {
                NameClaimType = ClaimTypes.NameIdentifier
            };
        });

        builder.Services.AddAuthorizationBuilder()
            .AddPolicy(UserPolicy.Email.ToString(), policy => policy.Requirements.Add(new HasScopeRequirement("email", domain)))
            .AddPolicy(UserPolicy.ReadDevices.ToString(), policy => policy.RequireAssertion(x => x.User.HasClaim("email_verified", "true"))
                .RequireClaim("permissions", "read:devices"))
            .AddPolicy(UserPolicy.ReadData.ToString(), policy => policy.RequireAssertion(x => x.User.HasClaim("email_verified", "true"))
                .RequireClaim("permissions", "read:data"))
            .AddPolicy(UserPolicy.WriteDevices.ToString(), policy => policy.RequireAssertion(x => x.User.HasClaim("email_verified", "true"))
                .RequireClaim("permissions", "write:devices"));

        builder.Services.AddSingleton<IAuthorizationHandler, HasScopeHandler>();

        builder.Services.AddHttpContextAccessor();
        builder.Services.AddTransient<ClaimsPrincipal>(s => s.GetRequiredService<IHttpContextAccessor>().HttpContext!.User);
    }

    public static RouteHandlerBuilder Require(
        this RouteHandlerBuilder routeHandlerBuilder,
        UserPolicy policy)
    {
        return routeHandlerBuilder.RequireAuthorization(policy.ToString());
    }
}

public enum UserPolicy
{
    ReadDevices = 0,
    WriteDevices = 1,
    ReadData = 2,
    Email = 3
}