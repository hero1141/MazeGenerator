export class Zombie {
  x: number;
  y: number;
  data = new Image();
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.data.src = './assets/images/zombie.png';
  }
}
