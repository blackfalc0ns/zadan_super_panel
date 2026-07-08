import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardAuditItem } from '../../models/dashboard.models';

@Component({
 selector: 'app-dashboard-audit-feed',
 standalone: true,
 imports: [CommonModule, TranslateModule],
 templateUrl: './dashboard-audit-feed.component.html',
 changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardAuditFeedComponent {
 @Input() auditItems: DashboardAuditItem[] = [];
 @Input() isRTL = true;
 @Input() currentLang: 'ar' | 'en' = 'ar';

 formatRelativeTime(value: string): string {
 const timestamp = new Date(value).getTime();
 const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));

 if (this.currentLang === 'ar') {
 if (minutes < 1) return 'الحين';
 if (minutes === 1) return 'قبل دقيقة';
 if (minutes === 2) return 'قبل دقيقتين';
 if (minutes >= 3 && minutes <= 10) return `قبل ${minutes} دقائق`;
 if (minutes < 60) return `قبل ${minutes} دقيقة`;

 const hours = Math.floor(minutes / 60);
 if (hours === 1) return 'قبل ساعة';
 if (hours === 2) return 'قبل ساعتين';
 if (hours >= 3 && hours <= 10) return `قبل ${hours} ساعات`;
 if (hours < 24) return `قبل ${hours} ساعة`;

 return new Intl.DateTimeFormat('ar-SA', { timeZone: 'Asia/Riyadh', day: 'numeric', month: 'short' }).format(new Date(value));
 } else {
 if (minutes < 1) return 'Just now';
 if (minutes < 60) return `${minutes} min ago`;
 const hours = Math.floor(minutes / 60);
 if (hours < 24) return `${hours} hr ago`;
 return new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Riyadh', day: 'numeric', month: 'short' }).format(new Date(value));
 }
 }
}
