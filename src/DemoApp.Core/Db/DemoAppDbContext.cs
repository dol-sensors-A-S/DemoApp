using DemoApp.Core.Db.Models;
using Microsoft.EntityFrameworkCore;

namespace DemoApp.Core.Db;

public class DemoAppDbContext(DbContextOptions<DemoAppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<UserGroup> UserGroups { get; set; }
    public DbSet<Device> Devices { get; set; }
    public DbSet<Data> DataMessages { get; set; }
    public DbSet<StatusMessage> StatusMessages { get; set; }

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasKey(x => x.Id);
        modelBuilder.Entity<UserGroup>()
            .HasKey(x => x.Id);

        modelBuilder.Entity<Device>()
            .HasKey(x => x.Id);
        modelBuilder.Entity<Device>()
            .Property(x => x.DeviceType)
            .HasConversion<string>();
        modelBuilder.Entity<Device>()
            .HasIndex(x => x.MacAddress);

        modelBuilder.Entity<Data>()
            .HasKey(x => x.Id);
        modelBuilder.Entity<Data>()
            .HasIndex(x => x.DeviceId);
        modelBuilder.Entity<Data>()
            .HasIndex(x => x.SensorId);
        modelBuilder.Entity<Data>()
            .HasIndex(x => x.Timestamp)
            .IsDescending();

        modelBuilder.Entity<StatusMessage>()
            .HasKey(x => x.Id);
        modelBuilder.Entity<StatusMessage>()
            .HasIndex(x => x.DeviceId);
        modelBuilder.Entity<StatusMessage>()
            .HasIndex(x => x.Timestamp)
            .IsDescending();
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
    }
}