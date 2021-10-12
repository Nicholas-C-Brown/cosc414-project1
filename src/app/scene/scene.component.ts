import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {Vector2} from "../../models/vector2";
import {Color} from "../../models/color";
import {CircleDrawerService} from "../services/CircleDrawer/circle-drawer.service";
import {Circle} from "../../models/circle";
import {getCircumferencePoint, isPointInCircle, norm} from "../../functions/circleFunc";
import {Bacteria} from "../../models/bacteria";
import {getCursorPosition} from "../../functions/inputFunc";
import {ExplosionParticle} from "../../models/explosionParticle";

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements AfterViewInit {

  running: boolean;
  gameover: boolean;
  score: number;
  winScore: number;
  lives: number;
  startLives: number;
  spawnChance: number;
  growthRate: number;
  startSpawnChance: number;
  spawnChanceGrowth: number;
  gameOverText: string;

  canvasSize = new Vector2(720, 480);
  canvasColor = Color.Black;

  circle = new Circle(
    100, 180,
    new Vector2(360, 240),
    Color.White
  );

  bacteria: Bacteria[];
  explosionParticle: ExplosionParticle[];

  @ViewChild('sceneCanvas') private canvas: ElementRef<HTMLCanvasElement> | undefined;

  constructor(private circleDrawer: CircleDrawerService) {
    this.running = false;
    this.gameover = false;
    this.score = 0;
    this.winScore = 25;
    this.lives = 0;
    this.startLives = 2;
    this.startSpawnChance = 0.04;
    this.spawnChanceGrowth = 0.001;
    this.growthRate = 0.3;
    this.spawnChance = this.startSpawnChance;
    this.bacteria = [];
    this.gameOverText = "";
    this.explosionParticle = [];
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

    this.canvas.nativeElement.addEventListener("mousedown", (e) => this.mouseClick(e));

    console.log("Game over.");
  }

  public gameLoop(): void {
    //Clear scene
    this.circleDrawer.clearCanvas();

    //Draw Petri Dish
    this.circleDrawer.drawCircle(this.circle);

    //Spawn bacteria
    if(!this.gameover) {

      const chance = Math.random();

      if (chance < this.spawnChance){
        this.spawnBacteria(1);
        this.spawnChance += this.spawnChanceGrowth;
      }
    }

    const removeBacteria: Bacteria[] = [];

    if(!this.gameover) {
      //Update Bacteria
      for (const b of this.bacteria) {
        b.update();
        if (b.triggerGameover) {
          this.lives--;
          removeBacteria.push(b);
        } else if (!b.alive) {
          removeBacteria.push(b);
        }
      }

      //Delete killed bacteria
      for (const b of removeBacteria) {
        const index = this.bacteria.indexOf(b);
        this.bacteria.splice(index, 1);
      }
    }

    const removeExplosions: ExplosionParticle[] = [];

    for(const e of this.explosionParticle){
      e.update();
      if(!e.alive)
        removeExplosions.push(e);
    }

    for(const e of removeExplosions){
      const index = this.explosionParticle.indexOf(e);
      this.explosionParticle.splice(index, 1);
    }

    //Check gameover condition
    if(this.lives <= 0){
      this.gameOver();
    }

    //Check win condition
    if(this.score >= this.winScore){
      this.win();
    }

    //Draw Bacteria
    for(const b of this.bacteria){
      this.circleDrawer.drawCircle(b);
    }

    for(const e of this.explosionParticle){
      this.circleDrawer.drawCircle(e);
    }

    //Continue game loop
    if(this.running) {
      requestAnimationFrame(() => this.gameLoop());
    }

  }

  public startGame(): void{
    this.bacteria = [];
    this.explosionParticle = [];
    this.running = true;
    this.gameover = false;
    this.score = 0;
    this.lives = this.startLives;
    this.spawnChance = this.startSpawnChance;
  }

  private gameOver(): void {
    this.gameover = true;
    this.gameOverText = "Game over! :(";
  }

  private win(): void {
    this.gameover = true;
    this.gameOverText = "You win!! :D";
  }

  private spawnBacteria(count: number): void{

    for(let i = 0; i < count; i++){
      const B = new Bacteria(
        100,
        5,
        getCircumferencePoint(this.circle),
        new Color(Math.random(), Math.random(), Math.random(), 1),
        this.growthRate,
        75
      );

      this.bacteria.push(B);
    }

  }
  private createExplosion(particles: number, circle: Circle): void {
    for (let i = 0; i < particles; i++) {
      const direction = norm(new Vector2(-0.5 + Math.random(), -0.5 + Math.random()));
      const location = new Vector2(circle.location.x, circle.location.y);
      const radius = circle.radius/3;
      const speed = circle.radius/3;
      const color = new Color(
        circle.color.r * (0.7 + Math.random() * 0.3),
        circle.color.g * (0.7 + Math.random() * 0.3),
        circle.color.b * (0.7 + Math.random() * 0.3),
        1
      )

      const E = new ExplosionParticle(
        100,
        radius,
        location,
        color,
        direction,
        speed,
      );

      this.explosionParticle.push(E);
    }

    //console.log(this.explosionParticle);
  }

  private mouseClick(e: MouseEvent): void {
    if(!this.canvas || this.gameover) return;

    const pos = getCursorPosition(this.canvas.nativeElement, e);

    //Spray poison



    for(let i = 0; i<=this.bacteria.length-1; i++) {
      const b = this.bacteria[this.bacteria.length-1-i];
      if(isPointInCircle(pos, b)){
        this.createExplosion(250, b);
        b.die();
        this.score++;
        return;
      }
    }

  }

  public updateWinScore(score: number | undefined): void {
    if(!score) return;
    this.winScore = score;
  }

  public updateLives(lives: number | undefined): void {
    if(!lives) return;
    this.startLives = lives;
  }

  public updateGrowthRate(growth: number | undefined): void {
    if(!growth) return;
    this.growthRate = growth;
  }



}
