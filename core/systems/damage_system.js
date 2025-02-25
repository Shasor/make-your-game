import { System } from './system.js';

export class Damage extends System {
  constructor() {
    super();
    this.damageInterval = 1000; // 1 seconde entre chaque dégât
    this.lastDamageTime = new Map(); // Stocke le dernier moment où un ennemi a fait des dégâts
  }

  update() {
    const player = Array.from(this.entities).find((entity) => entity.getComponent('input'));
    if (!player) return;

    const playerHitbox = player.getComponent('circle_hitbox');
    const playerPos = player.getComponent('position');
    const playerVisual = player.getComponent('visual');
    const playerHealth = player.getComponent('health');
    const playerAnimation = player.getComponent('animation');

    if (!playerHitbox || !playerPos || !playerVisual || !playerHealth || !playerAnimation) return;

    const playerCenter = playerHitbox.getCircleCenter(playerPos, playerVisual);
    const currentTime = Date.now();

    this.entities.forEach((enemy) => {
      if (enemy === player) return;

      const enemyHitbox = enemy.getComponent('circle_hitbox');
      const enemyPos = enemy.getComponent('position');
      const enemyVisual = enemy.getComponent('visual');

      if (!enemyHitbox || !enemyPos || !enemyVisual) return;

      const enemyCenter = enemyHitbox.getCircleCenter(enemyPos, enemyVisual);

      // Vérifier la collision physique
      const distance = Math.hypot(playerCenter.x - enemyCenter.x, playerCenter.y - enemyCenter.y);

      if (distance <= playerHitbox.collisionRadius + enemyHitbox.collisionRadius) {
        // Vérifier le cooldown des dégâts
        const lastDamage = this.lastDamageTime.get(enemy.uuid) || 0;
        if (currentTime - lastDamage >= this.damageInterval) {
          // Appliquer les dégâts
          playerHealth.currentLives--;
          this.lastDamageTime.set(enemy.uuid, currentTime);

          // Animation de dégât
          playerAnimation.setState('hurt');

          // Vérifier la mort du joueur
          if (playerHealth.currentLives <= 0) {
            playerAnimation.setState('death');

            // Utiliser handlePlayerDeath au lieu de restart
            setTimeout(() => {
              if (this.game.handlePlayerDeath) {
                this.game.handlePlayerDeath();
              } else {
                // Fallback si handlePlayerDeath n'existe pas
                console.warn("handlePlayerDeath n'existe pas, utilisation de restart");
                this.game.restart();
              }
            }, 1000);
          }
        }
      }
    });
  }
}
