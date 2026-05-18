import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule],
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
