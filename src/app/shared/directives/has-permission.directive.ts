import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { AccessService } from '../../core/services/access.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input('appHasPermission') permission!: string;
  private subscription?: Subscription;
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private accessService: AccessService
  ) {}

  ngOnInit(): void {
    this.subscription = this.accessService.hasPermission$(this.permission).subscribe(hasPerm => {
      if (hasPerm && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!hasPerm && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
