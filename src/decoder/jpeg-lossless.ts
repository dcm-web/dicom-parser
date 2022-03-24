import { lossless } from "jpeg-lossless-decoder-js";
import { FrameDecoder, PixelDataDecoder } from "./types";
import { pixelDataToFragments, fragmentsToFrames } from "./utils";

const decode: PixelDataDecoder = async function decode(
  data,
  encoding,
  pixelDescription
) {
  const fragments = pixelDataToFragments(data, encoding);
  const encodedFrames = fragmentsToFrames(fragments);
  const frames = await Promise.all(encodedFrames.map(decodeFrame));
  return { frames, pixelDescription };
};

const decodeFrame: FrameDecoder = async function (data) {
  let decoded = new lossless.Decoder().decode(
    data.buffer,
    data.byteOffset,
    data.byteLength
  );
  if (decoded.BYTES_PER_ELEMENT === 2) {
    decoded = new Uint8Array(
      decoded.buffer,
      decoded.byteOffset,
      decoded.byteLength
    );
  }
  return Promise.resolve(decoded as Uint8Array);
};

export default decode;
