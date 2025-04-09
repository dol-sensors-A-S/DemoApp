using System.ComponentModel.DataAnnotations;

namespace DemoApp.Core.Db.Models;

public class StatusMessage
{
    public int Id { get; set; }
    [MaxLength(12)] public string DeviceId { get; set; } = "";
    [MaxLength(32)] public string Subject { get; set; } = "";
    [MaxLength(4096)] public string Content { get; set; } = "";
    public long Timestamp { get; set; }
    public DateTimeOffset TimeUtc { get; set; }
}