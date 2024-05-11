type Namespace = string;
type IdentifierValue = string;

export class Identifier {
  private readonly _value: `${Namespace}:${IdentifierValue}`;

  constructor(identify: string) {
    if (identify.split(':').length > 2) {
      throw Error(`Invalid identifier: ${identify}. Expected format: <namespace>:<value>`);
    }

    let namespace: Namespace;
    let value: IdentifierValue;

    if (identify.includes(':')) {
      [namespace, value] = identify.split(':');
    } else {
      namespace = 'minecraft';
      value = identify;
    }

    namespace = namespace.toLowerCase().trim();
    value = value.toLowerCase().trim();

    if (!/^[a-z0-9.\-_]+$/g.test(namespace)) {
      throw Error(`Invalid namespace: ${namespace}. Expected namespace pattern: [a-z0-9.-_]`);
    }

    if (!/^[a-z0-9.\-_/]+$/g.test(value)) {
      throw Error(
        `Invalid identifier value: ${value}. Expected identifier value pattern: [a-z0-9.-_/]`,
      );
    }

    this._value = `${namespace}:${value}`;
  }

  get namespace(): Namespace {
    return this._value.split(':')[0];
  }

  get value(): IdentifierValue {
    return this._value.split(':')[1];
  }

  toString() {
    return this._value;
  }
}
