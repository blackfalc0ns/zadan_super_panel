export interface WalletMemoTranslation {
  key: string;
  params?: Record<string, string>;
}

export function resolveWalletMemo(description: string | null | undefined): WalletMemoTranslation | null {
  if (!description?.trim()) {
    return null;
  }

  const text = description.trim();
  const uuid = '([0-9a-f-]{36})';
  const orderRef = '(.+)';

  const patterns: Array<{ regex: RegExp; key: string; groups: string[] }> = [
    { regex: new RegExp(`^Payout paid ${uuid}$`, 'i'), key: 'FINANCES.WALLET_DETAILS.MEMOS.PAYOUT_PAID', groups: ['id'] },
    { regex: new RegExp(`^Platform cash payout ${uuid}$`, 'i'), key: 'FINANCES.WALLET_DETAILS.MEMOS.PLATFORM_CASH_PAYOUT', groups: ['id'] },
    { regex: new RegExp(`^Expected COD receivable for order ${orderRef}$`, 'i'), key: 'FINANCES.WALLET_DETAILS.MEMOS.COD_RECEIVABLE', groups: ['order'] },
    { regex: new RegExp(`^Expected customer advance clearing for order ${orderRef}$`, 'i'), key: 'FINANCES.WALLET_DETAILS.MEMOS.CUSTOMER_ADVANCE_CLEARING', groups: ['order'] },
    { regex: new RegExp(`^Revenue reconciliation delta for order ${orderRef}$`, 'i'), key: 'FINANCES.WALLET_DETAILS.MEMOS.REVENUE_RECONCILIATION_DELTA', groups: ['order'] },
    { regex: new RegExp(`^Gateway receivable on payment captured for order ${orderRef}$`, 'i'), key: 'FINANCES.WALLET_DETAILS.MEMOS.GATEWAY_RECEIVABLE', groups: ['order'] },
    { regex: new RegExp(`^Customer advance recognised for order ${orderRef}$`, 'i'), key: 'FINANCES.WALLET_DETAILS.MEMOS.CUSTOMER_ADVANCE_RECOGNISED', groups: ['order'] },
    { regex: new RegExp(`^Customer advance recognized for order ${orderRef}$`, 'i'), key: 'FINANCES.WALLET_DETAILS.MEMOS.CUSTOMER_ADVANCE_RECOGNISED', groups: ['order'] },
    { regex: new RegExp(`^COD cash collected for order ${orderRef}$`, 'i'), key: 'FINANCES.WALLET_DETAILS.MEMOS.COD_CASH_COLLECTED', groups: ['order'] },
    { regex: new RegExp(`^Customer advance cleared for order ${orderRef}$`, 'i'), key: 'FINANCES.WALLET_DETAILS.MEMOS.CUSTOMER_ADVANCE_CLEARED', groups: ['order'] },
    { regex: new RegExp(`^Vendor payable for order ${orderRef}$`, 'i'), key: 'FINANCES.WALLET_DETAILS.MEMOS.VENDOR_PAYABLE', groups: ['order'] },
    { regex: new RegExp(`^Driver payable for order ${orderRef}$`, 'i'), key: 'FINANCES.WALLET_DETAILS.MEMOS.DRIVER_PAYABLE', groups: ['order'] },
    { regex: new RegExp(`^Platform revenue for order ${orderRef}$`, 'i'), key: 'FINANCES.WALLET_DETAILS.MEMOS.PLATFORM_REVENUE', groups: ['order'] },
    { regex: new RegExp(`^Tax payable for order ${orderRef}$`, 'i'), key: 'FINANCES.WALLET_DETAILS.MEMOS.TAX_PAYABLE', groups: ['order'] },
    { regex: /^Driver withdrawal approved for transfer$/i, key: 'FINANCES.WALLET_DETAILS.MEMOS.DRIVER_WITHDRAWAL_APPROVED', groups: [] }
  ];

  for (const { regex, key, groups } of patterns) {
    const match = regex.exec(text);
    if (!match) {
      continue;
    }

    const params: Record<string, string> = {};
    groups.forEach((name, index) => {
      params[name] = match[index + 1];
    });

    return { key, params: groups.length > 0 ? params : undefined };
  }

  return null;
}
