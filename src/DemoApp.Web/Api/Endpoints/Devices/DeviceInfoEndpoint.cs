using DemoApp.Core.Extensions;
using DemoApp.Core.IntegratorApi;
using DemoApp.Web.Devices;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.Devices;

public static class DeviceInfoEndpoint
{
    public static async Task<IResult> Handle([FromRoute] string macAddress,
        [FromServices] IDeviceService deviceService,
        [FromServices] IIntegratorApiClient apiClient)
    {
        macAddress = macAddress.ParseMac();

        var device = await deviceService.GetDevice(macAddress);
        if (device is null)
            return Results.NotFound($"You have no claim on device with mac address {macAddress}");

        var resp = await apiClient.GetDeviceInfo(macAddress);
        return resp.Match(Results.BadRequest, Results.Ok);
    }
}