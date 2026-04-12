import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAppTesting } from '../../../../testing/testing.providers';
import { AdminUsersListComponent } from './admin-users-list.component';

describe('AdminUsersListComponent', () => {
  let component: AdminUsersListComponent;
  let fixture: ComponentFixture<AdminUsersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsersListComponent],
      providers: [...provideAppTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters the directory by audience', () => {
    component.setAudience('drivers');
    fixture.detectChanges();

    expect(component.filteredUsers.length).toBeGreaterThan(0);
    expect(component.filteredUsers.every((user) => user.audienceType === 'drivers')).toBeTrue();
  });
});
