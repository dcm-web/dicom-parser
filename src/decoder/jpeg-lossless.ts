import { lossless } from "jpeg-lossless-decoder-js";
import { FrameDecoder, PixelDataDecoder } from "./types";
import { pixelDataToFragments, fragmentsToFrames } from "./utils";

const decode: PixelDataDecoder = async function decode(data, encoding) {
  const fragments = pixelDataToFragments(data, encoding);
  const frames = fragmentsToFrames(fragments);
  return Promise.all(frames.map(decodeFrame));
};

const decodeFrame: FrameDecoder = async function (data) {
  return Promise.resolve(
    new lossless.Decoder().decode(data.buffer, data.byteOffset, data.byteLength)
  );
};

export default decode;
