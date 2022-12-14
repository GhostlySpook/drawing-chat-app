import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DrawingCanvasComponent } from '../drawing-canvas/drawing-canvas.component';
import { DrawingMessage } from 'src/app/models/drawingmessage';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('drawingCanvas', { static: true }) drawingCanvas!: DrawingCanvasComponent;
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  imagesPaths: any = [];
  drawingsList: any = [];
  conversionCanvas: any;
  messageState: string;

  constructor(public http: HttpClient) {
    this.conversionCanvas = document.createElement("canvas");
    this.messageState = "Idle";
    console.log(this.drawingCanvas)
   }

  ngOnInit(): void {
    //Load chat images-----PLACEHOLDER
    //this.imagesPaths = ['/assets/img/Aurora.png', '/assets/img/ezgif-3-67ee4f7ac2.gif', 'assets/img/Fe4L639VUAA5oGN.png', 'assets/img/Giratina kart.PNG', 'assets/img/red crayon.png']

    this.loadImages();
    console.log(this.drawingsList.length);
  }

  loadImages(){
    this.messageState = "Loading";

    this.http.get("http://localhost:3000/api/drawings").subscribe( x => 
    {
      this.drawingsList = x;

      for(let item of this.drawingsList){
        let img = new Image();

        let total = item.width * item.height * 4;
        let u8 = new Uint8ClampedArray(total);

        for(let i = 0; i < total; i++){
          u8[i] = item.data[i];
        }

        let idata = new ImageData(u8, item.width, item.height, { colorSpace: item.colorSpace })
        this.conversionCanvas.width = item.width;
        this.conversionCanvas.height = item.height;
        let conversionContext = this.conversionCanvas.getContext("2d");


        conversionContext.putImageData(idata, 0, 0);
        this.imagesPaths.push(this.conversionCanvas.toDataURL("image/png"));
      }

      this.messageState = "Idle";
    }
    );
  }

  

  sendImage(): void{
    this.messageState = "Sending";

    let imagedata = this.drawingCanvas.getCanvasImage()

    let drawingMessage: DrawingMessage = {
      data: imagedata.data,
      width: imagedata.width,
      height: imagedata.height,
      colorSpace: imagedata.colorSpace
    }

    this.http.post("http://localhost:3000/api/drawings", {drawing: drawingMessage}).subscribe( x => 
      this.messageState = "Idle"
    );
  }

}
