import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Point } from './point/point.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  ctx;
  tiles = [];
  visitedStk = [];
  @ViewChild("mazeCanvas") canvas;
  mazeSize: number = 40;

  constructor() {

  }

  ngAfterViewInit() {
    this.canvas = this.canvas.nativeElement;
    this.init();
  }


   createPoint(nRow, nCol) {
    /*Cell class*/
    return {
      row: nRow,
      col: nCol,
      visited: false,
      left: true,
      right: true,
      top: true,
      bottom: true
    };
  }

  init() {
    /*Initialize needed variables. */
    this.ctx = this.canvas.getContext("2d");
    this.drawBase();
  }

  drawLine(sX, sY, eX, eY) {
    /*Draw a line from the starting X and Y positions to  the ending X and Y positions*/
    this.ctx.moveTo(sX, sY);
    this.ctx.lineTo(eX, eY);
  }

  drawCell(x, y, side, tile) {
    /* Draw cell based on wall properties */
    let left = tile.left;
    let right = tile.right;
    let top = tile.top;
    let bottom = tile.bottom;
    let size = this.mazeSize;
    this.ctx.beginPath();
    if (left) {
      this.drawLine(x, y, x, y + size);
    }

    if (right) {
      this.drawLine(x + size, y, x + size, y + size);
    }

    if (bottom) {
      this.drawLine(x, y + size, x + size, y + size)
    }

    if (top) {
      this.drawLine(x, y, x + size, y);
    }
    this.ctx.stroke();
  }

  drawBase() {
    /* Draw the tiles on the canvas*/
    let side = this.mazeSize;
    for (let i = 0; i < 20; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < 20; j++) {
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
    let side = this.mazeSize;
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        currentTile = this.tiles[j][i];
        this.drawCell(i * side, j * side, side, currentTile);
      }
    }
  }

  reDrawMaze() {
    /*Button Handle for 'New Maze' */
    let startCol = Math.floor(Math.random() * 10) - 1;
    let startRow = Math.floor(Math.random() * 10) - 1;
    this.clearCanvas();
    this.drawBase();
  }

  generateMaze(row, col) {
    /* Depth First Search*/
    let currentTile = this.tiles[row][col];
    let neighbor = this.findNeighbor(row, col);
    /*Check if cell has been visited */
    if (!currentTile.visited) {
      currentTile.visited = true;
      this.visitedStk.push(currentTile);
    }
    /* Break Case */
    if (this.visitedStk.length == 0) {
      this.redrawTiles();
      return;
    }
    /*If a neighbor is found*/
    else if (neighbor !== undefined) {

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
    }
    /*If no neighbor was found, backtrack to a previous cell on the stacke*/
    else {
      let backtrack = this.visitedStk.pop();
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
}
