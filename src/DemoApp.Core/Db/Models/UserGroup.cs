using System.ComponentModel.DataAnnotations;

namespace DemoApp.Core.Db.Models;

public class UserGroup
{
    public required Guid Id { get; set; }
    [MaxLength(50)] public required string Name { get; set; }
    public DateTimeOffset Created { get; set; }
    public ICollection<Device> Devices { get; set; } = [];
}