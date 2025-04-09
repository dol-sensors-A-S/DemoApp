using System.ComponentModel.DataAnnotations;

namespace DemoApp.Core.Db.Models;

public class User
{
    [MaxLength(64)] public required string Id { get; set; }
    [MaxLength(128)] public required string Email { get; set; }
    public Guid? UserGroupId { get; set; }
    public UserGroup? UserGroup { get; set; }
}