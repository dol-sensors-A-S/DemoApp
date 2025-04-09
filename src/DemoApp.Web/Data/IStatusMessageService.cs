namespace DemoApp.Web.Data;

public interface IStatusMessageService
{
    Task<DeviceConnectionChangedResponse[]> GetConnectionStatusMessages(string deviceId, DateTimeOffset startTime, DateTimeOffset? endTime = null);
    Task<SensorInactiveResponse?> GetLastSensorsInactiveMessage(string deviceId);
    Task<VisionStatusMessageResponse[]> GetVisionStatusMessages(string deviceId, DateTimeOffset startTime, DateTimeOffset? endTime = null);
    Task<SensorBatteryResponse[]> GetSensorBatteryMessages(string deviceId, DateTimeOffset startTime, DateTimeOffset? endTime = null);
}