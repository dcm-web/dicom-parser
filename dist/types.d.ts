/**
 * Byte ordering as defined in {https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_7.3 | Dicom Part 5 Section 7.3}.
 */
export declare type ByteOrdering = "Little Endian" | "Big Endian";
/**
 * Image Pixel Description as defined in {https://dicom.nema.org/medical/dicom/current/output/html/part03.html#table_C.7-11c | Dicom Part 3 Table C.7-11c}
 */
export declare type ImagePixelDescription = {
    samplesPerPixel: number;
    photometricInterpretation: string;
    rows: number;
    columns: number;
    bitsAllocated: number;
    bitsStored: number;
    pixelRepresentation: number;
    planarConfiguration?: number;
    smallestValue?: number;
    largestValue?: number;
    redPaletteColorLookupTableDescriptor?: [number, number, number];
    greenPaletteColorLookupTableDescriptor?: [number, number, number];
    bluePaletteColorLookupTableDescriptor?: [number, number, number];
    redPaletteColorLookupTableData: DataView;
    greenPaletteColorLookupTableData: DataView;
    bluePaletteColorLookupTableData: DataView;
};
export declare type ImagePixelTransformation = {
    windowWidth?: number;
    windowCenter?: number;
    rescaleIntercept?: number;
    rescaleSlope?: number;
};
