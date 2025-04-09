using DemoApp.Core.DemoApp;
using DemoApp.Core.Extensions;
using dol.IoT.Models.Public.DeviceApi;
using dol.IoT.Models.Public.ManagementApi;
using OneOf;

namespace DemoApp.Core.IntegratorApi;

public interface IIntegratorApiClient
{
    Task<OneOf<ApiError, ClaimDeviceResponse>> ClaimDevice(ClaimRequest claimDeviceRequest, string userGroupId);

    Task<OneOf<ApiError, DeviceResponse>> GetDeviceInfo(string macAddress);
    Task<QueueConnectionInfoResponse?> QueueInfo();

    Task<string?> RemoveDeviceClaim(
        string macAddress);

    Task<OneOf<ApiError, Unit>> AddSensor(string macAddress,
        AddSensorRequest request);

    Task<OneOf<ApiError, string>> RemoveSensor(string macAddress, string devEui);

    Task<OneOf<ApiError, string>> UpdateSensor(string macAddress,
        UpdateSensorRequest request);

    Task<OneOf<ApiError, string>> UpdateWiredSensors(
        string macAddress,
        UpdateWiredSensorsRequest request);

    Task<OneOf<ApiError, DeviceOnlineWithIdResponse[]>> CheckStatus(
        string[] macAddresses);

    Task<OneOf<ApiError, string>> CalibrateCamera(string macAddress);
    Task<OneOf<ApiError, Stream>> GetImage(string macAddress);

    Task<OneOf<ApiError, Unit>> UpdateDevice(
        string macAddress,
        string deviceName);
}