/**
 * Byte ordering as defined in {https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_7.3 | Dicom Part 5 Section 7.3}.
 */
export type ByteOrdering = "Little Endian" | "Big Endian";

/**
 * Image Pixel Description as defined in {https://dicom.nema.org/medical/dicom/current/output/html/part03.html#table_C.7-11c | Dicom Part 3 Table C.7-11c}
 */
export type ImagePixelDescription = {
  samplesPerPixel: number;
  photometricInterpretation: string;
  rows: number;
  columns: number;
  bitsAllocated: number;
  bitsStored: number;
  // highBit: number; - not used - shall be bitsStored - 1 anyway...
  pixelRepresentation: number;
  planarConfiguration?: number; // required if samplesPerPixel > 1
  // pixelAspectRation: [number, number] - not used
  smallestValue?: number;
  largestValue?: number;
  redPaletteColorLookupTableDescriptor?: [number, number, number];
  greenPaletteColorLookupTableDescriptor?: [number, number, number];
  bluePaletteColorLookupTableDescriptor?: [number, number, number];
  redPaletteColorLookupTableData: DataView;
  greenPaletteColorLookupTableData: DataView;
  bluePaletteColorLookupTableData: DataView;
  // ICCProfile: ? - not used
  // colorSpace: ? - not used
};

export type ImagePixelTransformation = {
  windowWidth?: number;
  windowCenter?: number;
  rescaleIntercept?: number;
  rescaleSlope?: number;
};
