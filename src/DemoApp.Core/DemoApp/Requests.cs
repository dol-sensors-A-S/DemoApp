using dol.IoT.Models.Public.DeviceApi;

namespace DemoApp.Core.DemoApp;

public record ClaimRequest(DeviceType DeviceType, string Key, string MacAddress, string DeviceName);
public record UpdateDeviceRequest(string DeviceName);
public record AddSensorRequest(string DevEui, string Name, SensorType SensorType, int SampleRate);

public record UpdateSensorRequest(string DevEui, string? Name, int? SampleRate);