import { PixelDataDecoder } from "./types";

const decode: PixelDataDecoder = async function decode(
  data,
  _,
  pixelDescription
) {
  const frames = [decodeFrame(data)];
  return Promise.resolve({ frames, pixelDescription });
};

const decodeFrame = function (data: DataView) {
  return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
};

export default decode;
