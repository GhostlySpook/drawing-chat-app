import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DrawingService {

  constructor(public http: HttpClient) {

  }

  /*sendDrawing(drawingMessage: any){
    this.http.post("http://localhost:3000/api/drawings", {drawing: drawingMessage}).subscribe( x => 
      console.log(x)
    );
  }*/
  sendDrawing(drawingMessage: any){
    return new Promise<any>((resolve, reject) => {
      this.http.post("http://localhost:3000/api/drawings", {drawing: drawingMessage}).subscribe((x: any) => {
      resolve(x);
    })
    })
  }

  //Returns drawings url data
  getDrawings(){
    return new Promise<any>((resolve, reject) => {
      this.http.get("http://localhost:3000/api/drawings").subscribe((x: any) => {
      console.log("Gotten drawings", x)
      resolve(x);
    })
    })
  }

  getDrawingsPastId(drawingId: number){
    console.log("Before promise");
    return new Promise<any>((resolve, reject) => {
      this.http.get("http://localhost:3000/api/drawings/pastId/" + drawingId).subscribe((x: any) => {
      console.log("Gotten drawings", x)
      resolve(x);
    })
    })
  }

  /*async getDrawings(){
  }*/
}
