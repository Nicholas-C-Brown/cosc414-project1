import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {Vector2} from "../../models/vector2";
import {Color} from "../../models/color";
import {CircleDrawerService} from "../services/CircleDrawer/circle-drawer.service";
import {Circle} from "../../models/circle";
import {getCircumferencePoint} from "../../functions/circumference";
import {Bacteria} from "../../models/bacteria";

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
    50, 180,
    new Vector2(360, 240),
    Color.White
  );

  bacteria: Bacteria[];

  @ViewChild('sceneCanvas') private canvas: ElementRef<HTMLCanvasElement> | undefined;

  constructor(private circleDrawer: CircleDrawerService) {
    this.running = true;
    this.bacteria = [];
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


    this.startGame();

    console.log("Game over.");
  }

  private gameLoop(): void {
    //Clear scene
    this.circleDrawer.clearCanvas();

    //Draw Petri Dish
    this.circleDrawer.drawCircle(this.circle);

    //Update Bacteria
    for(const b of this.bacteria){
      b.update();
      if (!b.triggerGameover)
        this.gameOver()
      this.circleDrawer.drawCircle(b);
    }

    //Continue game loop
    if(this.running) {
      requestAnimationFrame(() => this.gameLoop());
    }

  }

  private startGame(){
    this.spawnBacteria(5);
    this.gameLoop();
  }

  private gameOver() {
    this.running = false;
  }

  private spawnBacteria(count: number){

    //Reset bacteria array
    this.bacteria = [];

    for(let i = 0; i < count; i++){
      const B = new Bacteria(
        50,
        0,
        getCircumferencePoint(this.circle),
        new Color(Math.random(), Math.random(), Math.random(), 1),
        0.1,
        50
      );

      this.bacteria.push(B);
    }

  }


}
