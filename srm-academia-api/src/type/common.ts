// Common Types and Utilities
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export interface ErrorResponse {
  error: string;
  status: number;
}

export interface SuccessResponse<T> {
  data: T;
  status: number;
}

// HTTP Response Types
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// Generic Result Type
export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

// Utility Types
export type NonNullable<T> = T extends null | undefined ? never : T;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
