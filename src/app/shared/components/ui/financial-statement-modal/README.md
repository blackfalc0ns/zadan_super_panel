# Financial Statement Export Modal Component

A comprehensive modal for exporting financial statements with customizable options.

## Features

- Multiple statement types (Comprehensive, Payments, Deductions, Returns)
- Date range selection with quick presets
- Customizable included data fields
- Multiple export formats (PDF, Excel, CSV)
- Live preview of statement summary
- Estimated file size and record count

## Usage

```typescript
import { FinancialStatementModalComponent, FinancialStatementConfig } from './financial-statement-modal/financial-statement-modal.component';

// In your component
showModal = false;

onDownload(config: FinancialStatementConfig) {
  console.log('Downloading statement:', config);
  // Call your API to generate the statement
}

onPreview(config: FinancialStatementConfig) {
  console.log('Previewing statement:', config);
  // Call your API to preview the statement
}
```

```html
<app-financial-statement-modal
  [isOpen]="showModal"
  [vendorName]="'متجر زادانة المميز'"
  (close)="showModal = false"
  (download)="onDownload($event)"
  (preview)="onPreview($event)">
</app-financial-statement-modal>
```

## Inputs

- `isOpen`: boolean - Controls modal visibility
- `vendorName`: string - Vendor name to display in preview

## Outputs

- `close`: Emitted when modal is closed
- `download`: Emitted when download button is clicked, passes FinancialStatementConfig
- `preview`: Emitted when preview button is clicked, passes FinancialStatementConfig

## FinancialStatementConfig Interface

```typescript
interface FinancialStatementConfig {
  statementType: 'comprehensive' | 'payments' | 'deductions' | 'returns';
  dateFrom: Date;
  dateTo: Date;
  includedData: {
    sales: boolean;
    returns: boolean;
    discounts: boolean;
    commissions: boolean;
    netAmount: boolean;
  };
  exportFormat: 'pdf' | 'excel' | 'csv';
}
```
