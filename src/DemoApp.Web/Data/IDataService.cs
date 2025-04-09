namespace DemoApp.Web.Data;

public interface IDataService
{
    Task<Core.Db.Models.Data[]> GetMultipleDeviceData(
        string[] ids,
        DateTimeOffset from,
        DateTimeOffset? to);
    
    Task<Core.Db.Models.Data[]> GetDeviceData(
        string mac,
        DateTimeOffset from,
        DateTimeOffset? to);

    Task<Core.Db.Models.Data[]> GetSensorData(
        string mac,
        string devEui,
        DateTimeOffset from,
        DateTimeOffset? to);
}