import { FrameDecoder, PixelDataDecoder } from "./types";

const decode: PixelDataDecoder = async function decode(data) {
  return Promise.all([decodeFrame(data)]);
};

const decodeFrame: FrameDecoder = async function (data) {
  return Promise.resolve(
    new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
  );
};

export default decode;
