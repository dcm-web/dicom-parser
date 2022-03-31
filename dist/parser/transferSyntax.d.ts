import { ByteOrdering } from "../types";
/**
 * A Transfer Syntax is a set of encoding rules as defined in {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#chapter_10 | Dicom Part 5 Section 10}.
 */
export declare type TransferSyntax = {
    uid: string;
    byteOrdering: ByteOrdering;
    implicitVR: boolean;
    deflated: boolean;
};
/**
 * Get the Transfer Syntax for a UID.
 *
 * @param uid - UID of the Transfer Syntax
 * @returns Transfer Syntax as defined for the given UID
 */
export declare function transferSyntaxFromUid(uid: string): TransferSyntax;
