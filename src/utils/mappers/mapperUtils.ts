
/**
 * Utility functions to safely convert database values to the appropriate types for our forms
 */

/**
 * Convert a value to a string, providing a default if null or undefined
 */
export function safeString(value: any, defaultValue: string = ""): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return String(value);
}

/**
 * Convert a value to a boolean, providing a default if null or undefined
 */
export function safeBoolean(value: any, defaultValue: boolean = false): boolean {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return Boolean(value);
}

/**
 * Convert a string date to a Date object, providing a default if null or undefined
 */
export function safeDate(value: any, defaultValue: Date = new Date()): Date {
  if (!value) {
    return defaultValue;
  }
  try {
    return new Date(value);
  } catch (e) {
    console.error("Error parsing date:", e);
    return defaultValue;
  }
}

/**
 * Convert an array value, providing a default if null or undefined
 */
export function safeArray<T>(value: any, mapFn: (item: any) => T, defaultValue: T[] = []): T[] {
  if (!value || !Array.isArray(value)) {
    return defaultValue;
  }
  return value.map(mapFn);
}

/**
 * Safely convert a value to an enum type, with fallback to default
 */
export function safeEnum<T extends string>(
  value: any, 
  allowedValues: T[], 
  defaultValue: T
): T {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  const strValue = String(value);
  if (allowedValues.includes(strValue as T)) {
    return strValue as T;
  }
  
  return defaultValue;
}
