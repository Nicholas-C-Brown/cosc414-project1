import {Circle} from "./circle";
import {Vector2} from "./vector2";
import {Color} from "./color";

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
    this.location.x -= this.direction.x * (this.speed * (0.25 + Math.random()*0.75));
    this.location.y -= this.direction.y * (this.speed * (0.25 + Math.random()*0.75));
    if(this.radius > 0)
      this.radius-=0.5 + Math.random();
    else this.alive = false;

  }

}
