import { Point } from '../point/point.model';
export class Human {
  public x: number;
  public y: number;
  visitedTiles = [];
  way: Array<Point> = [];
  traps: Array<Point> = [];
  data = new Image();
  isAlive = true;
  hp = 100;
  constructor(src: string) {
    this.data.src = src;
  }
  changeHp(x,y) {
    this.hp = this.hp - (20 * (x * y)) / 400;
  }
}
