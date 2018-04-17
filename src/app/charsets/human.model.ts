export class Human {
  public x: number;
  public y: number;
  visitedTiles = [];
  data = new Image();
  isAlive = true;
  constructor(x: number, y: number, src: string) {
    this.x = x;
    this.y = y;
    this.data.src = src;
  }
}
