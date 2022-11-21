import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-drawing-canvas',
  templateUrl: './drawing-canvas.component.html',
  styleUrls: ['./drawing-canvas.component.scss']
})

export class DrawingCanvasComponent implements OnInit {
  drawingCanvasTools = {
    NONE: 0,
    BRUSH: 1,
    BUCKET: 2,
    ERASER: 3
  }

  hexColour = {
    BLACK: "#000000",
    GRAY: "#808080",
    WHITE: "#ffffff",
    PINK: "#ffaacc",
    RED: "#ff0000",
    BROWN: "#964b00",
    ORANGE: "#ffaa00",
    YELLOW: "#ffff00",
    GREEN: "#00a400",
    LIGHTBLUE: "#86c5da",
    BLUE: "#0000c7",
    INDIGO: "#4b0082",
    PURPLE: "#6a006b"
  }

  //Returns an object containing the RGB from a hex colour value
  hexToRgb(hex: any) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),

        //Alpha is 255 for complete coloring from the filling
        a: 255
      } : null;
  }  
  
  drawingCanvas: any;
  context: any;

  backgroundColour: any;
  brushRadius: number;
  eraserRadius: number;
  toolSelected: number;
  colourSelected: string;

  isDrawing: boolean;
  isAvailable: boolean;

  constructor() { 
    this.brushRadius = 10;
    this.eraserRadius = 10;
    this.toolSelected = this.drawingCanvasTools.BRUSH;
    this.colourSelected = this.hexColour.BLACK;

    this.isDrawing = false;
    this.isAvailable = true;
  }

  ngOnInit(): void {
    this.drawingCanvas = <HTMLCanvasElement> document.getElementById("drawingCanvas")
    this.context = this.drawingCanvas.getContext("2d");

    this.context.fillStyle = "#ffffff";
    this.context.lineWidth = 10;
    this.context.lineCap = "round";
    this.context.lineJoin = "round";

    this.drawingCanvas.width = window.innerWidth * 0.70;
    this.drawingCanvas.height = window.innerHeight;
  }

  //Drawing methods
  draw(px: number, py: number){
    px = Math.floor(px);
    py = Math.floor(py);

    let pastCompositeOperation = this.context.globalCompositeOperation;
    switch(this.toolSelected){
        case this.drawingCanvasTools.NONE:
            break;
        case this.drawingCanvasTools.BRUSH:
            this.context.lineTo(px, py);
            this.context.stroke();
            break;
        case this.drawingCanvasTools.ERASER:
            this.context.lineTo(px, py);
            this.context.globalCompositeOperation = 'destination-out';
            this.context.stroke();
            this.context.globalCompositeOperation = pastCompositeOperation;
            break;
        case this.drawingCanvasTools.BUCKET:
            this.bucketFill(px, py, this.colourSelected);
            this.isDrawing = false;
            break;
    }
  }

  //Fill relative to the drawing canvas position
  bucketFill(x: number, y: number, colour: any){

    //1. Get the pixel of the background pixel
    let pixelData = this.context.getImageData(x, y, 1, 1);
    let canvasData = this.context.getImageData(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);

    let canvasWidth = this.drawingCanvas.width;

    //2. Get the colour of the pixel from the background
    let backData = {
        r: pixelData.data[0],
        g: pixelData.data[1],
        b: pixelData.data[2],
        a: pixelData.data[3]
    };

    //3. Get colour of the one selected
    let fillData = this.hexToRgb(colour);

    //4. Create queue array
    let queue = []

    //Return if the pixel is inside the area to be filled, relative to drawing canvas
    function inside(x: number, y: number){
        let p = (x + y*canvasWidth) * 4;
        
        let result = (canvasData.data[p] == backData.r && canvasData.data[(p+1)] == backData.g && canvasData.data[(p+2)] == backData.b && canvasData.data[(p+3)] == backData.a);

        return result;
    }

    //Scan for new seeds
    function scan(lx: number, rx: number, y: number){
        let added = false;
        for(let x = lx; x <= rx; x++){
            if(!(inside(x, y))){
                added = false;
            }
            else if(!added){
                let s = {
                    x: x,
                    y: y
                }
                queue.push(s);
                added = true;
            }
        }
    }

    //Change the colour of that pixel
    function set(x: number, y: number){
        let p = (x + y*canvasWidth) * 4;

        if(fillData != null){
          canvasData.data[p] = fillData.r;
          canvasData.data[(p+1)] = fillData.g;
          canvasData.data[(p+2)] = fillData.b;
          canvasData.data[(p+3)] = fillData.a;
        }
    }

    let s = {
        x: x,
        y: y
    }

    //4. Filling loop
    //console.log("Step five");
    let isSameColour = (backData.r == fillData?.r && backData.g == fillData?.g && backData.b == fillData?.b && backData.a == fillData?.a)

    if((!(inside(s.x,s.y))) || isSameColour){
        //console.log("Already done");
        return
    }

    // 5. Get first seed
    //console.log("Step six");
    queue.push(s);

    while(queue.length > 0 && queue.length < 5000){
        let current = queue.shift();
        
        if(current == null)
          return

        let x = current.x;
        let y = current.y;
        
        let lx = current.x;

        while(inside((lx-1), y)){
            set((lx-1), y);
            lx--;
        }
        while(inside(x, y)){
            set(x, y);
            x++;
        }
        scan(lx, (x-1), (y+1));
        scan(lx, (x-1), (y-1));
    }
    //console.log("Step seven");
    this.context.putImageData(canvasData, 0, 0);
  }

  clearCanvas(){
    this.context.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
  }

  //Events handling
  onPointerDown(e: Event){
    console.log("Drawing")

      if(!this.isAvailable){
          return;
      }

      e.preventDefault()
      let coordinates = this.getLocationOnCanvas(e);

      let px = coordinates.x;
      let py = coordinates.y;
      
      this.context.beginPath();
      this.context.moveTo(px, py);
      this.draw(px, py);
      this.isDrawing = true;
  }

  onPointerUp(e: Event){
      this.finishStroke(e);
  }

  onPointerOut(e: Event){
      this.finishStroke(e);
  }

  onPointerMove(e: Event){
      e.preventDefault();
      let coordinates = this.getLocationOnCanvas(e);

      let px = coordinates.x;
      let py = coordinates.y;

      if(this.isDrawing){
          this.draw(px, py);
      }
  }

  onTouchMove(e: Event){
      e.preventDefault()
      let coordinates = this.getLocationOnCanvas(e);

      let px = coordinates.x;
      let py = coordinates.y;

      this.draw(px, py);
  }

  onTouchEnd(e: Event){
      this.finishStroke(e);
  }

  onTouchCancel(e: Event){
      this.finishStroke(e);
  }

  finishStroke(e: Event){
      if(!this.isAvailable){
          return;
      }

      e.preventDefault();

      this.isDrawing = false;
  }

  //Get the location of the touch
  getLocationOnCanvas(e: any){

      let coordinates = {
          x: 0,
          y: 0
      };

      switch(e.type){
          case 'touchmove':
              coordinates.x = e.touches[0].pageX - e.target.offsetLeft;
              coordinates.y = e.touches[0].pageY - e.target.offsetTop;
              break;
          default:
              coordinates.x = e.pageX - e.target.offsetLeft;
              coordinates.y = e.pageY - e.target.offsetTop;
              break;
      }

      return coordinates;
  }

}
