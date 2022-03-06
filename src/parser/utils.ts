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
  let end = str.length - 1;
  while (str.charAt(end) === "\0") end--;
  return str.substring(0, end + 1);
}

/**
 * Decode a String encoded with the "Default Character Repertoire".
 *
 * @param dataView - DataView containing the encoded String
 * @returns Decoded string.
 */
export function decodeString(dataView: DataView): string {
  const decoder = new TextDecoder("windows-1252");
  return decoder.decode(dataView);
}
