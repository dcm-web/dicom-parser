declare module "charls" {
  type FrameInfo = {
    width: number;
    height: number;
    bitsPerSample: number;
    componentCount: number;
  };

  class JpegLSDecoder {
    constructor();
    getEncodedBuffer(encodedSize: number): Uint8Array;
    getDecodedBuffer(): Uint8Array;
    decode(): void;
    getFrameInfo(): FrameInfo;
    getInterleaveMode(): number;
    getNearLossless(): number;
    delete(): void;
  }

  class JpegLSEncoder {
    constructor();
    getDecodedBuffer(frameInfo: FrameInfo): Uint8Array;
    getEncodedBuffer(): Uint8Array;
    setNearLossless(nearLossless: number): void;
    setInterleaveMode(interleaveMode: number): void;
    encode(): void;
    delete(): void;
  }

  type CharLS = {
    getVersion(): string;
    JpegLSDecoder: typeof JpegLSDecoder;
    JpegLSEncoder: typeof JpegLSEncoder;
  };

  function factory(): Promise<CharLS>;
  export = factory;
}
