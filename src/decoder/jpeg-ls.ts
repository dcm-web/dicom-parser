import CharLS from "charls";
import { PixelDataDecoder } from "./types";
import { pixelDataToFragments, fragmentsToFrames } from "./utils";

const decode: PixelDataDecoder = async function (
  data,
  encoding,
  pixelDescription,
  frameNumbers
) {
  const fragments = pixelDataToFragments(data, encoding);
  let encodedFrames = fragmentsToFrames(fragments);
  if (frameNumbers) {
    encodedFrames = encodedFrames.filter((_, i) => frameNumbers.includes(i));
  }
  const frames = await Promise.all(encodedFrames.map(decodeFrame));
  return { frames, pixelDescription };
};

const decodeFrame = async function (data: DataView) {
  const charLS = await CharLS();
  const decoder = new charLS.JpegLSDecoder();

  const buffer = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const encodedBuffer = decoder.getEncodedBuffer(buffer.length);
  encodedBuffer.set(buffer);

  decoder.decode();
  return decoder.getDecodedBuffer();
};

export default decode;
