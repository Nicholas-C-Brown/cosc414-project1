import {Circle} from "./circle";
import {Vector2} from "./vector2";
import {Color} from "./color";
import {dist} from "../functions/circleFunc";

export class ExplosionParticle extends Circle {

  direction: Vector2;
  speed: number;
  alive: boolean;
  origPos: Vector2;

  constructor(resolution: number, radius: number, location: Vector2, color: Color, direction: Vector2, speed: number) {
    super(resolution, radius, location, color);
    this.direction = direction;
    this.speed = speed;
    this.alive = true;
    this.origPos = new Vector2(location.x, location.y);
  }

  public update(): void{
    this.location.x -= this.direction.x * this.speed;
    this.location.y -= this.direction.y * this.speed;
    if(this.radius > 0)
      this.radius-=0.5;
    else this.alive = false;

  }

}
