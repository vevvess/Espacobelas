/**
 * Utility functions for handling dates consistently across the application
 * to avoid timezone issues
 */

/**
 * Converts a Date to local timezone for storage
 * This prevents the date from being shifted when converted to ISO string
 */
export function dateToLocal(date: Date): Date {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs);
}

/**
 * Formats a Date for datetime-local input, preserving local timezone
 * Fixed to show the correct local time without timezone offset issues
 */
export function formatForDateTimeInput(date: Date): string {
  // Criar uma nova data garantindo que seja no timezone local
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converts a datetime-local string to a Date object preserving local timezone
 * This prevents timezone shifting when saving/loading dates
 */
export function dateTimeLocalToDate(dateTimeLocalString: string): Date {
  // O input datetime-local retorna uma string no formato "2024-01-15T09:00"
  // Precisamos criar uma Date que preserve exatamente esse horário local
  const [datePart, timePart] = dateTimeLocalString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  // Criar Date usando o construtor que interpreta como horário local
  return new Date(year, month - 1, day, hours, minutes);
}

/**
 * Converts a Date to local ISO string for storage without timezone conversion
 * Use this instead of toISOString() to preserve local time
 */
export function toLocalISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Compares two dates ignoring time and timezone
 * Returns true if they are the same calendar day
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Creates a Date from a date string in YYYY-MM-DD format
 * without timezone conversion issues
 */
export function dateFromString(dateString: string): Date {
  // Parse as local date to avoid timezone shifts
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a Date for display in the Brazilian format
 */
export function formatDateBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Formats a Date and time for display in the Brazilian format
 */
export function formatDateTimeBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
