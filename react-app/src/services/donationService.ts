/**
 * API Layer - Donation Service
 * Handles all donation-related API calls and business logic
 */

import { APP_CONFIG, XP_SYSTEM } from "@/data/constants";
import {
  DonationRequest,
  DonationResponse,
  Currency,
  DonationAmount,
} from "@/types/donation";
import { UserLevel } from "@/types/user";

export class DonationService {
  /**
   * Calculate total price for selected fractions
   */
  static calculateTotalPrice(
    fractionCount: number,
    pricePerFraction: number
  ): number {
    return fractionCount * pricePerFraction;
  }

  /**
   * Convert currency amounts
   */
  static convertCurrency(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency
  ): number {
    if (fromCurrency === toCurrency) return amount;

    if (
      fromCurrency === APP_CONFIG.HBAR_CURRENCY &&
      toCurrency === APP_CONFIG.NGN_CURRENCY
    ) {
      return amount * APP_CONFIG.NGN_TO_HBAR_RATE;
    }

    if (
      fromCurrency === APP_CONFIG.NGN_CURRENCY &&
      toCurrency === APP_CONFIG.HBAR_CURRENCY
    ) {
      return amount / APP_CONFIG.NGN_TO_HBAR_RATE;
    }

    return amount;
  }

  /**
   * Create donation amount object
   */
  static createDonationAmount(
    amount: number,
    currency: Currency
  ): DonationAmount {
    const amountInHBAR =
      currency === APP_CONFIG.HBAR_CURRENCY
        ? amount
        : currency === APP_CONFIG.XP_CURRENCY
        ? amount / APP_CONFIG.HBAR_TO_XP_RATE
        : this.convertCurrency(amount, "NGN", "HBAR");

    const amountInNGN =
      currency === APP_CONFIG.NGN_CURRENCY
        ? amount
        : currency === APP_CONFIG.XP_CURRENCY
        ? (amount / APP_CONFIG.HBAR_TO_XP_RATE) * APP_CONFIG.NGN_TO_HBAR_RATE
        : this.convertCurrency(amount, "HBAR", "NGN");

    const amountInXP =
      currency === APP_CONFIG.XP_CURRENCY
        ? amount
        : amountInHBAR * APP_CONFIG.HBAR_TO_XP_RATE;

    return {
      amount,
      currency,
      amountInHBAR,
      amountInNGN,
      amountInXP,
    };
  }

  /**
   * Calculate XP earned from donation
   */
  static calculateXP(fractionCount: number): number {
    return fractionCount * XP_SYSTEM.PER_FRACTION;
  }

  /**
   * Calculate user level from total XP
   */
  static calculateLevel(totalXP: number): number {
    return Math.floor(totalXP / XP_SYSTEM.LEVEL_MULTIPLIER) + 1;
  }

  /**
   * Calculate XP progress to next level
   */
  static calculateLevelProgress(totalXP: number): {
    currentLevelXP: number;
    nextLevelXP: number;
    progress: number;
  } {
    const currentLevelXP = totalXP % XP_SYSTEM.LEVEL_MULTIPLIER;
    const nextLevelXP = XP_SYSTEM.LEVEL_MULTIPLIER;
    const progress = (currentLevelXP / nextLevelXP) * 100;

    return {
      currentLevelXP,
      nextLevelXP,
      progress,
    };
  }

  /**
   * Get user level details
   */
  static getUserLevel(level: number): UserLevel {
    const xpRequired = (level - 1) * XP_SYSTEM.LEVEL_MULTIPLIER;
    const xpRange = {
      min: xpRequired,
      max: xpRequired + XP_SYSTEM.LEVEL_MULTIPLIER,
    };

    const levelTitles: Record<number, string> = {
      1: "Eco Novice",
      2: "Green Starter",
      3: "Environmental Enthusiast",
      4: "Cleanup Champion",
      5: "Eco Warrior",
      6: "Planet Protector",
      7: "Sustainability Hero",
      8: "Earth Guardian",
      9: "Climate Leader",
      10: "Eco Legend",
    };

    return {
      level,
      xpRequired,
      xpRange,
      title: levelTitles[level] || `Level ${level} Hero`,
      benefits: [
        `Unlock ${level} exclusive badges`,
        `${level}x voting power multiplier`,
        "Access to special rewards",
      ],
      icon: "🌟",
    };
  }

  /**
   * Process donation transaction (mock)
   */
  static async processDonation(
    request: DonationRequest
  ): Promise<DonationResponse> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const xpEarned = this.calculateXP(request.fractionIds.length);
        const nftTokenIds = request.fractionIds.map(
          (id) => `CU-R${request.roundId}-${id.toString().padStart(3, "0")}`
        );

        resolve({
          success: true,
          transactionId: `0x${Date.now().toString(16)}`,
          xpEarned,
          nftTokenIds,
        });
      }, 1000);
    });
  }

  /**
   * Format price with currency
   */
  static formatPrice(amount: number, currency: Currency): string {
    return `${amount.toFixed(
      currency === APP_CONFIG.HBAR_CURRENCY ? 3 : 2
    )} ${currency}`;
  }

  /**
   * Calculate voting power from donation amount
   */
  static calculateVotingPower(amount: number): number {
    return Math.floor(amount * 100);
  }
}
