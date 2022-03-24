import { lossless } from "jpeg-lossless-decoder-js";
import { PixelDataDecoder } from "./types";
import { pixelDataToFragments, fragmentsToFrames } from "./utils";

const decode: PixelDataDecoder = async function decode(
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
  const frames = encodedFrames.map(decodeFrame);
  return Promise.resolve({ frames, pixelDescription });
};

const decodeFrame = function (data: DataView) {
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
  return decoded as Uint8Array;
};

export default decode;
