﻿// <auto-generated />
using System;
using DemoApp.Core.Db;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BackgroundWorker.Migrations
{
    [DbContext(typeof(DemoAppDbContext))]
    partial class DemoAppDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("DemoApp.Core.Db.Models.Data", b =>
                {
                    b.Property<string>("Id")
                        .HasMaxLength(42)
                        .HasColumnType("character varying(42)");

                    b.Property<int?>("Count")
                        .HasColumnType("integer");

                    b.Property<int?>("CountDelta")
                        .HasColumnType("integer");

                    b.Property<string>("DeviceId")
                        .IsRequired()
                        .HasMaxLength(12)
                        .HasColumnType("character varying(12)");

                    b.Property<int?>("LastCycleCount")
                        .HasColumnType("integer");

                    b.Property<double?>("MaxWeight")
                        .HasColumnType("double precision");

                    b.Property<DateTimeOffset>("MeasurementTakenAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<double?>("MinWeight")
                        .HasColumnType("double precision");

                    b.Property<double?>("Sd")
                        .HasColumnType("double precision");

                    b.Property<string>("SensorId")
                        .IsRequired()
                        .HasMaxLength(32)
                        .HasColumnType("character varying(32)");

                    b.Property<string>("SensorName")
                        .IsRequired()
                        .HasMaxLength(64)
                        .HasColumnType("character varying(64)");

                    b.Property<double?>("Skewness")
                        .HasColumnType("double precision");

                    b.Property<long?>("Timespan")
                        .HasColumnType("bigint");

                    b.Property<long>("Timestamp")
                        .HasColumnType("bigint");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasMaxLength(32)
                        .HasColumnType("character varying(32)");

                    b.Property<string>("Unit")
                        .IsRequired()
                        .HasMaxLength(32)
                        .HasColumnType("character varying(32)");

                    b.Property<decimal>("Value")
                        .HasColumnType("numeric");

                    b.Property<bool?>("WithinSpec")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.HasIndex("DeviceId");

                    b.HasIndex("SensorId");

                    b.HasIndex("Timestamp")
                        .IsDescending();

                    b.ToTable("DataMessages");
                });

            modelBuilder.Entity("DemoApp.Core.Db.Models.Device", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("DeviceType")
                        .IsRequired()
                        .HasMaxLength(64)
                        .HasColumnType("character varying(64)");

                    b.Property<string>("Key")
                        .IsRequired()
                        .HasMaxLength(10)
                        .HasColumnType("character varying(10)");

                    b.Property<string>("MacAddress")
                        .IsRequired()
                        .HasMaxLength(12)
                        .HasColumnType("character varying(12)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(64)
                        .HasColumnType("character varying(64)");

                    b.Property<DateTimeOffset>("TimeClaimed")
                        .HasColumnType("timestamp with time zone");

                    b.Property<DateTimeOffset>("TimeUpdated")
                        .HasColumnType("timestamp with time zone");

                    b.Property<Guid>("UserGroupId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("MacAddress");

                    b.HasIndex("UserGroupId");

                    b.ToTable("Devices");
                });

            modelBuilder.Entity("DemoApp.Core.Db.Models.StatusMessage", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Content")
                        .IsRequired()
                        .HasMaxLength(4096)
                        .HasColumnType("character varying(4096)");

                    b.Property<string>("DeviceId")
                        .IsRequired()
                        .HasMaxLength(12)
                        .HasColumnType("character varying(12)");

                    b.Property<string>("Subject")
                        .IsRequired()
                        .HasMaxLength(32)
                        .HasColumnType("character varying(32)");

                    b.Property<DateTimeOffset>("TimeUtc")
                        .HasColumnType("timestamp with time zone");

                    b.Property<long>("Timestamp")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("DeviceId");

                    b.HasIndex("Timestamp")
                        .IsDescending();

                    b.ToTable("StatusMessages");
                });

            modelBuilder.Entity("DemoApp.Core.Db.Models.User", b =>
                {
                    b.Property<string>("Id")
                        .HasMaxLength(64)
                        .HasColumnType("character varying(64)");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(128)
                        .HasColumnType("character varying(128)");

                    b.Property<Guid?>("UserGroupId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("UserGroupId");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("DemoApp.Core.Db.Models.UserGroup", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTimeOffset>("Created")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)");

                    b.HasKey("Id");

                    b.ToTable("UserGroups");
                });

            modelBuilder.Entity("DemoApp.Core.Db.Models.Device", b =>
                {
                    b.HasOne("DemoApp.Core.Db.Models.UserGroup", null)
                        .WithMany("Devices")
                        .HasForeignKey("UserGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("DemoApp.Core.Db.Models.User", b =>
                {
                    b.HasOne("DemoApp.Core.Db.Models.UserGroup", "UserGroup")
                        .WithMany()
                        .HasForeignKey("UserGroupId");

                    b.Navigation("UserGroup");
                });

            modelBuilder.Entity("DemoApp.Core.Db.Models.UserGroup", b =>
                {
                    b.Navigation("Devices");
                });
#pragma warning restore 612, 618
        }
    }
}
