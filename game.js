import { Input } from './core/systems/input_system.js';
import { Movement } from './core/systems/movement_system.js';
import { Render } from './core/systems/render_system.js';
import { createPlayer } from './create/player_create.js';

export class Game {
  constructor() {
    this.entities = new Set();
    this.systems = new Set();

    this.init();
    this.loop();
  }

  // tmp
  init() {
    const player = createPlayer(100, 100, 50, 50, true, 8, 'red');
    this.addEntity(player);
    this.addSystem(new Render());
    this.addSystem(new Movement());
    this.addSystem(new Input());
  }

  addEntity(entity) {
    this.entities.add(entity);
    this.systems.forEach((system) => system.addEntity(entity));
  }

  addSystem(system) {
    this.systems.add(system);
    this.entities.forEach((entity) => system.addEntity(entity));
  }

  loop() {
    this.systems.forEach((system) => system.update());
    requestAnimationFrame(() => this.loop());
  }
}
