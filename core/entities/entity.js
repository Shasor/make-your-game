//core/entities/entity.js
export class Entity {
    constructor() {
        this.uuid = crypto.randomUUID();
        this.components = new Map();
    }

    addComponent(name, component) {
        this.components.set(name, component);
    }

    getComponent(name) {
        return this.components.get(name);
    }
}
