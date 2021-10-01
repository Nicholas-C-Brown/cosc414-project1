import {Vector2} from "./vector2";
import {Color} from "./color";
import {Circle} from "./circle";

export class Bacteria extends Circle{

  constructor(resolution: number, radius: number, location: Vector2, color: Color, growthRate: number, maxRadius: number) {
    super(resolution, radius, location, color);
    this.growthRate = growthRate;
    this.maxRadius = maxRadius;
    this.alive = true;
  }

  growthRate: number;
  maxRadius: number;
  alive: boolean;

  public update() {
    this.radius += this.growthRate;
    if(this.radius > this.maxRadius)
      this.alive = false;
  }


}
