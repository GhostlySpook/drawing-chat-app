import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DrawingService {
  url: string;
  static maxWidth = 512;
  static maxHeight = 512;

  constructor(public http: HttpClient) {
    this.url = "https://drawing-chat-test.herokuapp.com";
    //this.url = "http://localhost:3000";
  }

  sendDrawing(drawingMessage: any){
    return new Promise<any>((resolve, reject) => {
      this.http.post(this.url + "/api/drawings", {drawing: drawingMessage}).subscribe((x: any) => {
      resolve(x);
    })
    })
  }

  //Returns drawings url data
  getDrawings(){
    return new Promise<any>((resolve, reject) => {
      this.http.get(this.url + "/api/drawings").subscribe((x: any) => {
      //console.log("Gotten drawings", x)
      resolve(x);
    })
    })
  }

  getDrawingsPastId(drawingId: number){
    //console.log("Before promise");
    return new Promise<any>((resolve, reject) => {
      try{
        this.http.get(this.url + "/api/drawings/pastId/" + drawingId).subscribe(
          (x: any) => { resolve(x); },
          (error: any) => { reject(error) }
          ) 
      }
      catch(e){
        reject("Caught error getting drawings past id: " + e);
      }
    })
  }
}
