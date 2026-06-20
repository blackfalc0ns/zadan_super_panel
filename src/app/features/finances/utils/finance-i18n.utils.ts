export const FINANCE_STATUS_LABEL_KEYS: Record<string, string> = {
  pending: 'FINANCES.STATUS.PENDING',
  pending_review: 'FINANCES.STATUS.PENDING_REVIEW',
  approved: 'FINANCES.STATUS.APPROVED',
  on_hold: 'FINANCES.STATUS.ON_HOLD',
  processing: 'FINANCES.STATUS.PROCESSING',
  paid: 'FINANCES.STATUS.PAID',
  settled: 'FINANCES.STATUS.SETTLED',
  failed: 'FINANCES.STATUS.FAILED',
  reversed: 'FINANCES.STATUS.REVERSED',
  disputed: 'FINANCES.STATUS.DISPUTED',
  open: 'FINANCES.STATUS.OPEN',
  under_review: 'FINANCES.STATUS.UNDER_REVIEW',
  rejected: 'FINANCES.STATUS.REJECTED',
  escalated: 'FINANCES.STATUS.ESCALATED',
  collected: 'FINANCES.STATUS.COLLECTED',
  overdue: 'FINANCES.STATUS.OVERDUE',
  pending_approval: 'FINANCES.STATUS.PENDING_APPROVAL'
};

export const FINANCE_ENTITY_LABEL_KEYS: Record<string, string> = {
  vendor: 'FINANCES.ENTITIES.VENDOR',
  driver: 'FINANCES.ENTITIES.DRIVER',
  order: 'FINANCES.ENTITIES.ORDER',
  platform: 'FINANCES.ENTITIES.PLATFORM',
  customer: 'FINANCES.ENTITIES.CUSTOMER'
};

export const FINANCE_LEDGER_TYPE_LABEL_KEYS: Record<string, string> = {
  commission: 'FINANCES.LEDGER.TYPES.COMMISSION',
  payout: 'FINANCES.LEDGER.TYPES.PAYOUT',
  refund: 'FINANCES.LEDGER.TYPES.REFUND',
  settlement: 'FINANCES.LEDGER.TYPES.SETTLEMENT',
  adjustment: 'FINANCES.LEDGER.TYPES.ADJUSTMENT',
  service_fee: 'FINANCES.LEDGER.TYPES.SERVICE_FEE',
  delivery_fee: 'FINANCES.LEDGER.TYPES.DELIVERY_FEE',
  vat: 'FINANCES.LEDGER.TYPES.VAT',
  bonus: 'FINANCES.LEDGER.TYPES.BONUS',
  penalty: 'FINANCES.LEDGER.TYPES.PENALTY',
  cod_collection: 'FINANCES.LEDGER.TYPES.COD_COLLECTION'
};

export const FINANCE_DIRECTION_LABEL_KEYS: Record<string, string> = {
  credit: 'FINANCES.DIRECTIONS.CREDIT',
  debit: 'FINANCES.DIRECTIONS.DEBIT'
};

export const FINANCE_WALLET_TXN_TYPE_LABEL_KEYS: Record<string, string> = {
  credit: 'FINANCES.WALLET_DETAILS.TXN_TYPES.CREDIT',
  debit: 'FINANCES.WALLET_DETAILS.TXN_TYPES.DEBIT',
  hold: 'FINANCES.WALLET_DETAILS.TXN_TYPES.HOLD',
  release: 'FINANCES.WALLET_DETAILS.TXN_TYPES.RELEASE',
  adjustment: 'FINANCES.WALLET_DETAILS.TXN_TYPES.ADJUSTMENT',
  payout: 'FINANCES.WALLET_DETAILS.TXN_TYPES.PAYOUT',
  cashcollected: 'FINANCES.WALLET_DETAILS.TXN_TYPES.CASHCOLLECTED',
  settlement: 'FINANCES.WALLET_DETAILS.TXN_TYPES.SETTLEMENT',
  refund: 'FINANCES.WALLET_DETAILS.TXN_TYPES.REFUND',
  orderrevenue: 'FINANCES.WALLET_DETAILS.TXN_TYPES.ORDERREVENUE'
};

export const FINANCE_WALLET_REFERENCE_TYPE_LABEL_KEYS: Record<string, string> = {
  journalline: 'FINANCES.WALLET_DETAILS.REFERENCE_TYPES.JOURNALLINE',
  driverwithdrawalrequest: 'FINANCES.WALLET_DETAILS.REFERENCE_TYPES.DRIVERWITHDRAWALREQUEST',
  driverwithdrawal: 'FINANCES.WALLET_DETAILS.REFERENCE_TYPES.DRIVERWITHDRAWAL',
  settlement: 'FINANCES.WALLET_DETAILS.REFERENCE_TYPES.SETTLEMENT',
  vendorholdrecovery: 'FINANCES.WALLET_DETAILS.REFERENCE_TYPES.VENDORHOLDRECOVERY',
  order: 'FINANCES.WALLET_DETAILS.REFERENCE_TYPES.ORDER'
};

export function resolveWalletTxnTypeLabel(type: string): string {
  const normalized = type.replace(/\s+/g, '').replace(/_/g, '').toLowerCase();
  return FINANCE_WALLET_TXN_TYPE_LABEL_KEYS[normalized] ?? 'FINANCES.WALLET_DETAILS.TXN_TYPES.UNKNOWN';
}

export function resolveWalletReferenceTypeLabel(referenceType: string): string {
  const normalized = referenceType.replace(/\s+/g, '').replace(/_/g, '').replace(/-/g, '').toLowerCase();
  return FINANCE_WALLET_REFERENCE_TYPE_LABEL_KEYS[normalized] ?? 'FINANCES.WALLET_DETAILS.REFERENCE_TYPES.UNKNOWN';
}

export function resolveWalletOwnerEntityLabel(ownerType: string): string {
  const normalized = ownerType.replace(/\s+/g, '').toLowerCase();
  return FINANCE_ENTITY_LABEL_KEYS[normalized] ?? 'FINANCES.ENTITIES.PLATFORM';
}

export const FINANCE_MONTH_LABEL_KEYS: Record<string, string> = {
  Jan: 'FINANCES.MONTHS.JAN',
  Feb: 'FINANCES.MONTHS.FEB',
  Mar: 'FINANCES.MONTHS.MAR',
  Apr: 'FINANCES.MONTHS.APR',
  May: 'FINANCES.MONTHS.MAY',
  Jun: 'FINANCES.MONTHS.JUN',
  Jul: 'FINANCES.MONTHS.JUL',
  Aug: 'FINANCES.MONTHS.AUG',
  Sep: 'FINANCES.MONTHS.SEP',
  Oct: 'FINANCES.MONTHS.OCT',
  Nov: 'FINANCES.MONTHS.NOV',
  Dec: 'FINANCES.MONTHS.DEC'
};

export function getFinanceLocale(lang?: string): string {
  return lang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-SA';
}

