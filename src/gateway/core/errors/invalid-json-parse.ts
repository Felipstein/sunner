export class InvalidJSONParseError extends Error {
  name = 'InvalidJSONParseError';

  constructor(readonly invalidJSON: string) {
    super(`Invalid JSON parse for: ${invalidJSON}`);
  }
}
