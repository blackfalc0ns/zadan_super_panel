export interface PlatformPickupSettings {
  deliveryOptionEnabled: boolean;
  pickupOptionEnabled: boolean;
  pickupCashOnPickupEnabled: boolean;
  pickupCommissionPercent: number;
  pickupNoShowTimeoutHours: number;
  pickupOtpMaxAttempts: number;
  pickupOtpLockoutMinutes: number;
  updatedAtUtc?: string | null;
}

export interface UpsertPlatformPickupSettingsRequest {
  deliveryOptionEnabled: boolean;
  pickupOptionEnabled: boolean;
  pickupCashOnPickupEnabled: boolean;
  pickupCommissionPercent: number;
  pickupNoShowTimeoutHours: number;
  pickupOtpMaxAttempts: number;
  pickupOtpLockoutMinutes: number;
}
