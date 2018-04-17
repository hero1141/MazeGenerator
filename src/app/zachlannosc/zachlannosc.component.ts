// import { Component, OnInit } from '@angular/core';
// import { Point } from './point.model';
//
// @Component({
//   selector: 'app-zachlannosc',
//   templateUrl: './zachlannosc.component.html',
//   styleUrls: ['./zachlannosc.component.css']
// })
// export class ZachlannoscComponent implements OnInit {
//   points = [];
//   cel: Point = new Point(5, 5, 0);
//   currentX = 0;
//   currentY = 0;
//   sumaKosztow = 0;
//   constructor() { }
//
//   ngOnInit() {
//     for (let i = 0 ; i < 10; i++) {
//       for (let j = 0 ; j < 10 ; j++) {
//         this.points.push(new Point(j, i, Math.floor(Math.random() * 10)));
//       }
//     }
//     console.log(this.points);
//     while (this.currentX !== this.cel.x || this.currentY !== this.cel.y) {
//       if (((this.points[(this.currentY + 1) * 10 + this.currentX].koszt < this.points[(this.currentY ) * 10 + this.currentX + 1 ].koszt )
//           && this.currentY < this.cel.y) || (this.currentX === this.cel.x && this.currentY !== this.cel.y)  ) {
//             this.currentY += 1;
//       } else if (this.currentX < this.cel.x) {
//         this.currentX += 1;
//       }
//       console.log(this.currentX, this.currentY);
//     }
//   }
//
// }
