import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './user-profile.component.html',
    styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
    @Input() userName: string = 'Admin';
    @Output() logout = new EventEmitter<void>();

    onLogout() {
        this.logout.emit();
    }
}
