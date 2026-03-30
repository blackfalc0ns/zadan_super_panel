import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideAppTesting } from './testing/testing.providers';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [...provideAppTesting()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'superadmin-panel' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('superadmin-panel');
  });

  it('should set the document direction based on the default language', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  });
});
