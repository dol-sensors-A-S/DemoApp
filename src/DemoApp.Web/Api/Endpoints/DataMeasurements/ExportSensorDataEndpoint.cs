using System.Globalization;
using CsvHelper;
using DemoApp.Core.Extensions;
using DemoApp.Web.Data;
using DemoApp.Web.Devices;
using dol.IoT.Models.Public.DeviceApi;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.DataMeasurements;

public static class ExportSensorDataEndpoint
{
    public static async Task<IResult> Handle(
        [FromRoute] string macAddress,
        [FromRoute] string devEui,
        [FromBody] ExportDataRequest request,
        [FromServices] IDeviceService deviceService,
        [FromServices] IDataService dataService)
    {
        macAddress = macAddress.ParseMac();
        request.EndTime ??= DateTimeOffset.UtcNow;
        
        if (request.StartTime > request.EndTime.Value)
            return Results.BadRequest("Start time must be before end time.");

        if (request.EndTime.Value.Subtract(request.StartTime) > TimeSpan.FromDays(31.5))
            return Results.BadRequest("Cannot export data for more than max 31 days");

        var device = await deviceService.GetDevice(macAddress);
        if (device is null)
            return Results.BadRequest("You have no claim on device");
        if (device.DeviceType != DeviceType.IDOL64)
            return Results.BadRequest("Can only get sensor data for an IDOL64");
        
        var deviceData = await dataService.GetSensorData(device.MacAddress, devEui, request.StartTime, request.EndTime.Value);
        var slimDeviceData = deviceData.Select(x => new SlimDataModel(x));

        await using var stream = new MemoryStream();
        await using var writer = new StreamWriter(stream);
        await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        await csv.WriteRecordsAsync(slimDeviceData);
        await csv.FlushAsync();

        var fileContent = stream.ToArray();
        return Results.File(fileContent, "text/csv", $"data_{macAddress}_{devEui}_{request.StartTime:yyyy-MM-dd}_{request.EndTime.GetValueOrDefault(DateTimeOffset.UtcNow.Date):yyyy-MM-dd}.csv");
    }
}