/**
 * Trim trailing null characters (\\0) from a string.
 *
 * @param str - String to trim the trailing null characters of.
 * @returns Trimmed string.
 */
export declare function stringTrimNull(str: string): string;
/**
 * Decode a String encoded with the "Default Character Repertoire".
 *
 * @param dataView - DataView containing the encoded String
 * @returns Decoded string.
 */
export declare function decodeString(dataView: DataView): string;
