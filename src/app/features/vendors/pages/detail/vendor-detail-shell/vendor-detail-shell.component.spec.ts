import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { provideTranslateService, TranslateLoader, TranslateNoOpLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { VendorDetailShellComponent } from './vendor-detail-shell.component';
import { VendorDetailFacade } from '../../../services/vendor-detail.facade';

describe('VendorDetailShellComponent', () => {
  let fixture: ComponentFixture<VendorDetailShellComponent>;
  let router: Router;

  function createRoute(tab: string | null, childPath?: string): Partial<ActivatedRoute> {
    const childRoute = childPath
      ? ({
          snapshot: {
            routeConfig: {
              path: childPath
            }
          }
        } as ActivatedRoute)
      : undefined;

    return {
      snapshot: {
        queryParamMap: convertToParamMap(tab ? { tab } : {}),
        queryParams: tab ? { tab } : {}
      } as ActivatedRoute['snapshot'],
      paramMap: of(convertToParamMap({ id: 'VND-9928' })),
      firstChild: childRoute
    };
  }

  async function setup(tab: string | null, childPath?: string): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [VendorDetailShellComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateNoOpLoader
          }
        }),
        {
          provide: ActivatedRoute,
          useValue: createRoute(tab, childPath)
        },
        VendorDetailFacade
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    fixture = TestBed.createComponent(VendorDetailShellComponent);
    fixture.detectChanges();
  }

  it('redirects legacy finance query tabs to the canonical child route', async () => {
    await setup('finance');

    expect(router.navigate).toHaveBeenCalledWith(['finance'], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { tab: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  });

  it('normalizes unknown legacy tabs to overview', async () => {
    await setup('unknown');

    expect(router.navigate).toHaveBeenCalledWith(['overview'], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { tab: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  });

  it('keeps the canonical child path when a legacy query tab is also present', async () => {
    await setup('orders', 'finance');

    expect(router.navigate).not.toHaveBeenCalled();
    expect(fixture.componentInstance.activeTab).toBe('finance');
  });

  it('keeps the active tab from the child route when no legacy query is present', async () => {
    await setup(null, 'orders');

    expect(router.navigate).not.toHaveBeenCalled();
    expect(fixture.componentInstance.activeTab).toBe('orders');
  });
});
