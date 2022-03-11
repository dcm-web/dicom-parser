import { DataEncoding } from "../parser/core";
export { DataEncoding } from "../parser/core";

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

export type PixelDataDecoder = (
  data: DataView,
  encoding: DataEncoding
) => Promise<Uint8Array[]>;

export type FrameDecoder = (data: DataView) => Promise<Uint8Array>;
