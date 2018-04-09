export class Point {
  row: number;
  col: number;
  visited = false;
  left = true;
  right = true;
  top = true;
  bottom = true;

  constructor(x, y) {
    this.row = x;
    this.col = y;
    const rand = Math.random();
    if ((x !== 0 && y !== 0) && (x !== 19 && y !== 19)) {
      if (rand > 0 && rand < 0.8) {
        this.top = false;
      }
      if (rand > 0 && rand < 0.8 ) {
        this.right = false;
      }
      if (rand > 0.25 && rand < 0.75 ) {
        this.left = false;
      }
      if (rand > 0.5 && rand < 1) {
        this.bottom = false;
      }
    }
    if (y < 5 && x === 0) {
      this.left = false;
      this.right = false;
      this.bottom = false;
    }
    if (y === 0) {
      this.left = true;
    }
    if (x === 19 && y === 19) {
      if (rand > 0.5) {
        this.bottom = false;
      } else {
        this.right = false;
      }
    }
  }
}
