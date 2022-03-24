import { FrameDecoder, PixelDataDecoder } from "./types";

const decode: PixelDataDecoder = async function decode(
  data,
  _,
  pixelDescription
) {
  const frames = await Promise.all([decodeFrame(data)]);
  return { frames, pixelDescription };
};

const decodeFrame: FrameDecoder = async function (data) {
  return Promise.resolve(
    new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
  );
};

export default decode;
