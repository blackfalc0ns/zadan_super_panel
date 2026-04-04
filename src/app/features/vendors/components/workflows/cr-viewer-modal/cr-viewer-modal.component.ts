import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface CommercialRegisterData {
  crNumber: string;
  establishmentName: string;
  entityType: string;
  expiryDate: string;
  issueDate?: string;
  mainActivity: string;
  dataSource: string;
  verifiedBy: string;
  internalReference: string;
  qrCodeUrl?: string;
  documentUrl?: string;
  isExpiringSoon?: boolean;
  capital?: string;
  headquarters?: string;
  ownerName?: string;
  ownerIdNumber?: string;
}

@Component({
  selector: 'app-cr-viewer-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './cr-viewer-modal.component.html',
  styleUrls: ['./cr-viewer-modal.component.scss']
})
export class CrViewerModalComponent {
  @Input() isOpen = false;
  @Input() crData: CommercialRegisterData | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() accept = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
  @Output() verifySource = new EventEmitter<void>();

  zoomLevel = 100;

  constructor(private translate: TranslateService) {}

  get isRTL(): boolean {
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'ar';
    return lang.startsWith('ar');
  }

  onClose() {
    this.close.emit();
  }

  onAccept() {
    this.accept.emit();
  }

  onDownload() {
    this.download.emit();
  }

  onVerifySource() {
    this.verifySource.emit();
  }

  zoomIn() {
    if (this.zoomLevel < 200) {
      this.zoomLevel += 10;
    }
  }

  zoomOut() {
    if (this.zoomLevel > 50) {
      this.zoomLevel -= 10;
    }
  }
}
