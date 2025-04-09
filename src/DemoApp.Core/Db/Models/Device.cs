using System.ComponentModel.DataAnnotations;
using dol.IoT.Models.Public.DeviceApi;

namespace DemoApp.Core.Db.Models;

public class Device
{
    public required Guid Id { get; set; }
    [MaxLength(12)] public required string MacAddress { get; set; }
    [MaxLength(64)] public required string Name { get; set; }
    [MaxLength(10)] public required string Key { get; set; }
    [MaxLength(64)] public required DeviceType DeviceType { get; set; }
    public required DateTimeOffset TimeClaimed { get; set; }
    public required DateTimeOffset TimeUpdated { get; set; }
    public required Guid UserGroupId { get; set; }
}