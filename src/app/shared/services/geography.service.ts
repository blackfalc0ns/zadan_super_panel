import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';
import { describeApiError } from '../utils/api-error.util';

export interface SaudiRegionDto {
  code: string;
  nameAr: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  mapZoom: number;
  sortOrder: number;
  isOperational?: boolean;
}

export interface SaudiDriverRegionDto extends SaudiRegionDto {
  isOperational: boolean;
}

export interface OperationalCityDto {
  id: string;
  regionCode: string;
  code: string;
  nameAr: string;
  nameEn: string;
  sortOrder: number;
  isOperational: boolean;
}

export interface OperationalRegionDto {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  sortOrder: number;
  isOperational: boolean;
  cities: OperationalCityDto[];
}

export interface SaudiCityDto extends SaudiRegionDto {
  regionCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeographyService {
  private readonly apiUrl = `${environment.apiUrl}/geography`;
  private readonly adminApiUrl = `${environment.apiUrl}/admin/geography`;
  private readonly skipAuthHeaders = new HttpHeaders({ 'X-Skip-Auth': 'true' });
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private regionsRequest$?: Observable<SaudiRegionDto[]>;
  private readonly citiesRequests = new Map<string, Observable<SaudiCityDto[]>>();
  private operationalRegionCodes = new Set<string>(['EASTERN']);
  private operationalCityCodes = new Set<string>(['DAMMAM', 'KHOBAR', 'DHAHRAN']);
  private loadFailureLogged = false;
  private driverRegionsFailureToasted = false;

  getRegions(): Observable<SaudiRegionDto[]> {
    if (!this.regionsRequest$) {
      this.regionsRequest$ = this.http.get<SaudiRegionDto[]>(
        `${this.apiUrl}/regions`,
        { headers: this.skipAuthHeaders }
      ).pipe(
        map((regions) => (regions ?? []).map((region) => this.normalizeRegion(region))),
        tap((regions) => this.syncOperationalRegionCodes(regions)),
        catchError((error) => {
          this.regionsRequest$ = undefined;
          this.logLoadFailure('regions', error);
          return of([] as SaudiRegionDto[]);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }

    return this.regionsRequest$;
  }

  getOperationalRegions(): Observable<SaudiRegionDto[]> {
    return this.getRegions().pipe(
      map((regions) => regions.filter((region) => this.isOperationalRegionCode(region.code)))
    );
  }

  getDriverRegions(): Observable<SaudiDriverRegionDto[]> {
    return this.http.get<SaudiDriverRegionDto[]>(
      `${this.apiUrl}/driver/regions`,
      { headers: this.skipAuthHeaders }
    ).pipe(
      map((regions) =>
        (regions ?? []).map((region) => ({
          ...this.normalizeRegion(region),
          isOperational: region.isOperational ?? this.isOperationalRegionCode(region.code)
        }))
      ),
      tap((regions) => this.syncOperationalRegionCodes(regions)),
      catchError((error) => {
        this.logLoadFailure('driver regions', error);
        this.toastDriverRegionsFailure(error);
        return of([] as SaudiDriverRegionDto[]);
      })
    );
  }

  getAdminOperationalRegions(): Observable<OperationalRegionDto[]> {
    return this.http.get<OperationalRegionDto[]>(`${this.adminApiUrl}/operational-regions`).pipe(
      map((regions) => (regions ?? []).map((region) => this.normalizeOperationalRegion(region))),
      tap((regions) => this.syncOperationalGeography(regions)),
      catchError((error) => {
        this.toastService.error(
          describeApiError(error, this.translate, { fallbackKey: 'COMMON.FAILED_TO_LOAD' })
        );
        return of([] as OperationalRegionDto[]);
      })
    );
  }

  updateOperationalRegion(regionCode: string, isOperational: boolean): Observable<OperationalRegionDto> {
    const normalizedCode = regionCode.trim().toUpperCase();

    return this.http.put<OperationalRegionDto>(
      `${this.adminApiUrl}/operational-regions/${encodeURIComponent(normalizedCode)}`,
      { isOperational }
    ).pipe(
      map((region) => this.normalizeOperationalRegion(region)),
      tap((region) => {
        this.syncOperationalGeography([region]);
        this.clearGeographyCache();
      })
    );
  }

  updateOperationalCity(cityCode: string, isOperational: boolean): Observable<OperationalCityDto> {
    const normalizedCode = cityCode.trim().toUpperCase();

    return this.http.put<OperationalCityDto>(
      `${this.adminApiUrl}/operational-cities/${encodeURIComponent(normalizedCode)}`,
      { isOperational }
    ).pipe(
      map((city) => this.normalizeOperationalCity(city)),
      tap((city) => {
        this.syncOperationalCityCodes([city]);
        this.clearGeographyCache(city.regionCode);
      })
    );
  }

  isOperationalRegionCode(regionCode?: string | null): boolean {
    return this.operationalRegionCodes.has((regionCode || '').trim().toUpperCase());
  }

  isOperationalCityCode(cityCode?: string | null, regionCode?: string | null): boolean {
    const normalizedCity = (cityCode || '').trim().toUpperCase();
    const normalizedRegion = (regionCode || '').trim().toUpperCase();

    if (!normalizedCity || !normalizedRegion) {
      return false;
    }

    if (!this.isOperationalRegionCode(normalizedRegion)) {
      return false;
    }

    return this.operationalCityCodes.has(normalizedCity);
  }

  getCities(regionCode: string): Observable<SaudiCityDto[]> {
    const normalizedCode = regionCode.trim().toUpperCase();

    if (!this.citiesRequests.has(normalizedCode)) {
      this.citiesRequests.set(
        normalizedCode,
        this.http.get<SaudiCityDto[]>(
          `${this.apiUrl}/regions/${encodeURIComponent(normalizedCode)}/cities`,
          { headers: this.skipAuthHeaders }
        ).pipe(
          map((cities) => (cities ?? []).map((city) => this.normalizeCity(city))),
          tap((cities) => this.syncOperationalCityCodes(cities)),
          catchError((error) => {
            this.citiesRequests.delete(normalizedCode);
            this.logLoadFailure(`cities (${normalizedCode})`, error);
            return of([] as SaudiCityDto[]);
          }),
          shareReplay({ bufferSize: 1, refCount: true })
        )
      );
    }

    return this.citiesRequests.get(normalizedCode)!;
  }

  getOperationalCities(regionCode: string): Observable<SaudiCityDto[]> {
    const normalizedCode = regionCode.trim().toUpperCase();

    if (!this.isOperationalRegionCode(normalizedCode)) {
      return of([]);
    }

    return this.getCities(normalizedCode).pipe(
      map((cities) => cities.filter((city) => this.isOperationalCityCode(city.code, city.regionCode)))
    );
  }

  clearGeographyCache(regionCode?: string): void {
    this.regionsRequest$ = undefined;

    if (regionCode) {
      this.citiesRequests.delete(regionCode.trim().toUpperCase());
    } else {
      this.citiesRequests.clear();
    }
  }

  private syncOperationalGeography(regions: OperationalRegionDto[]): void {
    this.syncOperationalRegionCodes(regions);

    this.operationalCityCodes = new Set(
      regions.flatMap((region) =>
        region.cities
          .filter((city) => region.isOperational && city.isOperational)
          .map((city) => city.code.trim().toUpperCase())
      )
    );
  }

  private syncOperationalRegionCodes(
    regions: Array<Pick<SaudiRegionDto, 'code' | 'isOperational'>>
  ): void {
    const operationalCodes = regions
      .filter((region) => region.isOperational)
      .map((region) => region.code.trim().toUpperCase());

    if (operationalCodes.length > 0) {
      this.operationalRegionCodes = new Set(operationalCodes);
    }
  }

  private syncOperationalCityCodes(
    cities: Array<Pick<OperationalCityDto | SaudiCityDto, 'code' | 'isOperational' | 'regionCode'>>
  ): void {
    for (const city of cities) {
      const normalizedCode = city.code.trim().toUpperCase();
      const regionCode = city.regionCode.trim().toUpperCase();
      const isEffective = Boolean(city.isOperational) && this.isOperationalRegionCode(regionCode);

      if (isEffective) {
        this.operationalCityCodes.add(normalizedCode);
      } else {
        this.operationalCityCodes.delete(normalizedCode);
      }
    }
  }

  private normalizeRegion<T extends SaudiRegionDto>(region: T): T {
    return {
      ...region,
      code: region.code.trim().toUpperCase(),
      isOperational: region.isOperational ?? this.isOperationalRegionCode(region.code)
    };
  }

  private normalizeCity(city: SaudiCityDto): SaudiCityDto {
    return {
      ...city,
      code: city.code.trim().toUpperCase(),
      regionCode: city.regionCode.trim().toUpperCase(),
      isOperational: city.isOperational ?? this.isOperationalCityCode(city.code, city.regionCode)
    };
  }

  private normalizeOperationalRegion(region: OperationalRegionDto): OperationalRegionDto {
    return {
      ...region,
      code: region.code.trim().toUpperCase(),
      isOperational: Boolean(region.isOperational),
      cities: (region.cities ?? []).map((city) => this.normalizeOperationalCity(city))
    };
  }

  private normalizeOperationalCity(city: OperationalCityDto): OperationalCityDto {
    return {
      ...city,
      code: city.code.trim().toUpperCase(),
      regionCode: city.regionCode.trim().toUpperCase(),
      isOperational: Boolean(city.isOperational)
    };
  }

  private toastDriverRegionsFailure(error: unknown): void {
    if (this.driverRegionsFailureToasted) {
      return;
    }

    this.driverRegionsFailureToasted = true;
    this.toastService.error(
      describeApiError(error, this.translate, { fallbackKey: 'COMMON.FAILED_TO_LOAD' })
    );
  }

  private logLoadFailure(scope: string, error: unknown): void {
    if (this.loadFailureLogged || environment.production) {
      return;
    }

    this.loadFailureLogged = true;
    console.warn(`[GeographyService] Failed to load ${scope}.`, error);
  }
}
