import { Collision } from './core/systems/collision_system.js';
import { Input } from './core/systems/input_system.js';
import { Movement } from './core/systems/movement_system.js';
import { Render } from './core/systems/render_system.js';
import { createPlayer } from './create/player_create.js';
import { createTile } from './create/tile_create.js';

export class Game {
  constructor() {
    this.entities = new Set();
    this.systems = new Set();

    this.init();
    this.loop();
  }

  // tmp
  init() {
    const player = createPlayer(150, 150, 50, 50, true, 8, 'red');
    this.addEntity(player);
    for (let i = 0; i < 9; i++) {
      const tile = createTile(50, i * 64, 64, 64, 'purple');
      this.addEntity(tile);
    }
    for (let i = 9; i > 0; i--) {
      const tile = createTile(i * 64 + 50, 64 * 9, 64, 64, 'purple');
      this.addEntity(tile);
    }
    // important order of systems !!
    this.addSystem(new Input());
    this.addSystem(new Render());
    this.addSystem(new Movement());
    this.addSystem(new Collision());
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
