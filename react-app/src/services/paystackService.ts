/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Paystack Payment Service
 * Handles NGN payment processing via Paystack
 */

import Paystack from "@paystack/inline-js";

interface PaystackPaymentParams {
  email: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
  onSuccess: (transaction: any) => void;
  onClose?: () => void;
}

export class PaystackService {
  private static popup: Paystack | null = null;

  /**
   * Initialize Paystack payment popup
   */
  static initializePayment(params: PaystackPaymentParams): void {
    const { email, amount, currency, metadata, onSuccess, onClose } = params;

    // Create new Paystack popup instance
    this.popup = new Paystack();

    // Initialize transaction
    this.popup.newTransaction({
      key: import.meta.env.VITE_PAYSTACK_PK_KEY,
      email,
      amount: Math.round(amount * 100), // Convert to kobo (smallest currency unit)
      currency,
      metadata: {
        ...metadata,
        custom_fields: [
          {
            display_name: "Donation Type",
            variable_name: "donation_type",
            value: "Environmental Cleanup",
          },
        ],
      },
      onSuccess: (transaction) => {
        console.log("Payment successful:", transaction);
        onSuccess(transaction);
      },
      onCancel: () => {
        console.log("Payment cancelled by user");
        if (onClose) onClose();
      },
    });
  }

  /**
   * Verify Paystack transaction (to be called from backend)
   * This is a placeholder - actual verification should be done server-side
   */
  static async verifyTransaction(reference: string): Promise<boolean> {
    // In a real implementation, this should call your backend endpoint
    // which then verifies the transaction with Paystack's API
    console.log("Verifying transaction:", reference);
    return true;
  }

  /**
   * Format amount for display (from kobo to naira)
   */
  static formatAmount(amountInKobo: number): string {
    return (amountInKobo / 100).toFixed(2);
  }

  /**
   * Convert amount to kobo (smallest currency unit)
   */
  static toKobo(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Convert kobo to naira
   */
  static toNaira(amountInKobo: number): number {
    return amountInKobo / 100;
  }
}
