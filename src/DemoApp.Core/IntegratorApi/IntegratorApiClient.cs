using System.Net;
using System.Net.Http.Json;
using DemoApp.Core.DemoApp;
using DemoApp.Core.Extensions;
using dol.IoT.Models.Public.DeviceApi;
using dol.IoT.Models.Public.ManagementApi;
using OneOf;

namespace DemoApp.Core.IntegratorApi;

public class IntegratorApiClient(HttpClient httpClient) : IIntegratorApiClient
{
    public async Task<OneOf<ApiError, ClaimDeviceResponse>> ClaimDevice(
        ClaimRequest req, string userGroupId)
    {
        var request = new ClaimDeviceRequest(req.MacAddress, req.Key, req.DeviceType, userGroupId, req.DeviceName);
        var response = await httpClient.PostAsJsonAsync("/api/devices/claim", request);
        if (response.StatusCode == HttpStatusCode.OK)
            return (await response.Content.ReadFromJsonAsync<ClaimDeviceResponse>())!;

        return new ApiError(await response.Content.ReadAsStringAsync());
    }

    public async Task<OneOf<ApiError, DeviceResponse>> GetDeviceInfo(
        string macAddress)
    {
        var response = await httpClient.GetAsync($"/api/devices/{macAddress}");
        if (response.StatusCode != HttpStatusCode.OK)
            return new ApiError("Device not found");

        return (await response.Content.ReadFromJsonAsync<DeviceResponse>())!;
    }

    public async Task<string?> RemoveDeviceClaim(
        string macAddress)
    {
        var resp = await httpClient.DeleteAsync($"/api/devices/claim/{macAddress}");
        if (resp.StatusCode == HttpStatusCode.OK)
            return await resp.Content.ReadAsStringAsync();

        return null;
    }

    public async Task<OneOf<ApiError, Unit>> AddSensor(
        string macAddress,
        AddSensorRequest request)
    {
        var req = new AddSensorToDeviceRequest(request.DevEui, request.Name, request.SensorType, request.SampleRate);

        var response = await httpClient.PostAsJsonAsync($"/api/devices/{macAddress}/sensor", req);
        if (response.StatusCode == HttpStatusCode.OK)
        {
            return Unit.Value;
        }

        return new ApiError(await response.Content.ReadAsStringAsync());
    }

    public async Task<OneOf<ApiError, string>> RemoveSensor(
        string macAddress,
        string devEui)
    {
        var result = await httpClient.DeleteAsync($"/api/devices/{macAddress}/sensor/{devEui}");
        if (result.StatusCode == HttpStatusCode.OK)
            return $"sensor {devEui} was removed from device {macAddress}";

        return new ApiError(await result.Content.ReadAsStringAsync());
    }

    public async Task<OneOf<ApiError, string>> UpdateSensor(
        string macAddress,
        UpdateSensorRequest request)
    {
        var req = new UpdateSensorToDeviceRequest(request.DevEui, request.Name, request.SampleRate);

        var result = await httpClient.PutAsJsonAsync($"/api/devices/{macAddress}/sensor", req);
        if (result.StatusCode == HttpStatusCode.OK)
            return $"sensor {request.DevEui} was updated";

        return new ApiError(await result.Content.ReadAsStringAsync());
    }

    public async Task<OneOf<ApiError, string>> UpdateWiredSensors(
        string macAddress,
        UpdateWiredSensorsRequest request)
    {
        var wiredSensorRequests = request.Sensors
            .Select(x => new WiredSensorRequest(x.Port, x.WiredSensorType, x.SamplingRate))
            .ToArray();

        var req = new UpdateWiredSensorsRequest(wiredSensorRequests);

        var response = await httpClient.PutAsJsonAsync($"/api/devices/{macAddress}/wiredSensor", req);
        if (response.StatusCode == HttpStatusCode.OK)
            return "wired sensors configured";

        return new ApiError(await response.Content.ReadAsStringAsync());
    }

    public async Task<OneOf<ApiError, DeviceOnlineWithIdResponse[]>> CheckStatus(
        string[] macAddresses)
    {
        if (macAddresses.Length == 0)
            return Array.Empty<DeviceOnlineWithIdResponse>();

        var deviceIdPath = string.Join("&mac=", macAddresses);
        try
        {
            var response = await httpClient.GetFromJsonAsync<DeviceOnlineWithIdResponse[]>($"/api/devices/online?mac={deviceIdPath}");
            if (response is not null)
                return response;
        }
        catch (Exception)
        {
            return new ApiError("failed response");
        }

        return new ApiError("Failed response");
    }

    public async Task<QueueConnectionInfoResponse?> QueueInfo()
    {
        var response = await httpClient.GetFromJsonAsync<QueueConnectionInfoResponse>("/api/management/queue");
        return response;
    }

    public async Task<OneOf<ApiError, string>> CalibrateCamera(string macAddress)
    {
        var response = await httpClient.PostAsync($"/api/devices/{macAddress}/calibrate", null);
        if (response.StatusCode == HttpStatusCode.OK)
            return await response.Content.ReadAsStringAsync();

        return new ApiError("failed calibration of device");
    }

    public async Task<OneOf<ApiError, Stream>> GetImage(string macAddress)
    {
        var response = await httpClient.PostAsync($"/api/devices/{macAddress}/getImage", null);
        if (response.StatusCode == HttpStatusCode.OK)
            return await response.Content.ReadAsStreamAsync();

        return new ApiError(await response.Content.ReadAsStringAsync());
    }

    public async Task<OneOf<ApiError, Unit>> UpdateDevice(
        string macAddress,
        string deviceName)
    {
        var response = await httpClient.PutAsJsonAsync("/api/devices/claim", new EditClaimDeviceRequest(macAddress, Owner: null, DeviceName: deviceName));
        if (response.StatusCode == HttpStatusCode.OK)
            return Unit.Value;

        return new ApiError($"Failed to update device claim: {await response.Content.ReadAsStringAsync()}");
    }
}