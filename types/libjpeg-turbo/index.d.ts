declare module "libjpeg-turbo" {
  export type FrameInfo = {
    width: number;
    height: number;
    bitsPerSample: number;
    componentCount: number;
    subSampling: number;
    isSigned: boolean;
  };

  export class JPEGDecoder {
    constructor();
    getEncodedBuffer(encodedSize: number): Uint8Array;
    getDecodedBuffer(): Uint8Array;
    readHeader(): void;
    decode(): void;
    decodeRaw(): void;
    getFrameInfo(): FrameInfo;
    delete(): void;
  }

  export class JPEGEncoder {
    constructor();
    getDecodedBuffer(frameInfo: FrameInfo): Uint8Array;
    getEncodedBuffer(): Uint8Array;
    encode(): void;
    setProgressive(progressive: number): void;
    setQuality(quality: number): void;
    setSubSampling(subSampling: number): void;
    delete(): void;
  }

  export type LibJpegTurbo = {
    JPEGDecoder: typeof JPEGDecoder;
    JPEGEncoder: typeof JPEGEncoder;
  };

  function factory(): Promise<LibJpegTurbo>;
  export default factory;
}
