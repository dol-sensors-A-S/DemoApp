using System.Globalization;
using CsvHelper;
using DemoApp.Core.Db.Models;
using DemoApp.Web.Data;
using DemoApp.Web.Devices;
using dol.IoT.Models.Public.DeviceApi;
using Microsoft.AspNetCore.Mvc;

namespace DemoApp.Web.Api.Endpoints.DataMeasurements;

public static class ExportDataEndpoint
{
    public static async Task<IResult> Handle(
        [FromBody] ExportDataRequest request,
        [FromServices] IDeviceService deviceService,
        [FromServices] IDataService dataService)
    {
        request.EndTime ??= DateTimeOffset.UtcNow;
        if (request.StartTime > request.EndTime.Value)
            return Results.BadRequest("Start time must be before end time.");

        if (request.EndTime.Value.Subtract(request.StartTime) > TimeSpan.FromDays(31.5))
            return Results.BadRequest("Cannot export data for more than max 31 days");

        var devices = await deviceService.GetDevices(1, 200);

        if (devices.All(x => x.DeviceType != DeviceType.IDOL65))
        {
            return await GetSlimData(devices, request, dataService);
        }

        var ids = devices.Select(x => x.MacAddress).ToArray();
        var data = await dataService.GetMultipleDeviceData(ids, request.StartTime, request.EndTime!.Value);

        await using var stream = new MemoryStream();
        await using var writer = new StreamWriter(stream);
        await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        await csv.WriteRecordsAsync(data);
        await csv.FlushAsync();

        return Results.File(stream.ToArray(), "text/csv", $"data_{request.StartTime:yyyy-MM-dd}_{request.EndTime.GetValueOrDefault(DateTimeOffset.UtcNow.Date):yyyy-MM-dd}.csv");
    }

    private static async Task<IResult> GetSlimData(
        Device[] devices,
        ExportDataRequest request,
        IDataService dataService)
    {
        var data = await dataService.GetMultipleDeviceData(devices.Select(x => x.MacAddress).ToArray(), request.StartTime, request.EndTime!.Value);

        var allData = data
            .OrderBy(x => x.Timestamp)
            .Select(x => new SlimDataModel(x))
            .ToArray();
        
        await using var stream = new MemoryStream();
        await using var writer = new StreamWriter(stream);
        await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        await csv.WriteRecordsAsync(allData);
        await csv.FlushAsync();

        return Results.File(stream.ToArray(), "text/csv", $"data_{request.StartTime:yyyy-MM-dd}_{request.EndTime.GetValueOrDefault(DateTimeOffset.UtcNow.Date):yyyy-MM-dd}.csv");
    }
}

public class ExportDataRequest
{
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset? EndTime { get; set; }
}