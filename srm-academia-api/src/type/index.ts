// Export all types from their respective modules
export * from "./auth";
export * from "./timetable";
export * from "./marks";
export * from "./calendar";
export * from "./course";
export * from "./attendance";
export * from "./user";
export * from "./common";

// Legacy exports for backward compatibility
export type { PasswordInput, UserResponse } from "./auth";
