import { DataEncoding } from "../parser/core";
export { DataEncoding } from "../parser/core";

export type TypedArray = Uint8Array | Uint16Array;

export type PixelDataDecoder = (
  data: DataView,
  encoding: DataEncoding
) => Promise<TypedArray[]>;

export type FrameDecoder = (data: DataView) => Promise<TypedArray>;
