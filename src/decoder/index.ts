import { PixelDataDecoder } from "./types";
import native from "./native";
import encapsulated from "./encapsulated";
import jpegLS from "./jpeg-ls";
import jpeg2000 from "./jpeg2000";
import jpegLossless from "./jpeg-lossless";
import jpeg from "./jpeg";
import rle from "./rle";

export function pixelDecoderForTransferSyntax(
  transferSyntaxUid: string
): PixelDataDecoder | null {
  // TODO
  switch (transferSyntaxUid) {
    // Implicit VR Little Endian {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.1 | DICOM Part 5 Section A.1}
    // Little Endian Transfer Syntax (Explicit VR) {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.2 | DICOM Part 5 Section A.2}
    // Explicit VR Big Endian {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.3 | DICOM Part 5 Section A.3}
    // DICOM Deflated Little Endian Transfer Syntax (Explicit VR) {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.5 | DICOM Part 5 Section A.5}
    case "1.2.840.10008.1.2":
    case "1.2.840.10008.1.2.1":
    case "1.2.840.10008.1.2.2":
    case "1.2.840.10008.1.2.1.99":
      console.log("Native");
      return native; // "None";
    // Encapsulated Uncompressed Explicit VR Little Endian {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.4.11 | DICOM Part 5 Section A.4.11}
    case "1.2.840.10008.1.2.1.98":
      console.log("Encapsulated");
      return encapsulated; // "Encapsulated";
    // JPEG Image Compression {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.4.1 | DICOM Part 5 Section A.4.1}
    case "1.2.840.10008.1.2.4.50": // baseline
    case "1.2.840.10008.1.2.4.51": // extended
      console.log("JPEG");
      return jpeg; // "JPEG";
    case "1.2.840.10008.1.2.4.57": // lossless, non-hierarchical
    case "1.2.840.10008.1.2.4.70": // lossless, non-hierarchical, first-order prediction
      console.log("JPEG Lossless");
      return jpegLossless;
    // JPEG-LS Image Compression {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.4.3 | DICOM Part 5 Section A.4.3}
    case "1.2.840.10008.1.2.4.80": // lossless mode
    case "1.2.840.10008.1.2.4.81": // near-lossless mode
      console.log("jpegLS");
      return jpegLS;
    // JPEG 2000 Image Compression {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.4.4 | DICOM Part 5 Section A.4.4}
    case "1.2.840.10008.1.2.4.90": // Part 1 - lossless mode
    case "1.2.840.10008.1.2.4.91": // Part 1 - lossless or lossy mode
    case "1.2.840.10008.1.2.4.92": // Part 2 - lossless mode
    case "1.2.840.10008.1.2.4.93": // Part 2 - lossless or lossy mode
      console.log("jpeg2000");
      return jpeg2000;
    // JPIP Referenced Transfer Syntax (Explicit VR) {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.4.6 | DICOM Part 5 Section A.4.6}
    // JPIP Referenced Deflate Transfer Syntax (Explicit VR) {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.4.7 | DICOM Part 5 Section A.4.7}
    case "1.2.840.10008.1.2.4.94":
    case "1.2.840.10008.1.2.4.95":
      return null; // "JPIP";
    // MPEG2 Video Compression {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.4.5 | DICOM Part 5 Section A.4.5}
    case "1.2.840.10008.1.2.4.100": // Main Profile / Main Level
    case "1.2.840.10008.1.2.4.101": // Main Profile / High Level
      return null; // "MPEG2";
    // MPEG-4 AVC/H.264 High Profile / Level 4.1 Video Compression {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.4.6 | DICOM Part 5 Section A.4.6}
    // MPEG-4 AVC/H.264 High Profile / Level 4.2 Video Compression {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.4.7 | DICOM Part 5 Section A.4.7}
    // MPEG-4 AVC/H.264 Stereo High Profile / Level 4.2 Video Compression {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.4.8 | DICOM Part 5 Section A.4.8}
    case "1.2.840.10008.1.2.4.102":
    case "1.2.840.10008.1.2.4.103":
    case "1.2.840.10008.1.2.4.104":
    case "1.2.840.10008.1.2.4.105":
    case "1.2.840.10008.1.2.4.106":
      return null; // "H.264";
    // HEVC/H.265 Main Profile / Level 5.1 Video Compression {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.4.9 | DICOM Part 5 Section A.4.9}
    // HEVC/H.265 Main 10 Profile / Level 5.1 Video Compression {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.4.10 | DICOM Part 5 Section A.4.10}
    case "1.2.840.10008.1.2.4.107":
    case "1.2.840.10008.1.2.4.108":
      return null; // "H.265";
    // RLE Image Compression {@link https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_A.4.2 | DICOM Part 5 Section A.4.2}
    case "1.2.840.10008.1.2.5":
      console.log("RLE");
      return rle; // "RLE";
    default:
      console.warn(
        `Unrecognized Transfer Syntax with UID "${transferSyntaxUid}" - assuming unencoded data.`
      );
      return null; // "None";
  }
}
