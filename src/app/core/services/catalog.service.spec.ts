import { TestBed } from '@angular/core/testing';
import { CatalogService } from './catalog.service';
import { provideAppTesting } from '../../testing/testing.providers';

describe('CatalogService', () => {
  let service: CatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...provideAppTesting()]
    });
    service = TestBed.inject(CatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
