export class Human {
  x: number;
  y: number;
  data = new Image();
  isAlive = true;
  constructor(x: number, y: number, src: string) {
    this.data.src = src;
  }
}
