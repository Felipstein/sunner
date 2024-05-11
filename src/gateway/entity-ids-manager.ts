class EntityIDsManager {
  private readonly entityIds: Set<number>;
  private lastEntityId: number;

  constructor() {
    this.entityIds = new Set();
    this.lastEntityId = -1;
  }

  generateEntityId() {
    let newId = this.lastEntityId + 1;

    while (this.entityIds.has(newId)) {
      newId += 1;
    }

    this.entityIds.add(newId);
    this.lastEntityId = newId;

    return newId;
  }

  releaseEntityId(id: number) {
    this.entityIds.delete(id);
  }
}

export const entityIDsManager = new EntityIDsManager();
