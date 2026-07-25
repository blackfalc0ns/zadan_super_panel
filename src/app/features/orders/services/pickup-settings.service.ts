import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PlatformPickupSettings, UpsertPlatformPickupSettingsRequest } from '../models/pickup-settings.models';

interface PlatformPickupSettingsApiModel {
  delivery_option_enabled?: boolean;
  pickup_option_enabled?: boolean;
  pickup_cash_on_pickup_enabled?: boolean;
  pickup_commission_percent?: number;
  pickup_no_show_timeout_hours?: number;
  pickup_otp_max_attempts?: number;
  pickup_otp_lockout_minutes?: number;
  updated_at_utc?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PickupSettingsService {
  private readonly apiUrl = `${environment.apiUrl}/admin/orders/pickup-settings`;

  constructor(private readonly http: HttpClient) {}

  getSettings(): Observable<PlatformPickupSettings> {
    return this.http.get<PlatformPickupSettingsApiModel>(this.apiUrl).pipe(
      map((response) => this.mapSettings(response))
    );
  }

  updateSettings(request: UpsertPlatformPickupSettingsRequest): Observable<PlatformPickupSettings> {
    return this.http.put<PlatformPickupSettingsApiModel>(this.apiUrl, {
      delivery_option_enabled: request.deliveryOptionEnabled,
      pickup_option_enabled: request.pickupOptionEnabled,
      pickup_cash_on_pickup_enabled: request.pickupCashOnPickupEnabled,
      pickup_commission_percent: request.pickupCommissionPercent,
      pickup_no_show_timeout_hours: request.pickupNoShowTimeoutHours,
      pickup_otp_max_attempts: request.pickupOtpMaxAttempts,
      pickup_otp_lockout_minutes: request.pickupOtpLockoutMinutes
    }).pipe(
      map((response) => this.mapSettings(response))
    );
  }

  private mapSettings(raw: PlatformPickupSettingsApiModel): PlatformPickupSettings {
    return {
      deliveryOptionEnabled: Boolean(raw.delivery_option_enabled ?? true),
      pickupOptionEnabled: Boolean(raw.pickup_option_enabled ?? true),
      pickupCashOnPickupEnabled: Boolean(raw.pickup_cash_on_pickup_enabled ?? false),
      pickupCommissionPercent: Number(raw.pickup_commission_percent ?? 0),
      pickupNoShowTimeoutHours: Number(raw.pickup_no_show_timeout_hours ?? 24),
      pickupOtpMaxAttempts: Number(raw.pickup_otp_max_attempts ?? 5),
      pickupOtpLockoutMinutes: Number(raw.pickup_otp_lockout_minutes ?? 30),
      updatedAtUtc: raw.updated_at_utc ?? null
    };
  }
}
