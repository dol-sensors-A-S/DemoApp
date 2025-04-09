using DemoApp.Core.Extensions;
using DemoApp.Core.IntegratorApi;
using DemoApp.Web.Devices;
using DemoApp.Web.IntegrationApi;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.Sensors;

public static class RemoveSensorEndpoint
{
    public static async Task<IResult> Handle(
        [FromRoute] string macAddress,
        [FromRoute] string devEui,
        [FromServices] IDeviceService deviceService,
        [FromServices] IIntegratorApiClient apiClient)
    {
        macAddress = macAddress.ParseMac();
        devEui = devEui.ParseDevEui();

        var device = await deviceService.GetDevice(macAddress);

        if (device is null)
        {
            return Results.BadRequest($"Device {macAddress} not found");
        }

        var response = await apiClient.RemoveSensor(macAddress, devEui);
        return await response.Match(
            error => error.AsResult(),
            success => Task.FromResult(Results.Ok(success)));
    }
}