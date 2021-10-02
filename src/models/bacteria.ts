import {Vector2} from "./vector2";
import {Color} from "./color";
import {Circle} from "./circle";

export class Bacteria extends Circle{

  growthRate: number;
  maxRadius: number;
  triggerGameover: boolean;

  constructor(resolution: number, radius: number, location: Vector2, color: Color, growthRate: number, maxRadius: number) {
    super(resolution, radius, location, color);
    this.growthRate = growthRate;
    this.maxRadius = maxRadius;
    this.triggerGameover = true;
  }

  public update(): void {
    this.radius += this.growthRate;
    if(this.radius > this.maxRadius)
      this.triggerGameover = false;
  }


}
