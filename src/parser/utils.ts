import { DataLocation } from "./core";
/**
 * Create a new DataView at the DataLocation.
 *
 * @param data - The DataView to create a new DataView of.
 * @param dataLocation - The DataLocation to create the new DataView at.
 * @returns DataView at Location.
 */
export function dataViewAtLocation(
  data: DataView,
  dataLocation: DataLocation
): DataView {
  return new DataView(
    data.buffer,
    data.byteOffset + dataLocation.offset,
    dataLocation.length
  );
}

/**
 * Trim trailing null characters (\\0) from a string.
 *
 * @param str - String to trim the trailing null characters of.
 * @returns Trimmed string.
 */
export function stringTrimNull(str: string) {
  let nullChars = 0;
  while (str.charAt(str.length - 1 - nullChars) === "\0") {
    nullChars++;
  }
  return str.slice(0, -nullChars);
}
