import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
  payoutId: string | null;
  providerName: string | null;
  providerTransferId: string | null;
  payoutDay: string | null;
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

export interface AdminProcessWithdrawalResultDto {
  withdrawalId: string;
  withdrawalStatus: string;
  payoutId: string | null;
  payoutStatus: string | null;
  manualWorkflowRequired: boolean;
  manualClaimEndpoint: string | null;
  manualBankSubmissionEndpoint: string | null;
  manualConfirmationEndpoint: string | null;
  transferReference: string | null;
  failureReason: string | null;
}

export interface AdminPayoutExecutionReservationDto {
  id: string;
  mode: string;
  status: string;
  claimedByUserId: string | null;
  claimedAtUtc: string;
  submittedByUserId: string | null;
  submittedAtUtc: string | null;
  submissionReference: string | null;
  releasedByUserId: string | null;
  releasedAtUtc: string | null;
  releaseReason: string | null;
}

export interface AdminPayoutDto {
  id: string;
  settlementId: string;
  ownerType: string;
  ownerId: string;
  amount: number;
  status: string;
  providerName: string;
  providerTransferId: string | null;
  providerSequenceNumber: string | null;
  transferReference: string | null;
  failureReason: string | null;
  triggeredAtUtc: string | null;
  completedAtUtc: string | null;
  processedByUserId: string | null;
  manualConfirmation: {
    id: string;
    transferReference: string;
    proofAttachmentId: string | null;
    hasLegacyProof: boolean;
    confirmedByUserId: string;
    confirmedAtUtc: string;
  } | null;
  executionReservation: AdminPayoutExecutionReservationDto | null;
  reversal?: {
    id: string;
    returnReference: string;
    proofAttachmentId: string | null;
    hasLegacyProof: boolean;
    reason: string | null;
    confirmedByUserId: string;
    confirmedAtUtc: string;
  } | null;
  destinationMaskedLabel?: string | null;
  scheduledPayoutDay?: string | null;
}

export interface AdminPayoutProofAttachmentDto {
  id: string;
  payoutId: string;
  kind: 'ManualTransfer' | 'ReturnedFunds';
  fileName: string;
  contentType: string;
  contentLength: number;
  sha256: string;
  uploadedByUserId: string;
  uploadedAtUtc: string;
  isFinalized: boolean;
  finalizedByUserId: string | null;
  finalizedAtUtc: string | null;
}

export interface AdminPayoutDetailDto {
  payout: AdminPayoutDto;
  attempts: Array<{
    id: string;
    attemptType: string;
    status: string;
    providerName: string;
    providerTransferId: string | null;
    transferReference: string | null;
    failureReason: string | null;
    createdAtUtc: string;
  }>;
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

export type SettlementProcessingMode = 'Manual' | 'Automatic';

export const SETTLEMENT_PAYOUT_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const;

export type SettlementPayoutDay = (typeof SETTLEMENT_PAYOUT_DAYS)[number];

export const DEFAULT_SETTLEMENT_PAYOUT_DAYS: readonly SettlementPayoutDay[] = ['Monday', 'Thursday'];

export interface AdminSettlementProcessingSettingsDto {
  settlementProcessingMode: SettlementProcessingMode;
  payoutDays: SettlementPayoutDay[];
  requireManualPayoutDualControl: boolean;
  updatedByUserId: string | null;
  updatedAtUtc: string;
  /** Optimistic-concurrency token returned by the settings endpoint. */
  rowVersion: string;
}

export interface AdminUpdateSettlementProcessingSettingsRequest {
  settlementProcessingMode: SettlementProcessingMode;
  payoutDays: SettlementPayoutDay[];
  requireManualPayoutDualControl?: boolean;
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

  processWithdrawal(id: string, payload: AdminProcessWithdrawalRequest): Observable<AdminProcessWithdrawalResultDto> {
    return this.http.post<AdminProcessWithdrawalResultDto>(`${this.apiUrl}/withdrawals/${id}/process`, payload);
  }

  getPayoutDetail(payoutId: string): Observable<AdminPayoutDetailDto> {
    return this.http.get<AdminPayoutDetailDto>(`${environment.apiUrl}/admin/payouts/${payoutId}`);
  }

  claimManualPayout(payoutId: string): Observable<AdminPayoutDto> {
    return this.http.post<AdminPayoutDto>(`${environment.apiUrl}/admin/payouts/${payoutId}/manual-claim`, {});
  }

  recordManualBankSubmission(payoutId: string, bankSubmissionReference: string): Observable<AdminPayoutDto> {
    return this.http.post<AdminPayoutDto>(
      `${environment.apiUrl}/admin/payouts/${payoutId}/manual-bank-submission`,
      { bankSubmissionReference }
    );
  }

  confirmManualPayout(payoutId: string, transferReference: string, proofAttachmentId: string): Observable<AdminPayoutDto> {
    return this.http.post<AdminPayoutDto>(`${environment.apiUrl}/admin/payouts/${payoutId}/confirm-manual`, {
      transferReference,
      proofAttachmentId
    });
  }

  uploadManualPayoutProof(payoutId: string, file: File): Observable<AdminPayoutProofAttachmentDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', 'ManualTransfer');

    return this.http.post<AdminPayoutProofAttachmentDto>(
      `${environment.apiUrl}/admin/payouts/${payoutId}/proofs`,
      formData
    );
  }

  downloadManualPayoutProof(payoutId: string, attachmentId: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/admin/payouts/${payoutId}/proofs/${attachmentId}`, {
      responseType: 'blob'
    });
  }

  getPlatformAccount(): Observable<AdminPlatformBankAccountDto> {
    return this.http.get<AdminPlatformBankAccountDto>(`${this.apiUrl}/platform-account`);
  }

  updatePlatformAccount(payload: AdminUpsertPlatformBankAccountRequest): Observable<AdminPlatformBankAccountDto> {
    return this.http.put<AdminPlatformBankAccountDto>(`${this.apiUrl}/platform-account`, payload);
  }

  getSettlementProcessingSettings(): Observable<AdminSettlementProcessingSettingsDto> {
    return this.http.get<AdminSettlementProcessingSettingsDto>(`${environment.apiUrl}/admin/payouts/processing-settings`);
  }

  updateSettlementProcessingSettings(
    payload: AdminUpdateSettlementProcessingSettingsRequest,
    rowVersion: string
  ): Observable<AdminSettlementProcessingSettingsDto> {
    return this.http.put<AdminSettlementProcessingSettingsDto>(
      `${environment.apiUrl}/admin/payouts/processing-settings`,
      payload,
      {
        // The API rejects blind writes. Keep the quotes required by the HTTP
        // ETag grammar while the backend decodes the base64 row version.
        headers: new HttpHeaders({ IfMatch: `"${rowVersion}"` })
      }
    );
  }
}
