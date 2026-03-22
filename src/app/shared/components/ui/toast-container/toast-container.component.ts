import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ToastService } from '../../../services/toast.service';
import { ToastNotificationComponent, ToastConfig } from '../toast-notification/toast-notification.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastNotificationComponent],
  template: `
    <div class="fixed bottom-6 right-6 z-50 space-y-3">
      <app-toast-notification 
        *ngFor="let toast of toasts$ | async; trackBy: trackByToastId"
        [config]="toast"
        (dismiss)="onDismiss($event)">
      </app-toast-notification>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ToastContainerComponent implements OnInit {
  toasts$!: Observable<ToastConfig[]>;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toasts$ = this.toastService.toasts$;
  }

  onDismiss(id: string) {
    this.toastService.dismiss(id);
  }

  trackByToastId(index: number, toast: ToastConfig): string {
    return toast.id || index.toString();
  }
}