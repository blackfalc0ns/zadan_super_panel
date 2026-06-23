import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './not-found.component.html'
})
export class NotFoundComponent {
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly translate = inject(TranslateService);

  readonly embedded = this.route.snapshot.data['embedded'] !== false;
  readonly attemptedPath = this.resolveAttemptedPath();

  private resolveAttemptedPath(): string | null {
    const currentPath = this.router.url.split('?')[0].replace(/^\//, '');
    if (!currentPath || currentPath === 'not-found') {
      return null;
    }

    return currentPath;
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
  }

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
      return;
    }

    this.location.go('/dashboard');
  }
}
