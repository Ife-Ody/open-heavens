export interface DataPoint {
  [key: string]: string | number;
}

export function convertToCSV(data: DataPoint[]): string {
  // Extract the keys (headers) from the first object
  const headers = Object.keys(data[0]);

  // Create an array of rows
  const rows = data.map((obj) => {
    // Convert each object to an array of values, escaping quotes and wrapping in double quotes
    return headers.map((key) => {
      const value = obj[key];
      if (typeof value === "string") {
        return value.replace(/,/g, "").replace(/"/g, "");
      }
      return value;
    });
  });

  // Prepend the headers to the rows
  rows.unshift(headers);

  // Join the rows into a CSV string
  return rows.map((row) => row.join(",")).join("\n");
}
