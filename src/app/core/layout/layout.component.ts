import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    SidebarComponent,
    HeaderComponent,
    UserProfileComponent
  ],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  userName: string = 'Admin';
  currentLang: string = 'ar';
  isSidebarOpen: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.currentLang = this.translate.currentLang || 'ar';
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.fullName || 'Admin';
      }
    });

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.currentLang = event.lang;
    });

    // Close sidebar on mobile after navigation
    this.router.events.subscribe(() => {
      this.isSidebarOpen = false;
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  switchLanguage() {
    const nextLang = this.currentLang === 'ar' ? 'en' : 'ar';
    this.translate.use(nextLang);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
