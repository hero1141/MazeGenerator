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
  @ViewChild('mazeCanvas') canvas;
  ctx;
  tiles = [];
  visitedStk = [];
  mazeSize = 40;
  x = 20;
  y = 10;
  foods: Food[] = [];
  human = new Human(0, 0, '');
  zombies: Zombie[] = [];
  percentageOfFood: any = 0.1;
  percentageOfZombie: any = 0.02;
  hp = 100;
  constructor() {}

  ngAfterViewInit() {
    this.canvas = this.canvas.nativeElement;
    this.init();
  }

  init() {
    /*Initialize needed variables. */
    this.ctx = this.canvas.getContext('2d');
    this.respawnObjects();
    this.drawBase();
    console.log(this.tiles);
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
    for (let i = 0; i < this.y; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < this.x; j++) {
        this.tiles[i].push(new Point(j, i, this.x - 1, this.y - 1 ));
        this.drawCell(j * side, i * side, side, this.tiles[i][j]);
      }
    }
    this.removeRandomWalls();
    this.generateMaze(0, 0);

    // this.reDrawMaze();
  }
  removeRandomWalls() {
    for (let i = 0; i < this.y - 2; i++) {
      for (let j = 1; j < this.x - 2; j++) {
        let rand = Math.random();
        if (rand < 0.45) {
          this.tiles[i][j].bottom = false;
          this.tiles[i + 1][j].top = false;
        }
        rand = Math.random();
        if (rand < 0.45) {
          this.tiles[i][j].right = false;
          this.tiles[i][j + 1].left = false;
        }
      }
    }
  }
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  redrawTiles() {
    let currentTile;
    this.clearCanvas();
    const side = this.mazeSize;
    for (let i = 0; i < this.y; i++) {
      for (let j = 0; j < this.x; j++) {
        currentTile = this.tiles[i][j];
        this.drawCell(j * side, i * side, side, currentTile);
      }
    }
  }

  reDrawMaze() {
    /*Button Handle for 'New Maze' */
    this.hp = 100;
    this.zombies = [];
    this.foods = [];
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
      if (neighbor.y > currentTile.y) { /*Bottom*/
        currentTile.bottom = false;
        neighbor.top = false;
      }
      if (neighbor.y < currentTile.y) { /*Top*/
        currentTile.top = false;
        neighbor.bottom = false;
      }
      if (neighbor.x < currentTile.x) { /*Left*/
        currentTile.left = false;
        neighbor.right = false;
      }
      if (neighbor.x > currentTile.x) { /*Right*/
        currentTile.right = false;
        neighbor.left = false;
      }
      /*Update Current Tile*/
      currentTile = neighbor;
    } else {
    /*If no neighbor was found, backtrack to a previous cell on the stacke*/
      const backtrack = this.visitedStk.pop();
      this.generateMaze(backtrack.y, backtrack.x);
      currentTile = backtrack;
    }
    this.generateMaze(currentTile.y, currentTile.x);
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
    if (row >= 0 && col < this.x - 1) {
      right = this.tiles[row][col + 1];
      (!right.visited) ? stk.push(right): undefined;
    }

    /* Check for top neighbor */
    if (col >= 0 && row > 0) {
      top = this.tiles[row - 1][col];
      (!top.visited) ? stk.push(top): undefined
    }
    /* Check for bottom neighbor */
    if (col >= 0 && row < this.y - 1) {
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
    this.human = new Human(0, 0, '../assets/images/baby.png');
    this.human.data.onload = () => {
      this.ctx.drawImage(this.human.data, this.mazeSize * this.human.x + 5, this.mazeSize * this.human.y + 5);
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
  changeX(value: number): void {
    this.x = this.x + value;
    this.reDrawMaze();
  }
  changeY(value: number): void {
    this.y = this.y + value;
    this.reDrawMaze();
  }
  setPercentageOfZombies(val: number): void {
    this.percentageOfZombie =  parseFloat(this.percentageOfZombie + (val / 100));
    this.reDrawMaze();
  }
  setPercentageOfFoods(val: number): void {
    this.percentageOfFood =  parseFloat(this.percentageOfFood + (val / 100));
    this.reDrawMaze();
  }
  refreshMaze() {
    this.clearCanvas();
    this.refreshBase();
    this.refreshObjects();
  }
  refreshFood() {
    this.foods.forEach((food) => {
      this.ctx.drawImage(food.data,
        this.mazeSize * food.x - this.mazeSize + 5,
        this.mazeSize * food.y - this.mazeSize + 5
      );
    });
  }
  refreshZombies() {
    this.zombies.forEach((zombie) => {
      this.ctx.drawImage(zombie.data, this.mazeSize * zombie.x - this.mazeSize + 5, this.mazeSize * zombie.y - this.mazeSize + 5);
    });
  }
  refreshBase() {
    /* Draw the tiles on the canvas*/
    for (let i = 0; i < this.y; i++) {
      for (let j = 0; j < this.x; j++) {
        this.drawCell(j * this.mazeSize, i * this.mazeSize, this.mazeSize, this.tiles[i][j]);
      }
    }
  }
  refreshObjects() {
    this.ctx.drawImage(this.human.data, this.mazeSize * this.human.x + 5, this.mazeSize * this.human.y + 5);
    this.refreshFood();
    this.refreshZombies();
  }
  startSimulation() {
    if (this.checkIfItsVisited(this.human, this.tiles[0][0])) {
      this.human.visitedTiles.push(this.tiles[0][0]);
      this.tiles.forEach((tile) => {
        tile.visited = false;
      });
    }
    const interval = setInterval(() => {
      this.selectTile();
      this.hp = this.hp - 2;
      this.refreshMaze();
      if (this.human.x === this.x - 1 && this.human.y === this.y - 1) {
        clearInterval(interval);
      }
    }, 500);
  }
  selectTile() {
    // console.log(this.tiles);
    let possibleSelects = [];
    const currentTile = this.tiles[this.human.y][this.human.x];
    console.log('Tile before move',currentTile);
    if (!currentTile.left) {
      possibleSelects.push(this.tiles[this.human.y][this.human.x - 1]);
    }
    if (!currentTile.right) {
      possibleSelects.push(this.tiles[this.human.y][this.human.x + 1]);
    }
    if (!currentTile.top) {
      possibleSelects.push(this.tiles[this.human.y - 1][this.human.x]);
    }
    if (!currentTile.bottom) {
      possibleSelects.push(this.tiles[this.human.y + 1][this.human.x]);
    }
    possibleSelects = this.sortPossibleSelects(possibleSelects);
    console.log('array of possibleselects', possibleSelects);
    let selectCompleted = false;
    let possibleSelectsIterator = -1;
    while (!selectCompleted) {
      possibleSelectsIterator = possibleSelectsIterator + 1;
      // console.log(possibleSelects, possibleSelectsIterator);
      if (possibleSelectsIterator > possibleSelects.length - 1) {
        break;
      }
      selectCompleted = this.checkIfItsVisited(this.human, possibleSelects[possibleSelectsIterator]);
    }
    if (selectCompleted) {
      this.human.x = possibleSelects[possibleSelectsIterator].x;
      this.human.y = possibleSelects[possibleSelectsIterator].y;
      this.tiles[this.human.y][this.human.x].visited = true;
      this.human.visitedTiles.push(possibleSelects[possibleSelectsIterator]);
    } else {
      this.tiles[this.human.y][this.human.x].trap = true;
      let goBack = this.human.visitedTiles.pop();
      if (goBack.x === this.human.x && goBack.y === this.human.y) {
        goBack = this.human.visitedTiles.pop();
      }
      console.log('Go back: ', goBack);
      this.human.x = goBack.x;
      this.human.y = goBack.y;
      this.human.visitedTiles.push(this.tiles[this.human.y][this.human.x]);
    }

    console.log("X,Y AFTER MOVE: ", this.tiles[this.human.y][this.human.x]);
  }
  sortPossibleSelects(possibleSelects) {
    let byCost = possibleSelects.slice(0);
    byCost.sort(function(a, b) {
      return b.cost - a.cost;
    });
    return byCost;
  }
  checkIfItsVisited(human, possibleSelect) {
    if (possibleSelect === undefined || possibleSelect.trap) {
      return false;
    }
    let canBeVisited = true;
    this.human.visitedTiles.forEach((tile) => {
      if ((tile.x === possibleSelect.x && tile.y === possibleSelect.y) || !possibleSelect.visited) {
        canBeVisited = false;
      }
    });
    return canBeVisited;
  }
}
