/**
 * API Layer - Round Service
 * Handles all round-related API calls and business logic
 */

import { RoundMetadata, RoundProgress } from "@/types/round";

export class RoundService {
  /**
   * Get the current active round
   */
  static getCurrentRound(): number {
    return 5; // Default to round 5
  }

  /**
   * Get total number of rounds
   */
  static getTotalRounds(): number {
    return 10; // Default total rounds
  }

  /**
   * Check if a round has ended
   */
  static isRoundEnded(roundId: number): boolean {
    return roundId < 5;
  }

  /**
   * Validate round ID
   */
  static isValidRoundId(roundId: number): boolean {
    return roundId >= 1 && roundId <= 10;
  }

  /**
   * Calculate round progress percentage
   */
  static calculateRoundProgress(roundId: number): RoundProgress {
    // Default round progress
    return {
      roundId,
      percentage: 75,
      daysRemaining: 3,
      hoursRemaining: 12,
      isEnded: false,
    };
  }
}
