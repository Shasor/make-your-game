import { Gravity } from './core/systems/gravity_system.js';
import { Input } from './core/systems/input_system.js';
import { Movement } from './core/systems/movement_system.js';
import { Render } from './core/systems/render_system.js';
import { createPlayer } from './create/player_create.js';
import { createTile } from './create/tile_create.js';
import { createCollectable } from './create/collectable_create.js';
import { Collision } from './core/systems/collision_system.js';
import { Collectible } from './core/systems/collectible_system.js';
import { createEnemy } from './create/enemy_create.js';
import { Animation } from './core/systems/animation_system.js';
import { CircleHitbox } from './core/systems/circle_hitbox_system.js';
import { Damage } from './core/systems/damage_system.js';
import { Health } from './core/systems/health_system.js';

export class Game {
    constructor() {
        this.entities = new Set();
        this.systems = new Set();
        this.lastTime = 0;

        this.init();
        requestAnimationFrame((currentTime) => this.loop(currentTime));
    }

    // tmp
    init() {
        const player = createPlayer();
        this.addEntity(player);
        const enemy = createEnemy(400, 700);
        this.addEntity(enemy);
        for (let i = 0; i < 12; i++) {
            const tile = createTile(50, i * 64, 64, 64, 'purple');
            this.addEntity(tile);
        }
        for (let i = 27; i > 0; i--) {
            const tile = createTile(i * 64 + 50, 64 * 12, 64, 64, 'purple');
            this.addEntity(tile);
        }
        const collectable = createCollectable(250, 400, 'coin', 1, 20, 20, 'gold', true);
        this.addEntity(collectable);
        const coffre = createCollectable(350, 700, 'coin', 50, 20, 20, 'gold');
        this.addEntity(coffre);

        // important order of systems !!
        this.addSystem(new Input());
        this.addSystem(new Render());
        this.addSystem(new Movement());
        this.addSystem(new Collision());
        this.addSystem(new CircleHitbox());
        this.addSystem(new Gravity());
        this.addSystem(new Collectible());
        this.addSystem(new Animation());
        this.addSystem(new Damage());
        this.addSystem(new Health());
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

    loop(currentTime) {
        let deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.systems.forEach((system) => system.update(deltaTime));
        requestAnimationFrame((nextTime) => this.loop(nextTime));
    }
}
