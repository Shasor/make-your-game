export class Input extends System {
  update() {
    this.entities.forEach((entity) => {
      if (entity.components.has('input')) {
        const input = entity.getComponent('input');
        const velocity = entity.getComponent('velocity');
        const feature = entity.getComponent('feature');
        if (input && velocity && feature.movable) {
          velocity.vx = input.vector.h * feature.speed;
          velocity.vy = input.vector.v * feature.speed;
        }
      }
    });
  }
}
