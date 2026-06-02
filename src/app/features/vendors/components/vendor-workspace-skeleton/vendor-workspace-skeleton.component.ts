import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type VendorWorkspaceSkeletonVariant = 'default' | 'table' | 'split';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-vendor-workspace-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-workspace-skeleton.component.html',
  styleUrls: ['./vendor-workspace-skeleton.component.scss']
})
export class VendorWorkspaceSkeletonComponent {
  @Input() variant: VendorWorkspaceSkeletonVariant = 'default';
  /** When false, only the tab body skeleton is shown (header has its own). */
  @Input() includeHero = true;
}
