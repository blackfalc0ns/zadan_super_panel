import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, catchError, of, switchMap, tap } from 'rxjs';
import { AppPaginationComponent } from '../../../../shared/components/ui/pagination/pagination.component';
import {
  SearchableSelectComponent,
  SearchableSelectOption
} from '../../../../shared/components/ui/form-controls/select/searchable-select.component';
import { GeographyService, SaudiRegionDto } from '../../../../shared/services/geography.service';
import { SuperAdminDashboardService } from '../../services/dashboard.api.service';
import {
  GeographyCoverageCityRow,
  GeographyCoverageGapFlag,
  GeographyCoverageSnapshot,
  GeographyCoverageSummary
} from '../../models/dashboard.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard-geography-coverage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    AppPaginationComponent,
    SearchableSelectComponent
  ],
  templateUrl: './dashboard-geography-coverage.component.html',
  styleUrl: './dashboard-geography-coverage.component.scss'
})
export class DashboardGeographyCoverageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dashboardService = inject(SuperAdminDashboardService);
  private readonly geographyService = inject(GeographyService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly reloadCoverage$ = new Subject<{ region: string; gapsOnly: boolean }>();

  @Input() isRTL = true;
  @Output() summaryLoaded = new EventEmitter<GeographyCoverageSummary>();

  isLoading = true;
  isRefreshing = false;
  loadError = false;
  coverage: GeographyCoverageSnapshot | null = null;
  regions: SaudiRegionDto[] = [];

  selectedRegion = 'all';
  gapsOnly = false;
  citySearch = '';
  currentPage = 1;
  readonly pageSize = 15;

  ngOnInit(): void {
    this.geographyService.getRegions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (regions) => {
        this.regions = regions;
        this.cdr.markForCheck();
      }
    });

    this.reloadCoverage$
      .pipe(
        switchMap(({ region, gapsOnly }) => {
          this.isRefreshing = true;
          this.loadError = false;
          this.cdr.markForCheck();

          return this.dashboardService.getGeographyCoverage(region, gapsOnly).pipe(
            tap(() => {
              this.isLoading = false;
              this.isRefreshing = false;
            }),
            catchError(() => {
              this.coverage = null;
              this.isLoading = false;
              this.isRefreshing = false;
              this.loadError = true;
              this.cdr.markForCheck();
              return of(null);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((coverage) => {
        if (coverage) {
          this.coverage = coverage;
          this.loadError = false;
          this.resetTablePage();
          this.summaryLoaded.emit(coverage.summary);
          this.cdr.markForCheck();
        }
      });

    this.requestCoverageReload();
  }

  onRegionChange(region: string): void {
    this.selectedRegion = region || 'all';
    this.resetTablePage();
    this.requestCoverageReload();
  }

  onGapsOnlyChange(checked: boolean): void {
    this.gapsOnly = checked;
    this.resetTablePage();
    this.requestCoverageReload();
  }

  onCitySearchChange(): void {
    this.resetTablePage();
    this.clampCurrentPage();
    this.cdr.markForCheck();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.cdr.markForCheck();
  }

  clearFilters(): void {
    this.selectedRegion = 'all';
    this.gapsOnly = false;
    this.citySearch = '';
    this.resetTablePage();
    this.requestCoverageReload();
  }

  get hasActiveFilters(): boolean {
    return this.selectedRegion !== 'all' || this.gapsOnly || !!this.citySearch.trim();
  }

  get regionFilterOptions(): SearchableSelectOption[] {
    return [
      {
        value: 'all',
        labelKey: 'DASHBOARD.COVERAGE.FILTERS.ALL_REGIONS'
      },
      ...this.regions.map((region) => ({
        value: region.code,
        label: this.isRTL ? region.nameAr : region.nameEn
      }))
    ];
  }

  get filteredCities(): GeographyCoverageCityRow[] {
    const cities = this.coverage?.cities ?? [];
    const term = this.normalizeSearchTerm(this.citySearch);
    if (!term) {
      return cities;
    }

    return cities.filter((city) => {
      const haystack = [
        city.cityNameAr,
        city.cityNameEn,
        city.cityCode,
        city.regionCode,
        this.regionLabel(city.regionCode)
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }

  get totalFilteredCities(): number {
    return this.filteredCities.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalFilteredCities / this.pageSize));
  }

  get effectivePage(): number {
    return Math.min(this.currentPage, this.totalPages);
  }

  get paginatedCities(): GeographyCoverageCityRow[] {
    const start = (this.effectivePage - 1) * this.pageSize;
    return this.filteredCities.slice(start, start + this.pageSize);
  }

  cityLabel(city: GeographyCoverageCityRow): string {
    return this.isRTL ? city.cityNameAr : city.cityNameEn;
  }

  isUnmappedCity(city: GeographyCoverageCityRow): boolean {
    return city.cityCode === '__UNMAPPED__';
  }

  get tableCountLabel(): string {
    const total = this.totalFilteredCities;
    if (total === 0) {
      return '0';
    }

    const start = (this.effectivePage - 1) * this.pageSize + 1;
    const end = Math.min(this.effectivePage * this.pageSize, total);
    return `${start}–${end} / ${total}`;
  }

  regionLabel(regionCode: string): string {
    if (!regionCode) {
      return '—';
    }

    const region = this.regions.find((item) => item.code === regionCode);
    if (!region) {
      return regionCode;
    }

    return this.isRTL ? region.nameAr : region.nameEn;
  }

  gapLabel(flag: GeographyCoverageGapFlag): string {
    return `DASHBOARD.COVERAGE.GAPS.${flag}`;
  }

  hasOperationalGap(city: GeographyCoverageCityRow): boolean {
    return city.gapFlags.some((flag) => flag !== 'NoActivity');
  }

  isFullyCovered(city: GeographyCoverageCityRow): boolean {
    return city.gapFlags.length === 0;
  }

  metricTone(value: number): string {
    if (value <= 0) {
      return '';
    }

    return value >= 5 ? 'has-strong-value' : 'has-value';
  }

  gapTone(flag: GeographyCoverageGapFlag): string {
    if (flag === 'DemandWithoutBoth') {
      return 'is-critical';
    }

    if (flag === 'NoSupply' || flag === 'NoVendor' || flag === 'NoDriver') {
      return 'is-warning';
    }

    if (flag === 'SupplyWithoutDemand') {
      return 'is-warning';
    }

    if (flag === 'NoActivity') {
      return 'is-muted';
    }

    return 'is-info';
  }

  trackByCity(_index: number, city: GeographyCoverageCityRow): string {
    return city.cityCode;
  }

  customerQuery(city: GeographyCoverageCityRow): { city: string } {
    return { city: city.cityNameAr };
  }

  vendorQuery(city: GeographyCoverageCityRow): { cityCode: string } {
    return { cityCode: city.cityCode };
  }

  driverQuery(city: GeographyCoverageCityRow): { city: string } {
    return { city: city.cityCode };
  }

  reloadCoverage(): void {
    this.reloadCoverage$.next({
      region: this.selectedRegion,
      gapsOnly: this.gapsOnly
    });
  }

  private requestCoverageReload(): void {
    this.reloadCoverage();
  }

  private resetTablePage(): void {
    this.currentPage = 1;
  }

  private clampCurrentPage(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  private normalizeSearchTerm(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');
  }
}
