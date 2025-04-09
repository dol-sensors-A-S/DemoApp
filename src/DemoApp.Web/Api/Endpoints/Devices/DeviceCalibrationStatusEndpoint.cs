using DemoApp.Core.Extensions;
using DemoApp.Web.Data;
using DemoApp.Web.Devices;
using dol.IoT.Models.Public.DeviceApi;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.Devices;

public static class DeviceCalibrationStatusEndpoint
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

        if (device.DeviceType != DeviceType.IDOL65)
            return Results.Ok(new VisionStatusMessageResponse[] { });

        var visionStatusMessageResponses = await statusMessageService.GetVisionStatusMessages(macAddress, DateTimeOffset.UtcNow.AddDays(-7));
        var statusMessageResponses = visionStatusMessageResponses
            .OrderBy(x => x.Timestamp)
                .ThenBy(x => string.IsNullOrWhiteSpace(x.VisionStatus.Calibration) ? 0 : 1)
            .TakeLast(10)
            .SkipWhile(SkipWhileNotStarted)
            .ToArray();

        var lastTimestamp = statusMessageResponses.Select(x => x.Timestamp).LastOrDefault(0);
        statusMessageResponses = statusMessageResponses
            .Where(x => x.Timestamp > lastTimestamp - 600)
            .ToArray();

        return Results.Ok(statusMessageResponses);
    }

    private static bool SkipWhileNotStarted(VisionStatusMessageResponse x)
    {
        var isNotStarted = !"Started".Equals(x.VisionStatus.Calibration, StringComparison.OrdinalIgnoreCase);
        var isNotStarting = !(x.VisionStatus.CalibrationUpdate is not null && x.VisionStatus.CalibrationUpdate.StartsWith("Starting"));
        return isNotStarted && isNotStarting;
    }
}