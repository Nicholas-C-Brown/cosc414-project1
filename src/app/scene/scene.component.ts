import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {Vector2} from "../../models/vector2";
import {Color} from "../../models/color";
import {CircleDrawerService} from "../services/CircleDrawer/circle-drawer.service";
import {Circle} from "../../models/circle";

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements AfterViewInit {

  running: boolean;

  canvasSize = new Vector2(720, 480);
  canvasColor = Color.Black;

  circle = new Circle(
    360, 100,
    new Vector2(360, 240),
    Color.White
  );

  @ViewChild('sceneCanvas') private canvas: ElementRef<HTMLCanvasElement> | undefined;

  constructor(private circleDrawer: CircleDrawerService) {
    this.running = true;
  }

  ngAfterViewInit(): void {
    if (!this.canvas) {
      console.log('Canvas not supplied! Cannot bind WebGL context!');
      return;
    }

    //Initialize WebGL Service
    if(!this.circleDrawer.initializeRenderingContext(this.canvas.nativeElement, this.canvasSize, this.canvasColor)){
      console.log("Failed to initialize rendering context.");
      return;
    }

    this.gameLoop();
    console.log("Game has ended");
  }

  private gameLoop(): void {
    //Clear scene
    this.circleDrawer.clearCanvas();

    //Draw Petri Dish
    this.circleDrawer.drawCircle(this.circle);

    let rX = (-0.5 + Math.random()) * 2;
    let rY = (-0.5 + Math.random()) * 3;

    this.circle.location.x += rX;
    this.circle.location.y += rY;

    if(this.running) {
      requestAnimationFrame(() => this.gameLoop());
    }

  }

}
