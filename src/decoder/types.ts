import { DataEncoding } from "../parser/core";
import { ImagePixelDescription } from "../types";
export { DataEncoding } from "../parser/core";

export type PixelDataDecoder = (
  data: DataView,
  encoding: DataEncoding,
  pixelDescription: ImagePixelDescription
) => Promise<{ frames: Uint8Array[]; pixelDescription: ImagePixelDescription }>;

export type FrameDecoder = (data: DataView) => Promise<Uint8Array>;
