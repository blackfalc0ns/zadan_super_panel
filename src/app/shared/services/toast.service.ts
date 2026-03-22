import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastConfig } from '../components/ui/toast-notification/toast-notification.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastConfig[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  show(config: Omit<ToastConfig, 'id'>): string {
    const id = this.generateId();
    const toast: ToastConfig = { ...config, id };
    
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);
    
    return id;
  }

  success(message: string, title?: string, options?: Partial<ToastConfig>): string {
    return this.show({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  error(message: string, title?: string, options?: Partial<ToastConfig>): string {
    return this.show({
      type: 'error',
      title,
      message,
      ...options
    });
  }

  warning(message: string, title?: string, options?: Partial<ToastConfig>): string {
    return this.show({
      type: 'warning',
      title,
      message,
      ...options
    });
  }

  info(message: string, title?: string, options?: Partial<ToastConfig>): string {
    return this.show({
      type: 'info',
      title,
      message,
      ...options
    });
  }

  dismiss(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const filteredToasts = currentToasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(filteredToasts);
  }

  clear(): void {
    this.toastsSubject.next([]);
  }
}