using System.Globalization;
using CsvHelper;
using DemoApp.Core.Extensions;
using DemoApp.Web.Data;
using DemoApp.Web.Devices;
using dol.IoT.Models.Public.DeviceApi;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.DataMeasurements;

public static class ExportDeviceDataEndpoint
{
    public static async Task<IResult> Handle(
        [FromRoute] string macAddress,
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

        var deviceData = await dataService.GetDeviceData(device.MacAddress, request.StartTime, request.EndTime.Value);
        if (device.DeviceType == DeviceType.IDOL65)
            return await Idol65Data(deviceData, macAddress);

        var slimDeviceData = deviceData.Select(x => new SlimDataModel(x));

        await using var stream = new MemoryStream();
        await using var writer = new StreamWriter(stream);
        await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        await csv.WriteRecordsAsync(slimDeviceData);
        await csv.FlushAsync();

        var fileContent = stream.ToArray();
        return Results.File(fileContent, "text/csv", $"data_{macAddress}_{request.StartTime:yyyy-MM-dd}_{request.EndTime.GetValueOrDefault(DateTimeOffset.UtcNow.Date):yyyy-MM-dd}.csv");
    }

    private static async Task<IResult> Idol65Data(Core.Db.Models.Data[] deviceData, string macAddress)
    {
        await using var stream = new MemoryStream();
        await using var writer = new StreamWriter(stream);
        await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        await csv.WriteRecordsAsync(deviceData);
        await csv.FlushAsync();

        var fileContent = stream.ToArray();
        return Results.File(fileContent, "text/csv", $"data-{macAddress}.csv");
    }
}

public class SlimDataModel(Core.Db.Models.Data data)
{
    public string Id { get; set; } = data.Id;
    public string DeviceId { get; set; } = data.DeviceId;
    public string SensorId { get; set; } = data.SensorId;
    public string SensorName { get; set; } = data.SensorName;
    public DateTimeOffset MeasurementTakenAt { get; set; } = data.MeasurementTakenAt;
    public string Type { get; set; } = data.Type;
    public decimal Value { get; set; } = data.Value;
    public string Unit { get; set; } = data.Unit;
    public long Timestamp { get; set; } = data.Timestamp;
}