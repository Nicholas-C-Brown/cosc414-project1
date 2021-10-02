import {Vector2} from "../models/vector2";
import {Circle} from "../models/circle";

export function getCircumferencePoint (C: Circle): Vector2{
  //x = cx + r * cos(a)
  //y = cy + r * sin(a)
  const angle = Math.random() * 2*Math.PI;
  const x = C.location.x + C.radius * Math.cos(angle);
  const y = C.location.y + C.radius * Math.sin(angle);
  return new Vector2(x,y);
}
