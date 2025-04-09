using DemoApp.Core.Db;
using DemoApp.Web.Devices;
using Microsoft.EntityFrameworkCore;

namespace DemoApp.Web.Data;

public class DataService(IDeviceService deviceService, DemoAppDbContext dbContext) : IDataService
{
    public async Task<Core.Db.Models.Data[]> GetMultipleDeviceData(
        string[] ids,
        DateTimeOffset from,
        DateTimeOffset? to)
    {
        var devices = await deviceService.GetDevices(1, 200);
        var deviceIds = ids.Intersect(devices.Select(x => x.MacAddress)).ToArray();
        DateTimeOffset toDate = (to ?? DateTimeOffset.UtcNow);

        return await dbContext.DataMessages
            .AsNoTracking()
            .TagWith("GetMultipleDeviceData")
            .Where(x => deviceIds.Contains(x.DeviceId))
            .Where(x => x.MeasurementTakenAt >= from && x.MeasurementTakenAt <= toDate)
            .OrderBy(x => x.MeasurementTakenAt)
            .ToArrayAsync();
    }

    public async Task<Core.Db.Models.Data[]> GetDeviceData(
        string mac,
        DateTimeOffset from,
        DateTimeOffset? to)
    {
        var device = await deviceService.GetDevice(mac);
        if (device is null)
            return [];

        DateTimeOffset toDate = (to ?? DateTimeOffset.UtcNow);

        return await dbContext.DataMessages
            .AsNoTracking()
            .Where(x => x.DeviceId == mac)
            .Where(x => x.MeasurementTakenAt >= from && x.MeasurementTakenAt <= toDate)
            .OrderBy(x => x.MeasurementTakenAt)
            .ToArrayAsync();
    }

    public async Task<Core.Db.Models.Data[]> GetSensorData(
        string mac,
        string devEui,
        DateTimeOffset from,
        DateTimeOffset? to)
    {
        var device = await deviceService.GetDevice(mac);
        if (device is null)
            return [];

        DateTimeOffset toValue = to ?? DateTimeOffset.UtcNow;

        return await dbContext.DataMessages
            .AsNoTracking()
            .Where(x => x.DeviceId == mac)
            .Where(x => x.MeasurementTakenAt >= from && x.MeasurementTakenAt <= toValue)
            .Where(x => x.SensorId == devEui)
            .OrderBy(x => x.MeasurementTakenAt)
            .ToArrayAsync();
    }
}