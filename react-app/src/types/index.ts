/**
 * Central Type Exports
 * Import all types from this file for consistency
 */

export * from "./round";
export * from "./ngo";
export * from "./transaction";
export * from "./user";
export * from "./fraction";
export * from "./donation";
export * from "./reward";
export * from "./gallery";

// Common utility types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  name: string;
  coordinates: string | Coordinates;
  description: string;
  address?: string;
  city?: string;
  country?: string;
}
