import jpeg from "@cwasm/jpeg-turbo";
import { FrameDecoder, PixelDataDecoder } from "./types";
import { pixelDataToFragments, fragmentsToFrames } from "./utils";

const decode: PixelDataDecoder = async function (data, encoding) {
  const fragments = pixelDataToFragments(data, encoding);
  const frames = fragmentsToFrames(fragments);
  return Promise.all(frames.map(decodeFrame));
};

const decodeFrame: FrameDecoder = async function (data) {
  const buffer = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const image = jpeg.decode(buffer);
  const decoded = new Uint8Array(image.data.buffer);
  return Promise.resolve(decoded);
};

export default decode;
