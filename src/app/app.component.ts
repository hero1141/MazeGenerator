import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Point } from './point/point.model';
import { Human } from './charsets/human.model';
import { Food } from './charsets/food.model';
import { Zombie } from './charsets/zombie.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  ctx;
  tiles = [];
  visitedStk = [];
  @ViewChild('mazeCanvas') canvas;
  mazeSize = 40;
  x = 20;
  y = 20;
  foods: Food[] = [];
  zombies: Zombie[] = [];
  percentageOfFood = 0.1;
  percentageOfZombie = 0.02;
  hp = 100;
  constructor() {

  }

  ngAfterViewInit() {
    this.canvas = this.canvas.nativeElement;
    this.init();
  }

  init() {
    /*Initialize needed variables. */
    this.ctx = this.canvas.getContext('2d');
    this.respawnObjects();
    this.drawBase();
  }

  drawLine(sX, sY, eX, eY) {
    /*Draw a line from the starting X and Y positions to  the ending X and Y positions*/
    this.ctx.moveTo(sX, sY);
    this.ctx.lineTo(eX, eY);
  }

  drawCell(x, y, side, tile) {
    /* Draw cell based on wall properties */
    const left = tile.left;
    const right = tile.right;
    const top = tile.top;
    const bottom = tile.bottom;
    const size = this.mazeSize;
    this.ctx.beginPath();
    if (left) {
      this.drawLine(x, y, x, y + size);
    }

    if (right) {
      this.drawLine(x + size, y, x + size, y + size);
    }

    if (bottom) {
      this.drawLine(x, y + size, x + size, y + size);
    }

    if (top) {
      this.drawLine(x, y, x + size, y);
    }
    this.ctx.stroke();
  }

  drawBase() {
    /* Draw the tiles on the canvas*/
    const side = this.mazeSize;
    for (let i = 0; i < this.x; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < this.y; j++) {
        this.tiles[i].push(new Point(i, j));
        this.drawCell(i * side, j * side, side, this.tiles[i][j]);
      }
    }
    this.generateMaze(0, 0);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  redrawTiles() {
    let currentTile;
    this.clearCanvas();
    const side = this.mazeSize;
    for (let i = 0; i < this.x; i++) {
      for (let j = 0; j < this.y; j++) {
        currentTile = this.tiles[j][i];
        this.drawCell(i * side, j * side, side, currentTile);
      }
    }
  }

  reDrawMaze() {
    /*Button Handle for 'New Maze' */
    const startCol = Math.floor(Math.random() * 10) - 1;
    const startRow = Math.floor(Math.random() * 10) - 1;
    this.clearCanvas();
    this.respawnObjects();
    this.drawBase();
  }

  generateMaze(row, col) {
    /* Depth First Search*/
    let currentTile = this.tiles[row][col];
    const neighbor = this.findNeighbor(row, col);
    /*Check if cell has been visited */
    if (!currentTile.visited) {
      currentTile.visited = true;
      this.visitedStk.push(currentTile);
    }
    /* Break Case */
    if (this.visitedStk.length === 0) {
      this.redrawTiles();
      return;
    } else if (neighbor !== undefined) {
    /*If a neighbor is found*/
      /*Break the wall in between*/
      if (neighbor.row > currentTile.row) { /*Bottom*/
        currentTile.bottom = false;
        neighbor.top = false;
      }
      if (neighbor.row < currentTile.row) { /*Top*/
        currentTile.top = false;
        neighbor.bottom = false;
      }
      if (neighbor.col < currentTile.col) { /*Left*/
        currentTile.left = false;
        neighbor.right = false;
      }
      if (neighbor.col > currentTile.col) { /*Right*/
        currentTile.right = false;
        neighbor.left = false;
      }
      /*Update Current Tile*/
      currentTile = neighbor;
    } else {
    /*If no neighbor was found, backtrack to a previous cell on the stacke*/
      const backtrack = this.visitedStk.pop();
      this.generateMaze(backtrack.row, backtrack.col);
      currentTile = backtrack;
    }
    this.generateMaze(currentTile.row, currentTile.col);
  }

  findNeighbor(row, col) {
    /*Find the neighbor of the given tile using the tiles array.*/
    let top, bottom, left, right;
    let stk = [];
    let neighbor = undefined;
    let n;
    /* Check for left neighbor */
    if (row >= 0 && col > 0) {
      left = this.tiles[row][col - 1];
      (!left.visited) ? stk.push(left): undefined
    }

    /* Check for right neighbor */
    if (row >= 0 && col < 19) {
      right = this.tiles[row][col + 1];
      (!right.visited) ? stk.push(right): undefined;
    }

    /* Check for top neighbor */
    if (col >= 0 && row > 0) {
      top = this.tiles[row - 1][col];
      (!top.visited) ? stk.push(top): undefined
    }
    /* Check for bottom neighbor */
    if (col >= 0 && row < 19) {
      bottom = this.tiles[row + 1][col];
      (!bottom.visited) ? stk.push(bottom): undefined
    }


    let len;
    while (stk.length > 0) {
      /* Choose a random neighbor */
      len = stk.length;
      n = Math.floor(Math.random() * stk.length);
      neighbor = stk[n];
      if (!neighbor.visited) {
        break;
      } else {
        stk.splice(n, 1);
      }
    }
    /*Return, will return undefined if no neighbor is found*/
    return neighbor;
  }
  respawnObjects() {
    const human = new Human(5, 5, '../assets/images/baby.png');
    human.data.onload = () => {
      this.ctx.drawImage(human.data, 5, 5);
    };
    this.generateFood();
    this.generateZombies();
  }
  generateFood() {
    for (let i = 0; i < Math.floor(this.x * this.y * this.percentageOfFood) ; i++) {
      const food = new Food(Math.floor(Math.random() * this.x +  1), Math.floor(Math.random() * this.y + 1 ));
      this.foods.push(food);
      food.data.onload = () => {
        this.ctx.drawImage(food.data, this.mazeSize * food.x - this.mazeSize + 5, this.mazeSize * food.y - this.mazeSize + 5);
      };
    }
  }

  generateZombies() {
    for (let i = 0; i < Math.floor(this.x * this.y  * this.percentageOfZombie) ; i++) {
      const zombie = new Zombie(Math.floor(Math.random() * this.x +  1), Math.floor(Math.random() * this.y + 1 ));
      this.zombies.push(zombie);
      zombie.data.onload = () => {
        this.ctx.drawImage(zombie.data, this.mazeSize * zombie.x - this.mazeSize + 5, this.mazeSize * zombie.y - this.mazeSize + 5);
      };
    }
  }
}
