import { FrameDecoder, PixelDataDecoder } from "./types";
import { pixelDataToFragments } from "./utils";

const decode: PixelDataDecoder = async function decode(
  data,
  encoding,
  pixelDescription
) {
  const fragments = pixelDataToFragments(data, encoding);
  const [, ...encodedFrames] = fragments;
  const frames = await Promise.all(encodedFrames.map(decodeFrame));
  return { frames, pixelDescription };
};

const decodeFrame: FrameDecoder = async function (data) {
  return Promise.resolve(
    new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
  );
};

export default decode;
