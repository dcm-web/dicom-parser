import { FrameDecoder, PixelDataDecoder } from "./types";
import { pixelDataToFragments } from "./utils";

const decode: PixelDataDecoder = async function decode(data, encoding) {
  const fragments = pixelDataToFragments(data, encoding);
  const [, ...frames] = fragments;
  return Promise.all(frames.map(decodeFrame));
};

const decodeFrame: FrameDecoder = async function (data) {
  return Promise.resolve(
    new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
  );
};

export default decode;
