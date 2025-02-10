export class System {
  constructor() {
    this.game = null;
    this.entities = new Set();
  }

  addEntity(entity) {
    this.entities.add(entity);
  }

  removeEntity(entity) {
    this.entities.delete(entity);
  }

  setGame(game) {
    this.game = game;
  }

  update() {
    throw new Error('update() doit être implémenté dans les sous-classes !');
  }
}
