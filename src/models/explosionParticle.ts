import {Circle} from "./circle";
import {Vector2} from "./vector2";
import {Color} from "./color";
import {dist} from "../functions/circleFunc";

export class ExplosionParticle extends Circle {

  id: number;
  direction: Vector2;
  maxDist: number;
  alive: boolean;
  origPos: Vector2;

  constructor(resolution: number, radius: number, location: Vector2, color: Color, direction: Vector2, maxDist: number, id: number) {
    super(resolution, radius, location, color);
    this.direction = direction;
    this.maxDist = maxDist;
    this.alive = true;
    this.origPos = new Vector2(location.x, location.y);
    this.id = id;
  }

  public update(): void{
    //console.log(this.id);
    if(this.id == 0){
      this.location.x -= this.direction.x;
      this.location.y -= this.direction.y;
    }else {
      this.location.x += this.direction.x;
      this.location.y += this.direction.y;
    }
    const distance = dist(this.origPos, this.location);
    if(distance > this.maxDist)
      this.alive = false;

  }

}
