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
  agents = 10;
  foods: Food[] = [];
  humans: Human[] = [];
  zombies: Zombie[] = [];
  percentageOfFood: any = 0.1;
  percentageOfZombie: any = 0.02;
  percentOfExploration = 1;
  time = 100;
  howManyDiedLastIteration = 0;
  clearInterval = false;
  simulation = false;
  constructor() {}

  ngAfterViewInit() {
    this.canvas = this.canvas.nativeElement;
    this.init();
  }

  stopSimulation() {
    this.simulation = false;
  }

  start() {
    this.simulation = true;
    this.startSimulation();
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
    for (let i = 0; i < this.y; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < this.x; j++) {
        this.tiles[i].push(new Point(j, i, this.x - 1, this.y - 1 ));
        this.drawCell(j * side, i * side, side, this.tiles[i][j]);
      }
    }
    this.removeRandomWalls();
    this.generateMaze(0, 0);
  }
  removeRandomWalls() {
    for (let i = 0; i < this.y - 2; i++) {
      for (let j = 1; j < this.x - 2; j++) {
        let rand = Math.random();
        if (rand < 0.7) {
          this.tiles[i][j].bottom = false;
          this.tiles[i + 1][j].top = false;
        }
        rand = Math.random();
        if (rand < 0.7) {
          this.tiles[i][j].right = false;
          this.tiles[i][j + 1].left = false;
        }
      }
    }
  }
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  changeAgents(val) {
    this.agents = this.agents + val;
    this.reDrawMaze();
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
  refreshHp() {
    this.humans.forEach((human) => {
      human.hp = 100;
    });
  }

  reDrawMaze() {
    /*Button Handle for 'New Maze' */
    this.percentOfExploration = 1;
    
    this.zombies = [];
    this.foods = [];
    this.clearCanvas();
    this.drawBase();
    this.respawnObjects();

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
    this.generateFood();
    this.generateZombies();
    this.humans = [];
    for (let i = 0 ; i < this.agents ; i++) {
      let human = new Human('../assets/images/baby.png');
      this.getTileForHuman(human);
      this.humans.push(human);
      this.humans[i].data.onload = () => {
        this.ctx.drawImage(this.humans[i].data, this.mazeSize * this.humans[i].x + 5, this.mazeSize * this.humans[i].y + 5);
      };
    }
    console.log("Zombies", this.zombies);
    console.log("Food", this.foods );
  }
  generateFood() {
    for (let i = 0; i < Math.floor(this.x * this.y * this.percentageOfFood) ; i++) {
      const food = new Food(Math.floor(Math.random() * this.x ), Math.floor(Math.random() * this.y  ));
      this.foods.push(food);
      food.data.onload = () => {
        this.ctx.drawImage(food.data, this.mazeSize * food.x  + 5, this.mazeSize * food.y  + 5);
      };
    }
  }

  generateZombies() {
    for (let i = 0; i < Math.floor(this.x * this.y  * this.percentageOfZombie) ; i++) {
      const zombie = new Zombie();
      this.getTileForZombie(zombie);
      this.zombies.push(zombie);
      zombie.data.onload = () => {
        this.ctx.drawImage(zombie.data, this.mazeSize * zombie.x + 5, this.mazeSize * zombie.y  + 5);
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
      if (food.visible) {
        this.ctx.drawImage(food.data,
          this.mazeSize * food.x  + 5,
          this.mazeSize * food.y  + 5
        );
      }
    });
  }
  refreshZombies() {
    this.zombies.forEach((zombie) => {
      this.ctx.drawImage(zombie.data, this.mazeSize * zombie.x + 5, this.mazeSize * zombie.y + 5);
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
    this.humans.forEach((human) => {
      if (human.isAlive) {
        this.ctx.drawImage(human.data, this.mazeSize * human.x + 5, this.mazeSize * human.y + 5);
      }
    });
    this.ctx.font = '10px Arial';
    for (let i = 0; i < this.y; i++) {
      for (let j = 0; j < this.x; j++) {
        this.ctx.fillText(this.tiles[i][j].cost, this.mazeSize * this.tiles[i][j].x + 5, this.mazeSize * this.tiles[i][j].y + 25);
      }
    }
    this.refreshFood();
    this.refreshZombies();
  }

  getTileForZombie(zombie) {
    let isOnFood = true;
    while(isOnFood) {
      isOnFood = false;
      let x = Math.floor(Math.random() * (this.x));
      let y = Math.floor(Math.random() * (this.y));
      this.foods.forEach((food) => {
        if (food.x === x && food.y === y) {
          isOnFood = true;  
        }
      });
      if (!isOnFood) {
        zombie.x = x;
        zombie.y = y;
      }
    }
  }

  getTileForHuman(human) {
    let isWrongTile = true;
    while(isWrongTile) {
      isWrongTile = false;
      let x = Math.floor(Math.random() * (this.x));
      let y = Math.floor(Math.random() * (this.y));

      this.zombies.forEach((zombie) => {
        if (zombie.x === x && zombie.y === y) {
          isWrongTile = true;  
        }
      });
      this.foods.forEach((food) => {
        if (food.x === x && food.y === y) {
          isWrongTile = true;  
        }
      });
      this.humans.forEach((human) => {
        if (human.x === x && human.y === y) {
          isWrongTile = true;  
        }
      });
      if (!isWrongTile) {
        human.x = x;
        human.y = y;
      }
    }
  }

  newIteration() {
    this.percentOfExploration = this.percentOfExploration >= 0 ? this.percentOfExploration - this.countPercentOfExploration() : this.percentOfExploration;
    this.howManyDiedLastIteration = 0;
    this.humans.forEach((human) => {
      this.updateCosts(human);
      human.hp = 100;
      human.visitedTiles = [];
      human.way = [];
      this.getTileForHuman(human);
      human.isAlive = true;
      human.traps = [];
    });
    for (let i = 0 ; i < this.y ; i++ ) {
      for (let j = 0 ; j < this.x ; j++) {
        this.tiles[i][j].visited = false;
      }
    }
    this.startSimulation(); 
  }
  countPercentOfExploration() {
    return (this.agents/30)/100;
  }
  updateCosts(human) {
    if (!human.isAlive) {
      this.howManyDiedLastIteration += 1;
    }
    let index = human.way.length - 1;
    let value = human.isAlive ? 100 : -500;
    if (!human.isAlive) {
      const tile = human.way[index];
      human.way.pop();
      tile.cost = tile.cost + value;
      value = -100;
      index = index - 1;
    }
    while (human.way.length > 0) {
      const tile = human.way[index];
      human.way.pop();
      value = human.isAlive ? value - 2 : value + 2;
      tile.cost = tile.cost + value;
      index = index - 1;
    }
  }


    


  startSimulation() {
    // this.humans.forEach((human) => {
    //   human.visitedTiles.push(this.tiles[human.y][human.x]);
    //   human.way.push(this.tiles[human.y][human.x]);
    // });
    const interval = setInterval(() => {
      if (!this.simulation) {
        clearInterval(interval);
      } else {
        if (this.clearInterval) {
          this.clearInterval = false;
          clearInterval(interval);
          this.startSimulation();
        }
        if (this.endOfIteration()) {
          clearInterval(interval);
          this.newIteration();
        } else {
          console.log(this.humans);
          this.selectTile();
          this.humans.forEach((human) => {
            if (human.x !== this.x - 1 || human.y !== this.y - 1) {
              human.changeHp(this.x, this.y);
              this.checkIfYouAreDead(human);
            }
          });
          this.refreshMaze();
        } 
      }
    }, this.time);
  }
  setTime(time) {
    this.time = this.time + time;
    this.clearInterval = true;
  }
  endOfIteration() {
    let isEnd = true;
    this.humans.forEach((human) => {
      if ((human.x !== this.x - 1 || human.y !== this.y - 1) && human.isAlive) {
        isEnd = false;
      }
    });
    return isEnd;
  }
  selectTile() {
    this.humans.forEach((human) => {
      if ((human.x !== this.x - 1 || human.y !== this.y - 1) && human.isAlive ) {
        let possibleSelects = [];
        const currentTile = this.tiles[human.y][human.x];
        if (!currentTile.right) {
          possibleSelects.push(this.tiles[human.y][human.x + 1]);
        }
        if (!currentTile.bottom) {
          possibleSelects.push(this.tiles[human.y + 1][human.x]);
        }
        if (!currentTile.left) {
          possibleSelects.push(this.tiles[human.y][human.x - 1]);
        }
        if (!currentTile.top) {
          possibleSelects.push(this.tiles[human.y - 1][human.x]);
        }
        const random = Math.random();
        if (random <= this.percentOfExploration) {
          possibleSelects = this.randomSortPossibleSelects(possibleSelects);
        } else {
          possibleSelects = this.sortPossibleSelects(possibleSelects);
        }
        let selectCompleted = false;
        let possibleSelectsIterator = -1;
        while (!selectCompleted) {
          possibleSelectsIterator = possibleSelectsIterator + 1;
          // console.log(possibleSelects, possibleSelectsIterator);
          if (possibleSelectsIterator > possibleSelects.length - 1) {
            break;
          }
          selectCompleted = this.checkIfItsVisited(human, possibleSelects[possibleSelectsIterator]);
        }
        if (selectCompleted) {
          human.x = possibleSelects[possibleSelectsIterator].x;
          human.y = possibleSelects[possibleSelectsIterator].y;
          this.tiles[human.y][human.x].visited = true;
          human.visitedTiles.push(possibleSelects[possibleSelectsIterator]);
          human.way.push(possibleSelects[possibleSelectsIterator]);
        } else {
          human.traps.push(this.tiles[human.y][human.x]);
          let goBack = human.visitedTiles.pop();
          // console.log(human.visitedTiles, possibleSelects);
          if (goBack.x === human.x && goBack.y === human.y) {
            goBack = human.visitedTiles.pop();
          }
          human.x = goBack.x;
          human.y = goBack.y;
          human.visitedTiles.push(this.tiles[human.y][human.x]);
          human.way.push(this.tiles[human.y][human.x]);
        }
        this.checkIfYouAreOnFood(human);
        this.checkIfYouAreOnZombie(human);
      }
    });
  }

  checkIfYouAreDead(human) {
    if (human.hp <= 0) {
      human.isAlive = false;
    }
  }

  randomSortPossibleSelects(possibleSelects) {
    //console.log(possibleSelects);
    // possibleSelects = possibleSelects.slice(0);
    possibleSelects.sort(function(a, b) {
      return 0.5 - Math.random();
    });
    console.log(possibleSelects);
    return possibleSelects;
  }
  checkIfYouAreOnFood(human) {
    this.foods.forEach((food) => {
      if (human.x === food.x && human.y === food.y) {
        this.humans.forEach((human) => {
          human.hp = 100;
        });      
      }
    });
  }
  checkIfYouAreOnZombie(human) {
   this.zombies.forEach((zombie) => {
     if (human.x === zombie.x && human.y === zombie.y) {
       human.isAlive = false;
       human.hp = 0;
     }
   });
  }
  sortPossibleSelects(possibleSelects) {
    let byCost = possibleSelects.slice(0);
    byCost.sort(function(a, b) {
      return b.cost - a.cost;
    });
    return byCost;
  }
  checkIfItsVisited(human, possibleSelect) {
    if (possibleSelect === undefined || this.checkIfItsTrap(possibleSelect, human)) {
      return false;
    }
    let canBeVisited = true;
    human.visitedTiles.forEach((tile) => {
      if ((tile.x === possibleSelect.x && tile.y === possibleSelect.y)) {
        canBeVisited = false;
      }
    });
    return canBeVisited;
  }
  checkIfItsTrap(tile, human) {
    let isTrap = false;
    human.traps.forEach((trap) => {
      if (trap.x === tile.x && trap.y === tile.y) {
        isTrap = true;
      }
    });
    return isTrap;
  }
}
