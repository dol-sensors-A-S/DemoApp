namespace DemoApp.Core.QueueModels;


public record StatusMessageBase(string DeviceId, long Timestamp);
//
// public record DeviceConnectionChanged(string DeviceId, string State, long Timestamp) : StatusMessageBase(DeviceId, Timestamp);
//
// public record VisionStatusMessage(string DeviceId, VisionStatus VisionStatus, long Timestamp) : StatusMessageBase(DeviceId, Timestamp);
// public record VisionStatus(string? IsDirty, string? IsDeviceManuallyCalibrated, string? Calibration,
//     string? IsDetectingDirty, string? CalibrationLastUpdate, string? CalibrationUpdate, VisionMessage[] Messages,
//     string? LastWeightCacheClearCount, string? LastWeightCacheClearedUpdate);
// public record VisionMessage(int MessageId, string MessageText, string MessagePayload);
//
// public record SensorInactive(string DeviceId, InactiveSensor[] InactiveSensors, long Timestamp) : StatusMessageBase(DeviceId, Timestamp);
// public record InactiveSensor(string Name, string DevEui, string LastSeenAt);
//
// public record SensorBatteryUpdates(string DeviceId, long Timestamp, BatteryUpdate[] BatteryUpdates) : StatusMessageBase(DeviceId, Timestamp);
// public record BatteryUpdate(string DevEui, int Code, string BatteryStatus);
