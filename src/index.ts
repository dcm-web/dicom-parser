export function parse(data: DataView): number {
  const someInt = data.getInt8(0);
  return someInt;
}
