using DemoApp.Core.Db.Models;
using DemoApp.Core.DemoApp;
using dol.IoT.Models.Public.DeviceApi;

namespace DemoApp.Web.Devices;

public interface IDeviceService
{
    Task<bool> DeviceExists(
        string macAddress);

    Task<Device?> GetDevice(
        string macAddress);

    Task CreateDevice(
        string macAddress,
        string key,
        DeviceType deviceType,
        string deviceName);

    Task<Device[]> GetDevices(
        int? page,
        int? pageSize = null);

    Task RemoveDevice(Device device);

    Task UpdateDevice(
        Device device);
}