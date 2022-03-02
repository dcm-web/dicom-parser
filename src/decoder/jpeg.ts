import { default as LibJpegTurboPromise, JPEGDecoder } from "libjpeg-turbo";
import { FrameDecoder, PixelDataDecoder } from "./types";
import { pixelDataToFragments, fragmentsToFrames } from "./utils";

let decoder: JPEGDecoder;

const decode: PixelDataDecoder = async function (data, encoding) {
  const fragments = pixelDataToFragments(data, encoding);
  const frames = fragmentsToFrames(fragments);
  const decoded = [];
  for (const frame of frames) {
    decoded.push(await decodeFrame(frame));
  }
  return decoded;
};

const decodeFrame: FrameDecoder = async function (data) {
  if (!decoder) {
    const libJpegTurbo = await LibJpegTurboPromise();
    decoder = new libJpegTurbo.JPEGDecoder();
  }

  const buffer = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const encodedBuffer = decoder.getEncodedBuffer(buffer.length);
  encodedBuffer.set(buffer);

  decoder.decode();
  return decoder.getDecodedBuffer();
};

export default decode;
