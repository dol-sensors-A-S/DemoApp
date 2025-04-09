using DemoApp.Core.Extensions;
using DemoApp.Core.IntegratorApi;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.Devices;

public static class CheckOnlineStatusEndpoint
{
    public static async Task<IResult> Handle([FromQuery] string[] deviceIds,
        [FromServices] IIntegratorApiClient apiClient)
    {
        var macs = deviceIds.Select(x => x.ParseMac()).ToArray();

        var onlineStatus = await apiClient.CheckStatus(macs);
        var isOnlineStatus = onlineStatus.Match(
            _ => [],
            result => result.ToDictionary(xy => xy.Mac, xy => xy.IsOnline));

        return Results.Ok(isOnlineStatus);
    }

}