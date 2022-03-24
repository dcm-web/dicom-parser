export function swapBytes(data: Uint8Array, bytes: number): Uint8Array {
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const byte = i % bytes;
    out[i] = data[i + bytes - byte - byte - 1];
  }
  return out;
}
