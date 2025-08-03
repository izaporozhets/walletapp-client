export interface Wallet {
  id: string;
  balance: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';
  amount: string;
  balanceAfterTransaction: string;
  status: string;
  requestId: string;
  createdAt: string;
  updatedAt: string;
}
