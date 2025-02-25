//core/components/Property_component.js
import { Component } from './component.js';

export class Property extends Component {
    constructor(movable = false, speed = 5, solid = false, jumpStrength = 0, applyGravity = false) {
        super();
        this.movable = movable;
        this.speed = speed;
        this.solid = solid;
        this.jumpStrength = jumpStrength;
        this.applyGravity = applyGravity;
        this.isOnGround = false;
        this.isCollided = false;
        this.collidingWith = new Set();
    }
}
