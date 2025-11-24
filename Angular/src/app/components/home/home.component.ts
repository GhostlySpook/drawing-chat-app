import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DrawingCanvasComponent } from '../drawing-canvas/drawing-canvas.component';
import { DrawingMessage } from 'src/app/models/drawingmessage';
import { DrawingService } from 'src/app/services/drawing.service';
import { first, last } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('drawingCanvas', { static: true }) drawingCanvas!: DrawingCanvasComponent;
  @ViewChild('textInput', { static: true }) textInput!: ElementRef;
  @ViewChild('sendButton', { static: true }) sendButton!: HTMLButtonElement;
  @ViewChild('loadButton', { static: true }) loadButton!: HTMLButtonElement;
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  //Toolbar buttons
  @ViewChild('pencilButton', { static: true }) pencilButton!: ElementRef;
  @ViewChild('pencilMenuButton', { static: true }) pencilMenuButton!: ElementRef;
  @ViewChild('sizeRange', { static: true }) sizeRange!: ElementRef;
  @ViewChild('pencilMenu', { static: true }) pencilMenu!: ElementRef;

  @ViewChild('bucketButton', { static: true }) bucketButton!: HTMLInputElement;
  @ViewChild('eraserButton', { static: true }) eraserButton!: ElementRef;
  @ViewChild('bombButton', { static: true }) bombButton!: ElementRef;

  @ViewChild('btnColourContainer', { static: true }) btnColourContainer!: ElementRef;
  @ViewChild('colourMenu', { static: true }) colourMenu!: ElementRef;

  textMessageInput: string;

  //imagesPaths: any = [];
  messageList: any = [];
  drawingsList: any = [];
  conversionCanvas: any;
  messageState: string;
  isButtonEnabled: boolean;

  selectableToolButtons: any = [];
  selectedTool: any;
  isPencilMenuDisplayed: boolean;
  isColourMenuDisplayed: boolean;
  colourButtonWidth: number;
  colourButtonHeight: number;

  brushRadius: any;

  loadImageInterval: any;
  milisecondsForLoading: number;

  firstLoad: boolean;
  firstLoadNo: number;
  wasAtBottom: boolean;
  //shouldScrollDown: boolean;
  //finishedLoading = false;

  constructor(private drawingService: DrawingService) {
    this.textMessageInput = "";

    this.conversionCanvas = document.createElement("canvas");
    this.messageState = "Idle";
    this.isButtonEnabled = false;

    this.selectableToolButtons = [
        this.pencilButton,
        this.bucketButton,
        this.eraserButton,
        this.bombButton
    ];

    this.selectedTool = null;

    this.isPencilMenuDisplayed = false;
    this.isColourMenuDisplayed = false;
    this.colourButtonHeight = 0;
    this.colourButtonWidth = 0;
    
    this.brushRadius = 0;

    this.milisecondsForLoading = 15000;

    this.wasAtBottom = false;
    this.firstLoad = true;
    this.firstLoadNo = 0;
   }

  ngOnInit(): void {
    this.messageState = "Loading";
    this.isButtonEnabled = false;
    this.loadMessages();

    //Resize colour button
    this.colourMenu.nativeElement.style.display="block";

    this.colourButtonWidth = (this.colourMenu.nativeElement.clientWidth / Object.keys(DrawingCanvasComponent.hexColour).length) - 0.1;
    this.colourButtonHeight = this.colourMenu.nativeElement.clientHeight;

    this.colourMenu.nativeElement.style.display="none";

    //Add an interval to load images every now and then
    this.loadImageInterval = setInterval(() => this.loadMessages(), this.milisecondsForLoading);

    //Add shortcuts
    document.addEventListener("keydown", (e) => this.shortcutFunction(e));

    window.addEventListener("pointerdown", (e) => this.pressingWindowFunction(e));
  }

  ngAfterViewChecked(){  
    if(this.wasAtBottom){
      //console.log("Should scroll:", this.shouldScrollDown);
      this.scrollChatContainerDown();
      this.wasAtBottom = false;
    }
  }

  sendButtonHandler(){
    this.sendMessage();
  }

  sendDrawingButtonHandler(){
    this.sendImage();
  }

  loadButtonHandler(){
    this.loadMessages();
  }

  saveDrawingButtonHandler(){
    //console.log("Saving...")

    let canvasUrl = this.drawingCanvas.drawingCanvas.toDataURL("image/jpeg");
    const createEl = document.createElement('a');
    createEl.href = canvasUrl;

    // This is the name of our downloaded file
    createEl.download = "drawing";

    // Click the download button, causing a download, and then remove it
    createEl.click();
    createEl.remove();
  }

  scrollChatContainerDown(){
    //this.chatContainer.nativeElement.scrollTop = 900;
    /*console.log(this.chatContainer.nativeElement.scrollTop)
    console.log(this.chatContainer.nativeElement.scrollHeight)*/
    if(this.wasAtBottom || this.firstLoadNo > 0){
      if(this.firstLoadNo != 0){
        this.firstLoadNo--
      }

      //this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }, 0);
      //this.shouldScrollDown = false;
    }
    /*console.log(this.chatContainer.nativeElement.scrollTop)
    console.log(this.chatContainer.nativeElement.scrollHeight)*/
  }

  //Toolbar buttons
  sizeRangeChangeHandler(){
    this.drawingCanvas.context.lineWidth = this.drawingCanvas.brushRadius;
  }

  pencilMenuToggle(){
      this.isPencilMenuDisplayed = !(this.isPencilMenuDisplayed);
  }

  pencilMenuHide(){
      this.isPencilMenuDisplayed = false;
  }

  //Define customized behaviour for components
  pencilButtonClickHandler(){
      this.drawingCanvas.toolSelected = DrawingCanvasComponent.drawingCanvasTools.BRUSH;
      this.drawingCanvas.context.strokeStyle = this.drawingCanvas.colourSelected;

      this.drawingCanvas.context.lineCap = "round";
      this.drawingCanvas.context.lineJoin = "round";
      this.drawingCanvas.context.lineWidth = this.drawingCanvas.brushRadius;

      //Make the pencil menu appear
      this.pencilMenuHide();
  }

  pencilMenuButtonClickHandler(){
      this.pencilMenuToggle();
  }

  eraserButtonClickHandler(){
      this.drawingCanvas.toolSelected = DrawingCanvasComponent.drawingCanvasTools.ERASER;

      this.drawingCanvas.context.lineCap = "round";
      this.drawingCanvas.context.lineJoin = "round";
      this.drawingCanvas.context.lineWidth = this.drawingCanvas.eraserRadius * 2;
  }

  bucketButtonClickHandler(){
      this.drawingCanvas.toolSelected = DrawingCanvasComponent.drawingCanvasTools.BUCKET;
  }

  bombButtonClickHandler(){
      this.drawingCanvas.bombClear();
      this.pencilButtonClickHandler();
  }

  showColoursButtonHandler(){
    this.isColourMenuDisplayed = !this.isColourMenuDisplayed;
  }

  colourButtonHandler(colour: string){
    this.drawingCanvas.colourSelected = colour;
    this.drawingCanvas.context.strokeStyle = colour;

    this.isColourMenuDisplayed = false;

    //this.btnColourContainer.nativeElement.style.background = colour;

    //Hide the menu
    //colourMenu.hide();
  }

  undoButtonClickHandler(){

      //If it is the first step, don't do anything
      if(this.drawingCanvas.redoPointer == 0){
          return false;
      }

      //Show previous frame
      this.drawingCanvas.redoPointer--;
      this.drawingCanvas.context.putImageData(this.drawingCanvas.redoFramesList[this.drawingCanvas.redoPointer], 0, 0);

      return true;
  }

  redoButtonClickHandler(){

      //If it is the last frame, don't do anything
      if(this.drawingCanvas.redoPointer == (this.drawingCanvas.redoFramesList.length - 1)){
          return false;
      }

      //Show previous frame
      this.drawingCanvas.redoPointer++;
      this.drawingCanvas.context.putImageData(this.drawingCanvas.redoFramesList[this.drawingCanvas.redoPointer], 0, 0);

      return true;
  }

  loadMessages(){ 
    return new Promise<any>((resolve, reject) => {
      //console.log("Start loading- Removing interval: ", this.loadImageInterval);
      clearInterval(this.loadImageInterval);
      //console.log("Interval removed: ", this.loadImageInterval);

      this.messageState = "Loading";
      this.isButtonEnabled = false;
      let lastDrawingNo;

      if(this.drawingsList.length > 0){
        //Get the biggest Id number
        lastDrawingNo = this.drawingsList.reduce((accumulator: number, currentValue: any) => {
          if(accumulator < currentValue.id){
            return currentValue.id;
          }
          else{
            return accumulator;
          }
        }, /*Initial value*/ -1);
      }
      else{
        lastDrawingNo = -1;
      }

      //console.log(lastDrawingNo)

      //Take drawing messages from the server
      this.drawingService.getDrawingsPastId(lastDrawingNo).then((x) => {

        //console.log(x)

        //Add them to a temp list
        for(let item of x){
          this.drawingsList.push(item);
        }

        let newDrawings = x;

        this.wasAtBottom = this.chatContainer.nativeElement.scrollTop + this.chatContainer.nativeElement.clientHeight == this.chatContainer.nativeElement.scrollHeight;
        if(newDrawings.length > 0 && this.firstLoad){
          this.firstLoadNo = newDrawings.length
          this.firstLoad = false;
        }

        //Create a new image after taking the data of each received drawing
        for(let item of newDrawings){
          if(item.data != null){
            let img = new Image();

            let total = item.width * item.height * 4;
            let u8 = new Uint8ClampedArray(total);

            //Take bits of drawings and create a new imagedata object from the 8-bit array
            for(let i = 0; i < total; i++){
              u8[i] = item.data[i];
            }

            let idata = new ImageData(u8, item.width, item.height, { colorSpace: item.colorSpace })
            this.conversionCanvas.width = item.width;
            this.conversionCanvas.height = item.height;
            let conversionContext = this.conversionCanvas.getContext("2d");


            //Create an image inside a canvas using the new ImageData and add it to the imagesPaths variable to display them
            conversionContext.putImageData(idata, 0, 0);
            //this.imagesPaths.push(this.conversionCanvas.toDataURL("image/png"));
            this.messageList.push({path: this.conversionCanvas.toDataURL("image/png"), text: item.textMessage});
          }
          else{
            this.messageList.push({path: null, text: item.textMessage});
          }
        }

        this.messageState = "Idle";
        this.isButtonEnabled = true;
        //console.log("Loaded images in promise!");
        //console.log("Messages to load in chat:", this.messageList);

      }).catch((reason) => {
        console.error("Error retrieving drawings:", reason);
        reject("Rejected Drawing Past Id Promise");
        this.messageState = "Connection Error";
      });

      this.loadImageInterval = setInterval(() => this.loadMessages(), this.milisecondsForLoading);
      //console.log("Created interval")
      resolve(true);
    })
  }

  loadImages(){ 
    return new Promise<any>((resolve, reject) => {
      //console.log("Start loading- Removing interval: ", this.loadImageInterval);
      clearInterval(this.loadImageInterval);
      //console.log("Interval removed: ", this.loadImageInterval);

      this.messageState = "Loading";
      this.isButtonEnabled = false;
      let lastDrawingNo;

      if(this.drawingsList.length > 0){
        //Get the biggest Id number
        lastDrawingNo = this.drawingsList.reduce((accumulator: number, currentValue: any) => {
          if(accumulator < currentValue.id){
            return currentValue.id;
          }
          else{
            return accumulator;
          }
        }, /*Initial value*/ -1);
      }
      else{
        lastDrawingNo = -1;
      }

      //Take drawing messages from the server
      this.drawingService.getDrawingsPastId(lastDrawingNo).then((x) => {

        //Add them to a temp list
        for(let item of x){
          this.drawingsList.push(item);
        }

        let newDrawings = x;

        //Create a new image after taking the data of each received drawing
        for(let item of newDrawings){
          let img = new Image();

          let total = item.width * item.height * 4;
          let u8 = new Uint8ClampedArray(total);

          //Take bits of drawings and create a new imagedata object from the 8-bit array
          for(let i = 0; i < total; i++){
            u8[i] = item.data[i];
          }

          let idata = new ImageData(u8, item.width, item.height, { colorSpace: item.colorSpace })
          this.conversionCanvas.width = item.width;
          this.conversionCanvas.height = item.height;
          let conversionContext = this.conversionCanvas.getContext("2d");


          //Create an image inside a canvas using the new ImageData and add it to the imagesPaths variable to display them
          conversionContext.putImageData(idata, 0, 0);

          this.messageList.push({path: this.conversionCanvas.toDataURL("image/png"), text: item.textMessage});
          //this.imagesPaths.push(this.conversionCanvas.toDataURL("image/png"));
        }

        this.messageState = "Idle";
        this.isButtonEnabled = true;
        //console.log("Loaded images in promise!");
      }).catch((reason) => {
        console.error("Error retrieving drawings:", reason);
        reject("Rejected Drawing Past Id Promise");
        this.messageState = "Connection Error";
      });

      this.loadImageInterval = setInterval(() => this.loadMessages(), this.milisecondsForLoading);
      //console.log("Created interval")
      resolve(true);
    })
  }

  sendMessage(){
    return new Promise<any>((resolve, reject) => {
      clearInterval(this.loadImageInterval);

      this.isButtonEnabled = false;
      this.messageState = "Sending";

      let drawingMessage: DrawingMessage = {
        data: null,
        width: null,
        height: null,
        colorSpace: null,
        textMessage: this.textMessageInput
      }

      this.drawingService.sendDrawing(drawingMessage).then((x) => {

        this.loadMessages().then((value) => {
          this.messageState = "Idle";
          this.textMessageInput = "";
        }).catch((reason) => {
          console.error("Error loading drawings:", reason);
        });
      });

      this.loadImageInterval = setInterval(() => this.loadMessages(), this.milisecondsForLoading);

      resolve(true);
    })
  }

  sendImage(){

    return new Promise<any>((resolve, reject) => {
      this.isButtonEnabled = false;
      this.messageState = "Sending";

      let imagedata = this.drawingCanvas.getCanvasImage()

      let newWidth = 0;
      let newHeight = 0;
      let ratio = 0;

      let willResize = false;

      //Resize according to width if it is too big
      if(imagedata.width > DrawingService.maxWidth && imagedata.width > imagedata.height){
        newWidth = DrawingService.maxWidth;
        ratio = DrawingService.maxWidth / imagedata.width;
        newHeight = imagedata.height * ratio;
        willResize = true;
      }
      else if(imagedata.height > DrawingService.maxHeight && imagedata.height > imagedata.width){
        newHeight = DrawingService.maxHeight;
        ratio = DrawingService.maxHeight / imagedata.height;
        newWidth = imagedata.width * ratio;
        willResize = true;
      }
      else if(imagedata.height == imagedata.width && imagedata.width > DrawingService.maxWidth){
        newHeight = DrawingService.maxHeight;
        newWidth = DrawingService.maxWidth;
        willResize = true;
      }

      if(willResize){
        //console.log("Will resize: ", imagedata);
        this.conversionCanvas.width = newWidth;
        this.conversionCanvas.height = newHeight;
        let conversionContext = this.conversionCanvas.getContext("2d");
        //console.log("Drawing canvas: ", this.drawingCanvas);

        conversionContext.drawImage(this.drawingCanvas.drawingCanvas, 0, 0, newWidth, newHeight);
        imagedata = conversionContext.getImageData(0, 0, this.conversionCanvas.width, this.conversionCanvas.height)
        //console.log(imagedata);
      }      

      let drawingMessage: DrawingMessage = {
        data: imagedata.data,
        width: imagedata.width,
        height: imagedata.height,
        colorSpace: imagedata.colorSpace,
        textMessage: this.textMessageInput
      }

      this.drawingService.sendDrawing(drawingMessage).then((x) => {

        this.loadMessages().then((value) => {
          this.messageState = "Idle";
          this.textMessageInput = "";
        }).catch((reason) => {
          console.error("Error loading drawings:", reason);
        });
      });

      resolve(true);
    })
  }

  //Shortcuts with your keyboard!
  shortcutFunction(e: KeyboardEvent){
    //Don't use shortcuts while in chat
    //console.log("Active element:", document.activeElement);
    //console.log("Text input:", this.textInput);

    if(document.activeElement == this.textInput.nativeElement){
      return;
    }

    switch(e.key){
        case "b":
        case "B":
            if(this.pencilButton.nativeElement.style.display == "block"){
              this.pencilButtonClickHandler();
            }
            else if(this.pencilMenuButton.nativeElement.style.display == "block"){
              this.pencilMenuButtonClickHandler();
            }
            break;
        case "c":
        case "C":
            this.showColoursButtonHandler();
            break;
        case "f":
        case "F":
            this.bucketButtonClickHandler();
            break;
        case "e":
        case "E":
            if(this.eraserButton.nativeElement.style.display == "block"){
                //console.log("Erase");
                this.eraserButtonClickHandler();
            }
            else if(this.bombButton.nativeElement.style.display == "block"){
                //console.log("Bomb");
                this.bombButtonClickHandler();
            }
            break;
        case "z":
        case "Z":
            if(e.ctrlKey){
                this.undoButtonClickHandler();
            }
            break;
        case "y":
        case "Y":
            if(e.ctrlKey){
                this.redoButtonClickHandler();
            }
            break;
    }
  }

  pressingWindowFunction(e: Event){
    //If pencil menu is displayed, hide
    if(e.target != this.pencilButton.nativeElement && e.target != this.pencilMenu.nativeElement && e.target != this.sizeRange.nativeElement){
        //console.log("Should hide");
        this.isPencilMenuDisplayed = false;
    }

    //If colour menu is displayed, hide
    if(!((e.target as Element).classList.contains("svgBtnColour"))){
        this.isColourMenuDisplayed = false;
    }
}

  testingFunction(){
    //Take image data
    let image_data = this.drawingCanvas.drawingCanvas.toDataURL("image/png");

    //Send to server
    this.drawingService.sendDrawing(image_data);
  }

  testingLoadFunction(){
    
  }

}
