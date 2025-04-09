using DemoApp.Core.Extensions;
using DemoApp.Core.IntegratorApi;
using DemoApp.Web.Devices;
using dol.IoT.Models.Public.DeviceApi;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.Devices;

public static class CalibrateCameraEndpoint
{
    public static async Task<IResult> Handle(
        [FromRoute] string macAddress,
        [FromServices] IDeviceService deviceService,
        [FromServices] IIntegratorApiClient apiClient)
    {
        macAddress = macAddress.ParseMac();

        var device = await deviceService.GetDevice(macAddress);
        if (device is null)
            return Results.NotFound($"You do not have a claim on device with mac {macAddress}");
        if (device.DeviceType != DeviceType.IDOL65)
            return Results.BadRequest("Only IDOL65 devices can be calibrated");

        var result = await apiClient.CalibrateCamera(macAddress);

        return result.Match(
            err => Results.BadRequest(err.Message),
            Results.Ok);
    }
}