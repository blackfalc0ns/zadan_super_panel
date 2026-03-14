import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  userName: string = 'Admin';
  activeTab: string = 'week';
  today = new Date();

  metrics = [
    { label: 'DASHBOARD.METRICS.TRAFFIC', value: '12.4k', trend: '+14%', trendUp: true, sub: 'DASHBOARD.SUB.UNIQUE_VISITORS' },
    { label: 'DASHBOARD.METRICS.CONVERSION', value: '3.8%', trend: '+0.4%', trendUp: true, sub: 'DASHBOARD.SUB.CHECKOUT_RATE' },
    { label: 'DASHBOARD.METRICS.UPTIME', value: '99.9%', trend: 'Stable', trendUp: true, sub: 'DASHBOARD.SUB.SYSTEM_HEALTH' },
    { label: 'DASHBOARD.METRICS.AVG_LOAD', value: '1.2s', trend: '-0.2s', trendUp: true, sub: 'DASHBOARD.SUB.PERFORMANCE' }
  ];

  activities = [
    { user: 'Ahmed Ali', action: 'DASHBOARD.LOG.CATEGORY_CREATED', avatar: 'AA', time: '5', color: 'bg-zadna-primary/10 text-zadna-primary' },
    { user: 'Sara John', action: 'DASHBOARD.LOG.PRODUCT_UPDATED', avatar: 'SJ', time: '12', color: 'bg-zadna-accent/10 text-zadna-accent' },
    { user: 'System Bot', action: 'DASHBOARD.LOG.BACKUP_COMPLETED', avatar: 'SB', time: '45', color: 'bg-green-50 text-green-600' },
    { user: 'John Doe', action: 'DASHBOARD.LOG.ADMIN_LOGIN', avatar: 'JD', time: '60', color: 'bg-blue-50 text-blue-600' }
  ];

  catalogStats = [
    { label: 'DASHBOARD.STATS.TOTAL_PRODUCTS', value: '1,234', icon: 'cube' },
    { label: 'DASHBOARD.STATS.ACTIVE_CATEGORIES', value: '42', icon: 'folder' },
    { label: 'DASHBOARD.STATS.OUT_OF_STOCK', value: '12', icon: 'exclamation' }
  ];

  trafficData = [40, 65, 45, 80, 55, 90, 70, 100, 85, 95, 75, 85];

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.fullName || 'Admin';
      }
    });
  }
}

