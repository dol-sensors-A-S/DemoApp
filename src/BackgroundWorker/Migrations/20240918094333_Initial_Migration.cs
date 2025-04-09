using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BackgroundWorker.Migrations
{
    /// <inheritdoc />
    public partial class Initial_Migration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DataMessages",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(42)", maxLength: 42, nullable: false),
                    DeviceId = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: false),
                    SensorId = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    SensorName = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Unit = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Value = table.Column<decimal>(type: "numeric", nullable: false),
                    Timestamp = table.Column<long>(type: "bigint", nullable: false),
                    MeasurementTakenAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    WithinSpec = table.Column<bool>(type: "boolean", nullable: true),
                    Count = table.Column<int>(type: "integer", nullable: true),
                    MinWeight = table.Column<double>(type: "double precision", nullable: true),
                    MaxWeight = table.Column<double>(type: "double precision", nullable: true),
                    Timespan = table.Column<long>(type: "bigint", nullable: true),
                    Sd = table.Column<double>(type: "double precision", nullable: true),
                    Skewness = table.Column<double>(type: "double precision", nullable: true),
                    LastCycleCount = table.Column<int>(type: "integer", nullable: true),
                    CountDelta = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StatusMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeviceId = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: false),
                    Subject = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Content = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: false),
                    Timestamp = table.Column<long>(type: "bigint", nullable: false),
                    TimeUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StatusMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserGroups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Devices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MacAddress = table.Column<string>(type: "character varying(12)", maxLength: 12, nullable: false),
                    Name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Key = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    DeviceType = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    TimeClaimed = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TimeUpdated = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UserGroupId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Devices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Devices_UserGroups_UserGroupId",
                        column: x => x.UserGroupId,
                        principalTable: "UserGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Email = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    UserGroupId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_UserGroups_UserGroupId",
                        column: x => x.UserGroupId,
                        principalTable: "UserGroups",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Sensors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    DevEui = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    SensorType = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SampleRate = table.Column<int>(type: "integer", nullable: false),
                    TimeCreated = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TimeUpdated = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    DeviceId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sensors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sensors_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WiredSensors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Port = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SamplingRate = table.Column<int>(type: "integer", nullable: false),
                    DeviceId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WiredSensors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WiredSensors_Devices_DeviceId",
                        column: x => x.DeviceId,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DataMessages_DeviceId",
                table: "DataMessages",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_DataMessages_SensorId",
                table: "DataMessages",
                column: "SensorId");

            migrationBuilder.CreateIndex(
                name: "IX_DataMessages_Timestamp",
                table: "DataMessages",
                column: "Timestamp",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_Devices_MacAddress",
                table: "Devices",
                column: "MacAddress");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_UserGroupId",
                table: "Devices",
                column: "UserGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Sensors_DevEui",
                table: "Sensors",
                column: "DevEui");

            migrationBuilder.CreateIndex(
                name: "IX_Sensors_DeviceId",
                table: "Sensors",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_StatusMessages_DeviceId",
                table: "StatusMessages",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_StatusMessages_Timestamp",
                table: "StatusMessages",
                column: "Timestamp",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_Users_UserGroupId",
                table: "Users",
                column: "UserGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_WiredSensors_DeviceId",
                table: "WiredSensors",
                column: "DeviceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DataMessages");

            migrationBuilder.DropTable(
                name: "Sensors");

            migrationBuilder.DropTable(
                name: "StatusMessages");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "WiredSensors");

            migrationBuilder.DropTable(
                name: "Devices");

            migrationBuilder.DropTable(
                name: "UserGroups");
        }
    }
}
