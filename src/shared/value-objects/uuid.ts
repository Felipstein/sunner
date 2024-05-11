export class UUID {
  private readonly _value: string;

  constructor(uuid: string) {
    if (!uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new Error(`Invalid UUID: ${uuid}`);
    }

    this._value = uuid;
  }

  get version() {
    return parseInt(this._value.charAt(14), 16);
  }

  toString() {
    return this._value;
  }
}
