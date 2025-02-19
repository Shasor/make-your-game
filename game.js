import { Gravity } from './core/systems/gravity_system.js';
import { Input } from './core/systems/input_system.js';
import { Movement } from './core/systems/movement_system.js';
import { Render } from './core/systems/render_system.js';
import { createTile } from './create/tile_create.js';
import { createPlayer } from './create/player_create.js';
import { Collision } from './core/systems/collision_system.js';
import { Collectible } from './core/systems/collectible_system.js';
import { Animation } from './core/systems/animation_system.js';
import { CircleHitbox } from './core/systems/circle_hitbox_system.js';
import { Damage } from './core/systems/damage_system.js';
import { Health } from './core/systems/health_system.js';
import { Debug } from './core/systems/debug.js';

export class Game {
  constructor() {
    this.entities = new Set();
    this.systems = new Set();
    this.lastTime = performance.now();
    this.TILE_SIZE = 32;

    window.addEventListener('blur', () => (this.paused = true));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.paused = !this.paused;
      }
    });

    window.addEventListener('focus', () => {
      this.paused = false;
      this.lastTime = performance.now();
    });

    this.init();
    requestAnimationFrame((currentTime) => this.loop(currentTime));
  }

  // tmp
  init() {
    this.createMap('maps/map1.json');
    const player = createPlayer();
    this.addEntity(player);
    // important order of systems !!
    this.addSystem(new Input());
    this.addSystem(new Movement());
    this.addSystem(new Collision());
    this.addSystem(new CircleHitbox());
    this.addSystem(new Gravity());
    this.addSystem(new Collectible());
    this.addSystem(new Animation());
    this.addSystem(new Damage());
    this.addSystem(new Health());
    this.addSystem(new Render());
    this.addSystem(new Debug());
  }

  addEntity(entity) {
    this.entities.add(entity);
    this.systems.forEach((system) => system.addEntity(entity));
  }

  addSystem(system) {
    system.setGame(this);
    this.systems.add(system);
    this.entities.forEach((entity) => system.addEntity(entity));
  }

  removeEntity(entity) {
    this.entities.delete(entity);
    this.systems.forEach((system) => system.removeEntity(entity));
  }

  async createMap(path) {
    const map = await fetchMap(path);
    const ratio = this.TILE_SIZE / map.metadata.tileSize;

    let tiles = map.layers[0].data.tiles;
    for (const tile of tiles) {
      if (tile.properties.solid) {
        const entity = createTile(tile.x * ratio, tile.y * ratio, this.TILE_SIZE, this.TILE_SIZE, 'assets/sprites/world_tileset.png', tile.tx, tile.ty);
        this.addEntity(entity);
      }
    }
  }

  loop(currentTime) {
    requestAnimationFrame((nextTime) => this.loop(nextTime));
    if (this.paused) return;
    let deltaTime = (currentTime - this.lastTime) / 1000;
    if (deltaTime > 0.1) deltaTime = 0.1;
    this.lastTime = currentTime;
    this.systems.forEach((system) => system.update(deltaTime));
  }
}

async function fetchMap(path) {
  try {
    const resp = await fetch(path);
    return await resp.json();
  } catch (error) {
    console.error(error.message);
  }
}
