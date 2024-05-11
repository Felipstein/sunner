export function toHexString(value: number | bigint) {
  return `0x${value.toString(16).padStart(2, '0')}`;
}
