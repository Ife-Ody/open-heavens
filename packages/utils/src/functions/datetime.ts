/**
 * Converts a `Date` object or timestamp to an ISO 8601 formatted string.
 * The format returned is `YYYY-MM-DDTHH:MM:SS`, which excludes milliseconds.
 * Useful for Google Sheets
 * @param {Date | number} date - The date to format, which can be a `Date` object or a Unix timestamp (in milliseconds).
 * @returns {string} The formatted date-time string in `YYYY-MM-DDTHH:MM:SS` format.
 *
 * @example
 * // Passing a Date object
 * datetime(new Date(2023, 0, 1, 12, 0, 0)); // "2023-01-01T12:00:00"
 *
 * @example
 * // Passing a Unix timestamp
 * datetime(1672531200000); // "2023-01-01T12:00:00"
 */
export function datetime(date: Date | number): string {
  if (!date) return ''
  if (typeof date === "number") {
    date = new Date(date);
  }

  // Use toISOString to get date in the format "YYYY-MM-DDTHH:MM:SS.sssZ"
  return date.toISOString().split('.')[0]; // Removes milliseconds for "YYYY-MM-DDTHH:MM:SS"
}
