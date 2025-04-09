using DemoApp.Core.Db;
using DemoApp.Core.Db.Models;
using DemoApp.Core.DemoApp;
using DemoApp.Web.Auth;
using dol.IoT.Models.Public.DeviceApi;
using Microsoft.EntityFrameworkCore;

namespace DemoApp.Web.Devices;

public class DeviceService(IUserService userService, DemoAppDbContext dbContext) : IDeviceService
{
    public async Task<bool> DeviceExists(
        string macAddress)
    {
        return await dbContext.Devices
            .AnyAsync(x => x.MacAddress == macAddress);
    }

    public async Task<Device?> GetDevice(
        string macAddress)
    {
        var user = await userService.GetUser();
        var device = await dbContext.Devices
            .FirstOrDefaultAsync(x => x.MacAddress == macAddress && x.UserGroupId == user.UserGroupId);

        return device;
    }


    public async Task CreateDevice(
        string macAddress,
        string key,
        DeviceType deviceType,
        string deviceName)
    {
        var user = await userService.GetUser();
        var device = new Device
        {
            Id = Ulid.NewUlid().ToGuid(),
            MacAddress = macAddress,
            DeviceType = deviceType,
            Key = key,
            Name = deviceName,
            UserGroupId = user.UserGroupId!.Value,
            TimeClaimed = DateTimeOffset.UtcNow,
            TimeUpdated = DateTimeOffset.UtcNow,
        };

        dbContext.Devices.Add(device);
        await dbContext.SaveChangesAsync();
    }

    public async Task<Device[]> GetDevices(int? page, int? pageSize = null)
    {
        var user = await userService.GetUser();
        pageSize ??= 10;

        var devicesToSkip = page is null or <= 1
            ? 0
            : page.Value * pageSize.Value;

        var devices = await dbContext.Devices
            .AsNoTracking()
            .Where(x => x.UserGroupId == user.UserGroupId)
            .OrderBy(x => x.Id)
            .Skip(devicesToSkip)
            .Take(pageSize.Value)
            .ToArrayAsync();

        return devices;
    }

    public async Task RemoveDevice(
        Device device)
    {
        dbContext.Devices.Remove(device);
        await dbContext.SaveChangesAsync();
    }

    public async Task UpdateDevice(Device device)
    {
        dbContext.Devices.Attach(device);
        await dbContext.SaveChangesAsync();
    }
}