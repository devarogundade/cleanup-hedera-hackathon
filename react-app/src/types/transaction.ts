/**
 * Transaction Types
 */

export type TransactionType = "in" | "out";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  message: string;
  date: string;
  txHash: string;
  blockNumber?: number;
  status?: "pending" | "confirmed" | "failed";
}

export interface TransactionStats {
  totalDonations: number;
  totalWithdrawals: number;
  netBalance: number;
  transactionCount: number;
}

export interface TransactionFilter {
  type: "all" | TransactionType;
  startDate?: string;
  endDate?: string;
}
