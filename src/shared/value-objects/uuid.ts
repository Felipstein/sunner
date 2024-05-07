export class UUID {
  readonly value: string;

  constructor(uuid: string) {
    if (!uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new Error(`Invalid UUID: ${uuid}`);
    }

    this.value = uuid;
  }
}
