# TypeScript Types Documentation

This directory contains all TypeScript type definitions for the CleanUp application.

## Type Structure

### Core Types

#### `round.ts`
- `RoundMetadata`: Complete information about a cleanup round
- `RoundStats`: Statistics for a specific round
- `RoundProgress`: Progress tracking for rounds

#### `ngo.ts`
- `NGO`: NGO organization information
- `NGOWithPercentage`: NGO with calculated vote percentage
- `WinningNGO`: Information about the winning NGO for a round

#### `transaction.ts`
- `Transaction`: Blockchain transaction details
- `TransactionStats`: Aggregated transaction statistics
- `TransactionFilter`: Filter options for transaction lists
- `TransactionType`: "in" | "out"

#### `user.ts`
- `UserProfile`: User account information
- `UserStats`: User gamification stats (XP, level, achievements)
- `UserLevel`: Level definition with requirements and benefits

#### `fraction.ts`
- `Fraction`: Fractional ownership of cleanup sites
- `FractionNFTMetadata`: NFT metadata for fractions
- `FractionSelection`: Selected fractions for donation
- `FractionGrid`: Grid layout information

#### `donation.ts`
- `Donation`: Complete donation record
- `DonationAmount`: Multi-currency amount representation
- `DonationStats`: User donation statistics
- `DonationRequest`: Request payload for donations
- `DonationResponse`: Response from donation processing
- `Currency`: "HBAR" | "NGN"

#### `reward.ts`
- `Reward`: Reward/achievement information
- `Achievement`: Achievement details
- `RewardStats`: Reward statistics
- `RewardType`: "badge" | "achievement" | "reward"
- `RewardStatus`: "locked" | "available" | "claimed"

#### `gallery.ts`
- `GalleryPhoto`: Photo metadata for round galleries
- `GalleryCollection`: Collection of photos for a round

### Common Types (`index.ts`)

- `ApiResponse<T>`: Standard API response wrapper
- `PaginatedResponse<T>`: Paginated data response
- `DateRange`: Date range selection
- `Coordinates`: Geographic coordinates
- `Location`: Location information

## Usage Examples

### Importing Types

```typescript
// Import specific types
import { RoundMetadata, NGO, Transaction } from "@/types";

// Import from specific file
import { Fraction, FractionSelection } from "@/types/fraction";
```

### Using Types in Components

```typescript
import type { Reward, RewardType } from "@/types/reward";

const rewards: Reward[] = [
  {
    id: 1,
    title: "Early Supporter",
    description: "First donation",
    type: "badge" as RewardType,
    claimed: false,
    status: "available",
    value: "NFT Badge",
    progress: "1/1",
    progressCurrent: 1,
    progressTotal: 1,
    earnedDate: null,
  },
];
```

### Using Types in Services

```typescript
import { DonationRequest, DonationResponse } from "@/types/donation";

class DonationService {
  static async processDonation(
    request: DonationRequest
  ): Promise<DonationResponse> {
    // Implementation
  }
}
```

## Best Practices

1. **Always import types using `type` keyword for type-only imports**
   ```typescript
   import type { NGO } from "@/types";
   ```

2. **Use const assertions for literal types**
   ```typescript
   type: "badge" as const
   ```

3. **Prefer interfaces over types for object shapes**
   ```typescript
   interface UserProfile {
     // ...
   }
   ```

4. **Use union types for enums**
   ```typescript
   type Currency = "HBAR" | "NGN";
   ```

5. **Make optional fields explicit**
   ```typescript
   earnedDate?: string | null;
   ```

## Type Safety Guidelines

- All API responses should use `ApiResponse<T>` or `PaginatedResponse<T>`
- All user input should be validated against types
- Use strict TypeScript configuration
- Avoid `any` type - use `unknown` instead
- Use type guards for runtime type checking

## Adding New Types

1. Create a new file in `src/types/` if it's a new domain
2. Export all types from the file
3. Re-export from `src/types/index.ts`
4. Update this README with documentation
5. Update relevant services to use the new types

## Type Validation

For runtime validation, consider using:
- Zod schemas for form validation
- Type guards for API responses
- TypeScript's built-in utility types

## Related Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
