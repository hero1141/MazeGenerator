export class Point {
  y: number;
  x: number;
  visited = false;
  left = true;
  right = true;
  top = true;
  bottom = true;
  cost: number;
  trap = false;

  constructor(x, y, xMax, yMax) {
    this.x = x;
    this.y = y;
    this.cost = Math.random() * 10;
    const rand = Math.random();
  }
}
