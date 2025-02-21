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
//import { Debug } from './core/systems/debug.js';
import { TileSystem } from './core/systems/tile_system.js';
import { MapLoader } from './core/map_loader.js';
import { PhysicsSystem } from './core/systems/physics_system.js';
import { Camera } from './core/systems/camera_system.js';
import { EnemyBehavior } from './core/systems/enemy_behavior_system.js';

export class Game {
    constructor() {
        this.entities = new Set();
        this.systems = new Set();
        this.lastTime = performance.now();
        this.mapLoader = new MapLoader(this);

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

        this.initAsync().then(() => {
            requestAnimationFrame((currentTime) => this.loop(currentTime));
        });
    }

    // tmp
    async initAsync() {


        // important order of systems !!
        this.addSystem(new Input());
        this.addSystem(new EnemyBehavior());
        this.addSystem(new Camera());  // système de caméra après l'input mais avant le rendu
        this.addSystem(new Movement());
        this.addSystem(new Collision());
        this.addSystem(new CircleHitbox());
        this.addSystem(new Gravity());
        this.addSystem(new Collectible());
        this.addSystem(new Animation());
        this.addSystem(new Damage());
        this.addSystem(new Health());
        this.addSystem(new TileSystem());
        this.addSystem(new Render());
        this.addSystem(new PhysicsSystem());

        // Charger la map
        await this.mapLoader.loadMap('./assets/maps/map1.json');

        // // Ajouter les autres entités
        // const player = createPlayer();
        // this.addEntity(player);

        // const enemy = createEnemy(400, 700);
        // this.addEntity(enemy);

        // const collectable = createCollectable(250, 400, 'coin', 1, 20, 20, 'gold');
        // this.addEntity(collectable);

        // const coffre = createCollectable(350, 700, 'coin', 50, 20, 20, 'gold');
        // this.addEntity(coffre);
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
        requestAnimationFrame((nextTime) => this.loop(nextTime));
        if (this.paused) return;
        let deltaTime = (currentTime - this.lastTime) / 1000;
        if (deltaTime > 0.1) deltaTime = 0.1;
        this.lastTime = currentTime;
        this.systems.forEach((system) => system.update(deltaTime));
    }
}
