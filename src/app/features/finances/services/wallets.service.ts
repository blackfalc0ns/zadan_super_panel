import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AdminWalletSummaryDto {
  id: string;
  ownerType: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  currentBalance: number;
  pendingBalance: number;
  createdAtUtc: string;
}

export interface AdminWalletListDto {
  items: AdminWalletSummaryDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPlatformBalance: number;
  totalPendingWithdrawals: number;
}

export interface AdminWalletTransactionDto {
  id: string;
  txnType: string;
  direction: string;
  amount: number;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAtUtc: string;
}

export interface AdminWalletTransactionListDto {
  items: AdminWalletTransactionDto[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface AdminCreateAdjustmentRequest {
  amount: number;
  direction: 'IN' | 'OUT';
  description: string;
}

export interface AdminDriverPayoutMethodDto {
  id: string;
  methodType: string;
  accountHolderName: string;
  providerName: string;
  maskedLabel: string;
}

export interface AdminDriverWithdrawalRequestDto {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  amount: number;
  status: string;
  transferReference: string | null;
  failureReason: string | null;
  createdAtUtc: string;
  processedAtUtc: string | null;
  payoutMethod: AdminDriverPayoutMethodDto | null;
}

export interface AdminWithdrawalRequestListDto {
  items: AdminDriverWithdrawalRequestDto[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface AdminProcessWithdrawalRequest {
  isApproved: boolean;
  transferReference?: string | null;
  failureReason?: string | null;
}

export interface AdminPlatformBankAccountDto {
  id: string | null;
  bankName: string;
  accountHolderName: string;
  iban: string;
  accountNumber: string | null;
  countryCode: string;
  city: string;
  isActive: boolean;
  isBankTransferEnabled: boolean;
  isMoyasarPayoutsEnabled: boolean;
  moyasarPayoutSourceId: string | null;
  notes: string | null;
  updatedAtUtc: string | null;
  canReceiveBankTransfers: boolean;
  canSendMoyasarPayouts: boolean;
}

export interface AdminUpsertPlatformBankAccountRequest {
  bankName: string;
  accountHolderName: string;
  iban: string;
  accountNumber?: string | null;
  countryCode?: string | null;
  city?: string | null;
  isBankTransferEnabled: boolean;
  isMoyasarPayoutsEnabled: boolean;
  moyasarPayoutSourceId?: string | null;
  notes?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class WalletsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/wallets`;

  getWallets(ownerType?: string, page: number = 1, pageSize: number = 20): Observable<AdminWalletListDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (ownerType) {
      params = params.set('ownerType', ownerType);
    }

    return this.http.get<AdminWalletListDto>(this.apiUrl, { params });
  }

  getWallet(id: string): Observable<AdminWalletSummaryDto> {
    return this.http.get<AdminWalletSummaryDto>(`${this.apiUrl}/${id}`);
  }

  getWalletTransactions(id: string, page: number = 1, pageSize: number = 20): Observable<AdminWalletTransactionListDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<AdminWalletTransactionListDto>(`${this.apiUrl}/${id}/transactions`, { params });
  }

  createAdjustment(id: string, payload: AdminCreateAdjustmentRequest): Observable<AdminWalletTransactionDto> {
    return this.http.post<AdminWalletTransactionDto>(`${this.apiUrl}/${id}/adjustments`, payload);
  }

  getWithdrawals(status?: string, page: number = 1, pageSize: number = 20): Observable<AdminWithdrawalRequestListDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<AdminWithdrawalRequestListDto>(`${this.apiUrl}/withdrawals`, { params });
  }

  processWithdrawal(id: string, payload: AdminProcessWithdrawalRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/withdrawals/${id}/process`, payload);
  }

  getPlatformAccount(): Observable<AdminPlatformBankAccountDto> {
    return this.http.get<AdminPlatformBankAccountDto>(`${this.apiUrl}/platform-account`);
  }

  updatePlatformAccount(payload: AdminUpsertPlatformBankAccountRequest): Observable<AdminPlatformBankAccountDto> {
    return this.http.put<AdminPlatformBankAccountDto>(`${this.apiUrl}/platform-account`, payload);
  }
}
