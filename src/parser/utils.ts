import { DataEncoding, DataLocation } from "./core";
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
 * Get the data encoding defined by a given transfer syntax.
 * Defaults to "1.2.840.10008.1.2" as defined in {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_10.1 | DICOM Part 5 Section 10.1}
 *
 * @param transferSyntax - transfer syntax in string format
 * @returns DateEncoding as speicifed for the transfer syntax
 */
export function dataEncodingForTransferSyntax(
  transferSyntax = "1.2.840.10008.1.2"
): DataEncoding {
  let implicitVR = false;
  let littleEndian = true;
  if (transferSyntax === "1.2.840.10008.1.2") {
    // Implicit VR Little Endian {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.1 | DICOM Part 5 Section A.1}
    implicitVR = true;
  } else if (transferSyntax === "1.2.840.10008.1.2.2") {
    // Explicit VR Big Endian {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.3 | DICOM Part 5 Section A.3}
    littleEndian = false;
  } else if (
    transferSyntax === "1.2.840.10008.1.2.1.99" ||
    transferSyntax === "1.2.840.10008.1.2.4.95"
  ) {
    // Deflated Explicit VR Little Endian {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.5 | DICOM Part 5 Section A.5}
    // JPIP Referenced Deflate {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.7 | DICOM Part 5 Section A.7}
    throw Error("Deflated transfer syntax is not yet implemented"); // TODO implement
  }
  return { implicitVR, littleEndian };
}
