import { DataEncoding } from "./types";
export declare function pixelDataToFragments(data: DataView, encoding: DataEncoding): DataView[];
export declare function fragmentsToFrames(data: DataView[], expected?: number): DataView[];
export declare function concatDataViews(dataViews: DataView[]): DataView;
export declare function concatUint8Array(arrays: Uint8Array[]): Uint8Array;
export declare function interleaveUint8Array(arrays: Uint8Array[]): Uint8Array;
