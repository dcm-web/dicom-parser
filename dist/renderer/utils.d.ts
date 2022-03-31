export declare type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
export declare function toRGBA(arr: TypedArray, info: {
    columns: number;
    rows: number;
    samplesPerPixel: number;
    photometricInterpretation: string;
    planarConfiguration?: number;
    redPaletteColorLookupTableDescriptor?: [number, number, number];
    greenPaletteColorLookupTableDescriptor?: [number, number, number];
    bluePaletteColorLookupTableDescriptor?: [number, number, number];
    redPaletteColorLookupTableData?: DataView;
    greenPaletteColorLookupTableData?: DataView;
    bluePaletteColorLookupTableData?: DataView;
}): Uint8ClampedArray;
