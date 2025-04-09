using System.Security.Claims;
using DemoApp.Core.JsonConfig;
using DemoApp.Web.Auth;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints;

public static class UserClaimsOverview
{
    public static async Task<string> Handle(
        [FromServices] IUserService userService,
        ClaimsPrincipal user)
    {
        var array = user.Claims.Select(x => new {x.Type, x.Value}).ToArray();
        if (array.Length == 0) return "Nothing";

        var firstClaim = user.Claims.FirstOrDefault()!;
        var claimsObj = new {firstClaim.Issuer, Subject = firstClaim.Subject?.Name ?? "", Claims = array};
        var u = await userService.GetUser();
        return Json.Serialize(new {claims = claimsObj, userGroupId = u.UserGroupId});
    }
}