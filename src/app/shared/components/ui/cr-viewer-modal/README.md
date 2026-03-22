# CR Viewer Modal Component

A reusable modal component for displaying and verifying Commercial Register (السجل التجاري) documents.

## Features

- Full-screen modal with document preview
- Zoom controls (50% - 200%)
- CR data display with verification information
- QR code for document verification
- Expiry warning for soon-to-expire CRs
- Action buttons: Accept, Download, Verify Source

## Usage

```typescript
import { CrViewerModalComponent, CommercialRegisterData } from './cr-viewer-modal/cr-viewer-modal.component';

// In your component
showCrModal = false;
crData: CommercialRegisterData = {
  crNumber: '1010123456',
  establishmentName: 'شركة زدانة التجارية',
  entityType: 'شركة ذات مسؤولية محدودة',
  expiryDate: '2024-12-31',
  mainActivity: 'تجارة الجملة والتجزئة',
  dataSource: 'منصة واثق (API)',
  verifiedBy: 'النظام الآلي',
  internalReference: 'ZAD-CR-99823-2023',
  isExpiringSoon: true,
  qrCodeUrl: 'https://...',
  documentUrl: 'https://...'
};

openCrModal() {
  this.showCrModal = true;
}
```

```html
<app-cr-viewer-modal 
  [isOpen]="showCrModal"
  [crData]="crData"
  (close)="showCrModal = false"
  (accept)="onCrAccept()"
  (download)="onCrDownload()"
  (verifySource)="onCrVerifySource()">
</app-cr-viewer-modal>
```

## Inputs

- `isOpen`: boolean - Controls modal visibility
- `crData`: CommercialRegisterData | null - CR document data

## Outputs

- `close`: Emitted when modal is closed
- `accept`: Emitted when "قبول المستند" is clicked
- `download`: Emitted when download is requested
- `verifySource`: Emitted when "التحقق من المصدر" is clicked
كمل