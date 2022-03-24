import { default as LibJpegTurboPromise, JPEGDecoder } from "libjpeg-turbo";
import { PixelDataDecoder } from "./types";
import { pixelDataToFragments, fragmentsToFrames } from "./utils";

let decoder: JPEGDecoder;

const decode: PixelDataDecoder = async function (
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
  const frames = [];
  for (const encodedFrame of encodedFrames) {
    frames.push(await decodeFrame(encodedFrame));
  }
  return {
    frames,
    pixelDescription: {
      ...pixelDescription,
      // JPEGs (mostly) use YBR_FULL_422 internally but when decoded with
      // libjpeg-turbo the conversion to rgb is also performed, so the
      // photometric interpretation needs to be updated.
      photometricInterpretation:
        pixelDescription.samplesPerPixel === 3
          ? "RGB"
          : pixelDescription.photometricInterpretation,
    },
  };
};

const decodeFrame = async function (data: DataView) {
  if (!decoder) {
    const libJpegTurbo = await LibJpegTurboPromise();
    decoder = new libJpegTurbo.JPEGDecoder();
  }

  const buffer = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const encodedBuffer = decoder.getEncodedBuffer(buffer.length);
  encodedBuffer.set(buffer);

  decoder.decode();
  return decoder.getDecodedBuffer();
};

export default decode;
