/**
 * Fraction Types - Represents fractional ownership of cleanup sites
 */

export interface Fraction {
  id: number;
  position: number;
  x: number;
  y: number;
  width: number;
  height: number;
  donated: boolean;
  notAllowed?: boolean;
  price: number;
  tokenId?: number;
  donor?: string;
  roundId: number;
  nftMetadata?: FractionNFTMetadata;
}

export interface FractionNFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface FractionSelection {
  fractionIds: number[];
  totalPrice: number;
  totalCount: number;
}

export interface FractionGrid {
  rows: number;
  cols: number;
  fractions: Fraction[];
  totalFractions: number;
  donatedCount: number;
  availableCount: number;
}
