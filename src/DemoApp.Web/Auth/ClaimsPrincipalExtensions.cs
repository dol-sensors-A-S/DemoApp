using System.Security.Claims;

namespace DemoApp.Web.Auth;

public static class ClaimsPrincipalExtensions
{
    public static string GetUserEmail(
        this ClaimsPrincipal user)
    {
        var value = user.Claims.SingleOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
        return value ?? throw new UserException("User doesnt have an email claim");
    }

    public static string GetUserNameIdentifier(
        this ClaimsPrincipal user)
    {
        var value = user.Claims.SingleOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        return value ?? throw new UserException("User doesnt have an email claim");
    }
}