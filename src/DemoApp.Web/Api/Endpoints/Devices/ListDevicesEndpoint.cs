using DemoApp.Core.Db.Models;
using DemoApp.Core.IntegratorApi;
using DemoApp.Web.Devices;
using dol.IoT.Models.Public.DeviceApi;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.Devices;

public static class ListDevicesEndpoint
{
    public static async Task<IResult> Handle(
        [FromQuery] int? page,
        [FromServices] IIntegratorApiClient apiClient,
        [FromServices] IDeviceService deviceService)
    {
        var devices = await deviceService.GetDevices(page);

        return Results.Ok(devices.Select(DeviceListResponse.FromDevice));
    }

}

public class DeviceListResponse
{
    public static DeviceListResponse FromDevice(
        Device device)
    {
        var deviceListResponse = new DeviceListResponse
        {
            MacAddress = device.MacAddress,
            Name = device.Name,
            Key = device.Key,
            DeviceType = device.DeviceType,
        };

        return deviceListResponse;
    }

    public required string MacAddress { get; set; }
    public required string Name { get; set; }
    public required DeviceType DeviceType { get; set; }
    public required string Key { get; set; }
}