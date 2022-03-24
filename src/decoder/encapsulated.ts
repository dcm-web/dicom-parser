import { PixelDataDecoder } from "./types";
import { pixelDataToFragments } from "./utils";

const decode: PixelDataDecoder = async function decode(
  data,
  encoding,
  pixelDescription,
  frameNumbers
) {
  const fragments = pixelDataToFragments(data, encoding);
  let [, ...encodedFrames] = fragments;
  if (frameNumbers) {
    encodedFrames = encodedFrames.filter((_, i) => frameNumbers.includes(i));
  }
  const frames = encodedFrames.map(decodeFrame);
  return Promise.resolve({ frames, pixelDescription });
};

const decodeFrame = function (data: DataView): Uint8Array {
  return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
};

export default decode;
