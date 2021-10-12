import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent {

  @Input() winScore: number | undefined | null;
  @Input() lives: number | undefined | null;
  @Input() growthRate: number | undefined | null;

  @Output() scoreUpdater = new EventEmitter<number>();
  @Output() livesUpdater = new EventEmitter<number>();
  @Output() growthRateUpdater = new EventEmitter<number>();

  public updateScore(score: number | null): void {
    if(!score) return;
    this.scoreUpdater?.emit(score);
  }

  public updateLives(lives: number | null): void {
    if(!lives) return;
    this.livesUpdater?.emit(lives);
  }

  public updateGrowthRate(growth: number | null): void {
    if(!growth) return;
    this.growthRateUpdater?.emit(growth);
  }

}
