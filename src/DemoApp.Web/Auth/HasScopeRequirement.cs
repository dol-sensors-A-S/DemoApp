using Microsoft.AspNetCore.Authorization;

namespace DemoApp.Web.Auth;

public class HasScopeRequirement(string scope, string issuer) : IAuthorizationRequirement
{
    public string Issuer { get; } = issuer ?? throw new ArgumentNullException(nameof(issuer));
    public string Scope { get; } = scope ?? throw new ArgumentNullException(nameof(scope));
}

public class HasScopeHandler : AuthorizationHandler<HasScopeRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        HasScopeRequirement requirement
    ) {
        // If user does not have the scope claim, get out of here
        var scopeClaim = context.User.FindFirst(c => c.Type == "scope" && c.Issuer == requirement.Issuer);
        if (scopeClaim is null)
            return Task.CompletedTask;

        // Split the scopes string into an array
        // Succeed if the scope array contains the required scope
        if (scopeClaim.Value.Split(" ").Any(s => s == requirement.Scope))
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}