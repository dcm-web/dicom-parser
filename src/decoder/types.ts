import { DataEncoding } from "../parser/core";
export { DataEncoding } from "../parser/core";

export type PixelDataDecoder = (
  data: DataView,
  encoding: DataEncoding
) => Promise<Uint8Array[]>;

export type FrameDecoder = (data: DataView) => Promise<Uint8Array>;
