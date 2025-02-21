import { Gravity } from './core/systems/gravity_system.js';
import { Input } from './core/systems/input_system.js';
import { Movement } from './core/systems/movement_system.js';
import { Render } from './core/systems/render_system.js';
import { Collision } from './core/systems/collision_system.js';
import { Collectible } from './core/systems/collectible_system.js';
import { Animation } from './core/systems/animation_system.js';
import { CircleHitbox } from './core/systems/circle_hitbox_system.js';
import { Damage } from './core/systems/damage_system.js';
import { Health } from './core/systems/health_system.js';
import { Debug } from './core/systems/debug.js';
import { createMenu } from './utils/utils.js';
import { createMap } from './create/map_create.js';

export class Game {
  constructor(container) {
    this.entities = new Set();
    this.systems = new Set();
    this.lastTime = performance.now();
    this.paused = false;
    this.container = document.querySelector(container);
    this.menu = document.createElement('div');
    this.maps = ['map1'];

    // window.addEventListener('blur', () => (this.paused = true));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.paused = !this.paused;
      }
    });

    // window.addEventListener('focus', () => {
    //   this.paused = false;
    //   this.lastTime = performance.now();
    // });

    this.init();
    requestAnimationFrame((currentTime) => this.loop(currentTime));
  }

  // tmp
  init() {
    // create pauseMenu
    createMenu(this, this.menu);
    this.container.appendChild(this.menu);
    // create Map
    createMap(this, `maps/${this.maps[0]}.json`);
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
    this.addSystem(new Render(this.container));
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
    const visual = entity.getComponent('visual');
    visual.div.remove();
    this.entities.delete(entity);
    this.systems.forEach((system) => system.removeEntity(entity));
  }

  restart() {
    this.entities.forEach((entity) => {
      this.removeEntity(entity);
    });
    createMap(this, `maps/${this.maps[0]}.json`);
  }

  loop(currentTime) {
    requestAnimationFrame((nextTime) => this.loop(nextTime));
    if (this.paused) {
      this.menu.style.visibility = 'initial';
      return;
    }
    this.menu.style.visibility = 'hidden';
    let deltaTime = (currentTime - this.lastTime) / 1000;
    if (deltaTime > 0.1) deltaTime = 0.1;
    this.lastTime = currentTime;
    this.systems.forEach((system) => system.update(deltaTime));
  }
}
