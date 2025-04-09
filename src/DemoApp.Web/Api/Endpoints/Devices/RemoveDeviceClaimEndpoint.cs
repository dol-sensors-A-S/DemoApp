using DemoApp.Core.Extensions;
using DemoApp.Core.IntegratorApi;
using DemoApp.Web.Devices;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.Devices;

public static class RemoveDeviceClaimEndpoint
{
    public static async Task<IResult> Handle([FromRoute] string macAddress,
        [FromServices] IDeviceService deviceService,
        [FromServices] IIntegratorApiClient apiClient)
    {
        macAddress = macAddress.ParseMac();

        var device = await deviceService.GetDevice(macAddress);
        if (device is null)
            return Results.Accepted($"No claim on device {macAddress} found");

        var resp = await apiClient.GetDeviceInfo(macAddress);
        if (resp.IsT1)
        {
            var removeResponse = await apiClient.RemoveDeviceClaim(macAddress);
            if (removeResponse is not null)
            {
                await deviceService.RemoveDevice(device);
                return Results.Ok("Device claim removed");
            }
        }

        return Results.BadRequest($"Device claim with mac {macAddress} not found");
    }
}