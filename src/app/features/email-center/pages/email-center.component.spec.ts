import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAppTesting } from '../../../testing/testing.providers';
import { EmailCenterComponent } from './email-center.component';

describe('EmailCenterComponent', () => {
  let component: EmailCenterComponent;
  let fixture: ComponentFixture<EmailCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailCenterComponent],
      providers: [...provideAppTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters workflow rules by selected audience', () => {
    component.setAudience('drivers');
    fixture.detectChanges();

    expect(component.filteredRules.length).toBeGreaterThan(0);
    expect(component.filteredRules.every((rule) => rule.audienceType === 'drivers')).toBeTrue();
  });
});
