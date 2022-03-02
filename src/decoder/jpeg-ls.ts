import CharLS from "charls";
import { FrameDecoder, PixelDataDecoder } from "./types";
import { pixelDataToFragments, fragmentsToFrames } from "./utils";

const decode: PixelDataDecoder = async function (data, encoding) {
  const fragments = pixelDataToFragments(data, encoding);
  const frames = fragmentsToFrames(fragments);
  return Promise.all(frames.map(decodeFrame));
};

const decodeFrame: FrameDecoder = async function (data) {
  const charLS = await CharLS();
  const decoder = new charLS.JpegLSDecoder();

  const buffer = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const encodedBuffer = decoder.getEncodedBuffer(buffer.length);
  encodedBuffer.set(buffer);

  decoder.decode();
  return decoder.getDecodedBuffer();
};

export default decode;