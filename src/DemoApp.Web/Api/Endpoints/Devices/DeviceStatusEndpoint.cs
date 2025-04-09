using DemoApp.Core.Extensions;
using DemoApp.Web.Data;
using DemoApp.Web.Devices;
using dol.IoT.Models.Public.DeviceApi;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.Devices;

public static class DeviceStatusEndpoint
{
    public static async Task<IResult> Handle(
        [FromRoute] string macAddress,
        [FromServices] IStatusMessageService statusMessageService,
        [FromServices] IDeviceService deviceService)
    {
        macAddress = macAddress.ParseMac();

        var device = await deviceService.GetDevice(macAddress);

        if (device is null)
            return Results.BadRequest($"You have not claimed device with mac {macAddress}");

        var resp = new DeviceStatusResponse();
        var dateTimeOffset = DateTimeOffset.UtcNow.AddDays(-14);
        if (device.DeviceType == DeviceType.IDOL65)
        {
            var visionStatusMessageResponses = await statusMessageService.GetVisionStatusMessages(macAddress, dateTimeOffset);
            resp.VisionStatus = visionStatusMessageResponses.FirstOrDefault();
        }

        if (device.DeviceType == DeviceType.IDOL64)
        {
            var sensorsInactiveMessage = await statusMessageService.GetLastSensorsInactiveMessage(macAddress);
            resp.SensorsInactive = sensorsInactiveMessage;
            var sensorBatteryResponses = await statusMessageService.GetSensorBatteryMessages(macAddress, dateTimeOffset);
            resp.SensorBattery = sensorBatteryResponses.FirstOrDefault();
        }

        var deviceConnectionChangedResponses = await statusMessageService.GetConnectionStatusMessages(macAddress, dateTimeOffset);
        resp.DeviceConnectionChanges = deviceConnectionChangedResponses.FirstOrDefault();

        return Results.Ok(resp);
    }
}

public class DeviceStatusResponse
{
    public SensorBatteryResponse? SensorBattery { get; set; }
    public DeviceConnectionChangedResponse? DeviceConnectionChanges { get; set; }
    public SensorInactiveResponse? SensorsInactive { get; set; }
    public VisionStatusMessageResponse? VisionStatus { get; set; }
}