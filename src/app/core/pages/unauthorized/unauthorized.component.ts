import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './unauthorized.component.html'
})
export class UnauthorizedComponent {}
