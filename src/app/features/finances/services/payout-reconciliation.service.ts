import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PayoutBankStatementImport {
  id: string;
  fileName: string;
  importedByUserId: string;
  importedAtUtc: string;
  totalRows: number;
  matchedRows: number;
  unmatchedRows: number;
  ambiguousRows: number;
  mismatchRows: number;
  invalidRows: number;
}

export interface PayoutBankStatementImportList {
  items: PayoutBankStatementImport[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface PayoutBankStatementEntry {
  id: string;
  importId: string;
  rowNumber: number;
  bankReference: string;
  amount: number;
  transactionDateUtc: string;
  currencyCode: string;
  beneficiaryMasked: string | null;
  status: 'Unmatched' | 'Matched' | 'Ambiguous' | 'Mismatch' | 'Ignored' | string;
  payoutId: string | null;
  matchedByUserId: string | null;
  matchedAtUtc: string | null;
  resolutionNote: string | null;
}

export interface PayoutBankStatementEntryList {
  items: PayoutBankStatementEntry[];
  page: number;
  pageSize: number;
  totalCount: number;
}

@Injectable({ providedIn: 'root' })
export class PayoutReconciliationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/payout-reconciliation`;

  getImports(page = 1, pageSize = 50): Observable<PayoutBankStatementImportList> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<PayoutBankStatementImportList>(`${this.apiUrl}/imports`, { params });
  }

  getEntries(status?: string, importId?: string, page = 1, pageSize = 100): Observable<PayoutBankStatementEntryList> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    if (status) {
      params = params.set('status', status);
    }
    if (importId) {
      params = params.set('importId', importId);
    }

    return this.http.get<PayoutBankStatementEntryList>(`${this.apiUrl}/entries`, { params });
  }

  importStatement(file: File): Observable<PayoutBankStatementImport> {
    const formData = new FormData();
    formData.append('statement', file);
    return this.http.post<PayoutBankStatementImport>(`${this.apiUrl}/imports`, formData);
  }

  matchEntry(entryId: string, payoutId: string, note?: string): Observable<PayoutBankStatementEntry> {
    return this.http.post<PayoutBankStatementEntry>(`${this.apiUrl}/entries/${entryId}/match`, {
      payoutId,
      note: note || null
    });
  }

  ignoreEntry(entryId: string, note?: string): Observable<PayoutBankStatementEntry> {
    return this.http.post<PayoutBankStatementEntry>(`${this.apiUrl}/entries/${entryId}/ignore`, {
      note: note || null
    });
  }
}
