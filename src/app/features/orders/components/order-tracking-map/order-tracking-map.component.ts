import { Component, Input, AfterViewInit, OnChanges, SimpleChanges, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-order-tracking-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-wrapper">
      <div #mapContainer class="map-container" id="order-tracking-map"></div>
      <div class="map-legend">
        <div class="legend-item" *ngIf="merchantGeo">
          <span class="legend-dot merchant"></span>
          <span class="legend-label">{{ merchantLabel }}</span>
        </div>
        <div class="legend-item" *ngIf="customerGeo">
          <span class="legend-dot customer"></span>
          <span class="legend-label">{{ customerLabel }}</span>
        </div>
        <div class="legend-item" *ngIf="driverLocation">
          <span class="legend-dot driver"></span>
          <span class="legend-label">{{ driverLabel }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 300px;
      border-radius: 0;
      overflow: hidden;
    }
    .map-container {
      width: 100%;
      height: 100%;
      min-height: 300px;
      z-index: 1;
    }
    .map-legend {
      position: absolute;
      bottom: 12px;
      left: 12px;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      border-radius: 12px;
      padding: 8px 14px;
      display: flex;
      gap: 14px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(0, 0, 0, 0.06);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-dot.merchant { background: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
    .legend-dot.customer { background: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }
    .legend-dot.driver { background: #f59e0b; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2); }
    .legend-label {
      font-size: 10px;
      font-weight: 700;
      color: #475569;
    }
  `]
})
export class OrderTrackingMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() merchantGeo: { latitude: number; longitude: number } | null | undefined;
  @Input() customerGeo: { latitude: number; longitude: number } | null | undefined;
  @Input() driverLocation: { latitude: number; longitude: number } | null | undefined;
  @Input() merchantLabel = 'المتجر';
  @Input() customerLabel = 'العميل';
  @Input() driverLabel = 'السائق';

  private map: L.Map | null = null;
  private merchantMarker: L.Marker | null = null;
  private customerMarker: L.Marker | null = null;
  private driverMarker: L.Marker | null = null;
  private routeLine: L.Polyline | null = null;

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map) {
      this.updateMarkers();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    if (!this.mapContainer?.nativeElement) return;

    // Fix Leaflet default icon path issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
    });

    // Default center: Saudi Arabia (Riyadh)
    const defaultCenter: L.LatLngExpression = [24.7136, 46.6753];

    this.map = L.map(this.mapContainer.nativeElement, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Add zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // Use CartoDB Positron for a clean, modern look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    this.updateMarkers();
  }

  private createIcon(color: string, emoji: string): L.DivIcon {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          width: 36px; height: 36px;
          background: ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 4px 14px ${color}66;
          border: 3px solid white;
        ">${emoji}</div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20]
    });
  }

  private updateMarkers(): void {
    if (!this.map) return;

    // Clear existing
    this.merchantMarker?.remove();
    this.customerMarker?.remove();
    this.driverMarker?.remove();
    this.routeLine?.remove();

    const bounds: L.LatLng[] = [];

    if (this.merchantGeo && this.merchantGeo.latitude && this.merchantGeo.longitude) {
      const pos: L.LatLngExpression = [this.merchantGeo.latitude, this.merchantGeo.longitude];
      this.merchantMarker = L.marker(pos, {
        icon: this.createIcon('#10b981', '🏪')
      })
        .addTo(this.map)
        .bindPopup(`<strong style="font-size:13px">${this.merchantLabel}</strong>`);
      bounds.push(L.latLng(pos));
    }

    if (this.customerGeo && this.customerGeo.latitude && this.customerGeo.longitude) {
      const pos: L.LatLngExpression = [this.customerGeo.latitude, this.customerGeo.longitude];
      this.customerMarker = L.marker(pos, {
        icon: this.createIcon('#3b82f6', '🏠')
      })
        .addTo(this.map)
        .bindPopup(`<strong style="font-size:13px">${this.customerLabel}</strong>`);
      bounds.push(L.latLng(pos));
    }

    if (this.driverLocation && this.driverLocation.latitude && this.driverLocation.longitude) {
      const pos: L.LatLngExpression = [this.driverLocation.latitude, this.driverLocation.longitude];
      this.driverMarker = L.marker(pos, {
        icon: this.createIcon('#f59e0b', '🚗')
      })
        .addTo(this.map)
        .bindPopup(`<strong style="font-size:13px">${this.driverLabel}</strong>`);
      bounds.push(L.latLng(pos));
    }

    // Draw route line between merchant and customer
    if (this.merchantGeo && this.customerGeo &&
        this.merchantGeo.latitude && this.customerGeo.latitude) {
      const waypoints: L.LatLngExpression[] = [];
      waypoints.push([this.merchantGeo.latitude, this.merchantGeo.longitude]);
      if (this.driverLocation && this.driverLocation.latitude) {
        waypoints.push([this.driverLocation.latitude, this.driverLocation.longitude]);
      }
      waypoints.push([this.customerGeo.latitude, this.customerGeo.longitude]);

      this.routeLine = L.polyline(waypoints, {
        color: '#6366f1',
        weight: 3,
        opacity: 0.6,
        dashArray: '8 6',
        lineCap: 'round'
      }).addTo(this.map);
    }

    // Fit bounds
    if (bounds.length > 1) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 15 });
    } else if (bounds.length === 1) {
      this.map.setView(bounds[0], 14);
    }
  }
}
