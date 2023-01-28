import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-drawing-canvas',
  templateUrl: './drawing-canvas.component.html',
  styleUrls: ['./drawing-canvas.component.scss']
})

export class DrawingCanvasComponent implements OnInit {
  static drawingCanvasTools = {
    NONE: 0,
    BRUSH: 1,
    BUCKET: 2,
    ERASER: 3
  }

  static hexColour = {
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

  redoFramesList: any = [];
  redoPointer: number;
  redoLimit: number;

  constructor() { 
    this.brushRadius = 10;
    this.eraserRadius = 10;
    this.toolSelected = DrawingCanvasComponent.drawingCanvasTools.BRUSH;
    this.colourSelected = DrawingCanvasComponent.hexColour.BLACK;

    this.isDrawing = false;
    this.isAvailable = true;

    //Redo values
    this.redoFramesList = [];
    this.redoPointer = 0;
    this.redoLimit = 10;
  }

  ngOnInit(): void {
    this.drawingCanvas = <HTMLCanvasElement> document.getElementById("drawingCanvas")
    this.context = this.drawingCanvas.getContext("2d");

    this.drawingCanvas.width = window.innerWidth * 0.70;
    this.drawingCanvas.height = window.innerHeight;
  }

  ngAfterViewInit() {
    this.context.fillStyle = "#ffffff";
    this.context.lineWidth = 10;
    this.context.lineCap = "round";
    this.context.lineJoin = "round";
    this.context.willReadFrequently = true;

    this.clearRedo();
  }

  //Drawing methods
  draw(px: number, py: number){
    px = Math.floor(px);
    py = Math.floor(py);

    let pastCompositeOperation = this.context.globalCompositeOperation;
    switch(this.toolSelected){
        case DrawingCanvasComponent.drawingCanvasTools.NONE:
            break;
        case DrawingCanvasComponent.drawingCanvasTools.BRUSH:
            this.context.lineTo(px, py);
            this.context.stroke();
            break;
        case DrawingCanvasComponent.drawingCanvasTools.ERASER:
            this.context.lineTo(px, py);
            this.context.globalCompositeOperation = 'destination-out';
            this.context.stroke();
            this.context.globalCompositeOperation = pastCompositeOperation;
            break;
        case DrawingCanvasComponent.drawingCanvasTools.BUCKET:
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

    if(this.isDrawing){
        switch(this.toolSelected){
            case DrawingCanvasComponent.drawingCanvasTools.BRUSH:
            case DrawingCanvasComponent.drawingCanvasTools.ERASER:
                this.addRedo(this.getCanvasImage());
                break;
        }
    }

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

  getCanvasImage(){
    return this.context.getImageData(0, 0, this.drawingCanvas.width, this.drawingCanvas.height)
  }

  addRedo(data: any){
        
    let length = this.redoFramesList.length;

    if((this.redoPointer + 1) == length){
        // If it is the last change in memory, don't erase anything in the change list
    }
    else{
        this.redoFramesList = this.redoFramesList.slice(0, this.redoPointer + 1);
    }

    if(this.redoPointer == this.redoLimit - 1){
      this.redoFramesList.shift();
    }
    else{
      this.redoPointer++;
    }

    this.redoFramesList.push(data);
    //console.log(this.redoFramesList);
  }

    clearRedo(){
        this.redoPointer = 0;
        this.redoFramesList = [];
        this.redoFramesList.push(this.getCanvasImage());
    }

  getHexColours(){
    return Object.values(DrawingCanvasComponent.hexColour);
  }
}
