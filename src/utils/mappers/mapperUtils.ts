
/**
 * Safely converts a value to a string
 */
export function safeString(value: any): string {
  return value ? String(value) : '';
}

/**
 * Safely converts a value to a boolean
 */
export function safeBoolean(value: any): boolean {
  return !!value;
}

/**
 * Safely converts a value to a Date object
 */
export function safeDate(value: any): Date {
  if (!value) return new Date();
  return new Date(String(value));
}

/**
 * Safely handles array values, ensuring they are arrays and optionally
 * converting elements to the specified type
 */
export function safeArray<T>(value: any, converter?: (item: any) => T): T[] {
  if (!value || !Array.isArray(value)) return [];
  
  if (converter) {
    return value.map(converter);
  }
  
  return value as T[];
}

/**
 * Safely handles enum values, ensuring they match one of the allowed values
 */
export function safeEnum<T extends string>(value: any, allowedValues: T[], defaultValue: T): T {
  if (!value) return defaultValue;
  
  const stringValue = String(value);
  return allowedValues.includes(stringValue as T) 
    ? stringValue as T 
    : defaultValue;
}
