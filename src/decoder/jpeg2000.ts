import OpenJPEG from "openjpeg";
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
  const openJpeg = await OpenJPEG();
  const decoder = new openJpeg.J2KDecoder();

  const buffer = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const encodedBuffer = decoder.getEncodedBuffer(buffer.length);
  encodedBuffer.set(buffer);

  const decodeLevel = 0;
  const decodeLayer = 0;
  for (let i = 0; i < 1; i += 1) {
    decoder.decodeSubResolution(decodeLevel, decodeLayer);
  }
  decoder.getFrameInfo();
  return decoder.getDecodedBuffer();
};

export default decode;
