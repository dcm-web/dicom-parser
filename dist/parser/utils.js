"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeString = exports.stringTrimNull = void 0;
/**
 * Trim trailing null characters (\\0) from a string.
 *
 * @param str - String to trim the trailing null characters of.
 * @returns Trimmed string.
 */
function stringTrimNull(str) {
    let end = str.length - 1;
    while (str.charAt(end) === "\0")
        end--;
    return str.substring(0, end + 1);
}
exports.stringTrimNull = stringTrimNull;
/**
 * Decode a String encoded with the "Default Character Repertoire".
 *
 * @param dataView - DataView containing the encoded String
 * @returns Decoded string.
 */
function decodeString(dataView) {
    const decoder = new TextDecoder("windows-1252");
    return decoder.decode(dataView);
}
exports.decodeString = decodeString;
