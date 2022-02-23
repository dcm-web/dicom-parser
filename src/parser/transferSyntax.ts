/**
 * A Transfer Syntax is a set of encoding rules as defined in {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#chapter_10 | Dicom Part 5 Section 10}.
 */
export type TransferSyntax = {
  uid: string;
  byteOrdering: ByteOrdering;
  implicitVR: boolean;
  deflated: boolean;
};

/**
 * Byte ordering as defined in {https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_7.3 | Dicom Part 5 Section 7.3}.
 */
export type ByteOrdering = "Little Endian" | "Big Endian";

/**
 * Get the Transfer Syntax for a UID.
 *
 * @param uid - UID of the Transfer Syntax
 * @returns Transfer Syntax as defined for the given UID
 */
export function transferSyntaxFromUid(uid: string): TransferSyntax {
  return {
    uid: uid,
    // 1.2.2 = Explicit VR Big Endian {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.3 | DICOM Part 5 Section A.3}
    byteOrdering:
      uid === "1.2.840.10008.1.2.2" ? "Big Endian" : "Little Endian",
    // 1.2 = Implicit VR Little Endian {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.1 | DICOM Part 5 Section A.1}
    implicitVR: uid === "1.2.840.10008.1.2",
    // 1.2.1.99 = Deflated Little Endian Transfer Syntax (Explicit VR) {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.5 | DICOM Part 5 Section A.5}
    // 1.2.4.95 = JPIP Referenced Deflate Transfer Syntax (Explicit VR) {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.4.7 | DICOM Part 5 Section A.4.7}
    deflated:
      uid === "1.2.840.10008.1.2.1.99" || uid === "1.2.840.10008.1.2.4.95",
  };
}
