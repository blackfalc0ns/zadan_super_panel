import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    @Input() currentLang: string = 'ar';
    @Input() isSidebarOpen: boolean = false;
    @Output() languageSwitch = new EventEmitter<void>();
    @Output() toggleSidebar = new EventEmitter<void>();

    onLanguageSwitch() {
        this.languageSwitch.emit();
    }

    onToggleSidebar() {
        this.toggleSidebar.emit();
    }

    reload() {
        window.location.reload();
    }
}
