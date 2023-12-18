const encoder = new TextEncoder();

/**
 * @see https://github.com/panva/jose/blob/main/src/runtime/browser/base64url.ts
 *
 * @param input
 * @returns
 */
export function encodeBytesAsBase64(
  input: Uint8Array | string | ArrayBuffer,
): string {
  const unencoded =
    typeof input === 'string'
      ? encoder.encode(input)
      : input instanceof Uint8Array
      ? input
      : new Uint8Array(input);

  const CHUNK_SIZE = 0x8000;
  const arr = [];
  for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
    arr.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)),
    );
  }
  return btoa(arr.join(''));
}

export function decodeBytesFromBase64(base64: string): Uint8Array {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}
