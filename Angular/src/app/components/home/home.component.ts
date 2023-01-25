import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DrawingCanvasComponent } from '../drawing-canvas/drawing-canvas.component';
import { DrawingMessage } from 'src/app/models/drawingmessage';
import { DrawingService } from 'src/app/services/drawing.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('drawingCanvas', { static: true }) drawingCanvas!: DrawingCanvasComponent;
  @ViewChild('sendButton', { static: true }) sendButton!: HTMLButtonElement;
  @ViewChild('loadButton', { static: true }) loadButton!: HTMLButtonElement;
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  //Toolbar buttons
  @ViewChild('pencilButton', { static: true }) pencilButton!: HTMLInputElement;
  @ViewChild('pencilMenuButton', { static: true }) pencilMenuButton!: HTMLInputElement;
  @ViewChild('sizeRange', { static: true }) sizeRange!: HTMLInputElement;
  @ViewChild('pencilMenu', { static: true }) pencilMenu!: HTMLElement;

  @ViewChild('bucketButton', { static: true }) bucketButton!: HTMLInputElement;
  @ViewChild('eraserButton', { static: true }) eraserButton!: HTMLInputElement;
  @ViewChild('bombButton', { static: true }) bombButton!: HTMLInputElement;

  @ViewChild('btnColourContainer', { static: true }) btnColourContainer!: HTMLElement;
  @ViewChild('colourMenu', { static: true }) colourMenu!: HTMLElement;

  imagesPaths: any = [];
  drawingsList: any = [];
  conversionCanvas: any;
  messageState: string;
  isButtonEnabled: boolean;

  selectableToolButtons: any = [];
  selectedTool: any;
  isPencilMenuDisplayed: boolean;
  isColourMenuDisplayed: boolean;

  constructor(private drawingService: DrawingService) {
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
   }

  ngOnInit(): void {
    this.btnColourContainerInit();
    this.colourMenuInit();

    console.log("Eraser button: ", this.eraserButton);
    //this.eraserButton.style.display = "block";

    this.messageState = "Loading";
    this.isButtonEnabled = false;
    this.loadImages();
  }

  sendButtonHandler(){
    this.sendImage();
  }

  loadButtonHandler(){
    this.loadImages();
  }

  //Toolbar buttons
  selectToolButton(btnSelected: HTMLInputElement){
    let length = this.selectableToolButtons.length;

    for(let i = 0; i < length; i++){
        //this.selectableToolButtons[i].classList.remove("selected");
    }

    //btnSelected.classList.add("selected");
  }

  showPencil(){
    //this.pencilMenuButton.style.display = "none";
    //this.pencilButton.style.display = "block";
  }

  showPencilMenuButton(){
    //this.pencilMenuButton.style.display = "block";
    //this.pencilButton.style.display = "none";
  }

  showEraser(){
    //this.eraserButton.style.display = "block";
    //this.bombButton.style.display = "none";
  }

  showBomb(){
      //this.eraserButton.style.display = "none";
      //this.bombButton.style.display = "block";
  }

  sizeRangeChangeHandler(){
    let value = Number.parseInt(this.sizeRange.value);

    this.drawingCanvas.context.lineWidth = value;
    this.drawingCanvas.brushRadius = value;
  }

  pencilMenuToggle(){
      if(this.isPencilMenuDisplayed){
          //this.pencilMenu.style.display = "none";
      }
      else{
          //this.pencilMenu.style.display = "block";
      }

      this.isPencilMenuDisplayed = !(this.isPencilMenuDisplayed);
  }

  pencilMenuHide(){
      //this.pencilMenu.style.display = "none";

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
      this.showPencilMenuButton();
      this.pencilMenuHide();
      
      //Return the eraser to default
      this.showEraser();
      console.log(this.drawingCanvas.toolSelected);

      //this.selectToolButton(this.pencilMenuButton);
  }

  pencilMenuButtonClickHandler(){
      this.pencilMenuToggle();
  }

  eraserButtonClickHandler(){
      //console.log("Eraser selected");
      this.drawingCanvas.toolSelected = DrawingCanvasComponent.drawingCanvasTools.ERASER;

      this.drawingCanvas.context.lineCap = "round";
      this.drawingCanvas.context.lineJoin = "round";
      this.drawingCanvas.context.lineWidth = this.drawingCanvas.eraserRadius * 2;

      this.selectToolButton(this.bombButton);

      this.showPencil();
      this.showBomb();
  }

  bucketButtonClickHandler(){
      this.drawingCanvas.toolSelected = DrawingCanvasComponent.drawingCanvasTools.BUCKET;

      this.selectToolButton(this.bucketButton);
      this.showEraser();
      this.showPencil();
  }

  bombButtonClickHandler(){
      this.drawingCanvas.clearCanvas();
      this.pencilButtonClickHandler();

      this.showEraser();
      this.showPencil();
      this.selectToolButton(this.pencilButton);
  }

  //Initializes the colour button
  btnColourContainerInit(){
      //Make the button adjust to the width
      console.log(this.btnColourContainer);
      /*this.btnColourContainer.setAttribute("style","height: " + this.btnColourContainer.clientWidth + "px");*/
  }

  //Fill the colour container with colours
  colourMenuInit(){
      /*this.colourMenu.style.display="block";

      let btnWidth = (this.colourMenu.clientWidth / Object.keys(DrawingCanvasComponent.hexColour).length) - 0.1;
      let btnHeight = this.colourMenu.clientHeight;

      this.colourMenu.style.display="none";

      for(let c in DrawingCanvasComponent.hexColour){
          //Create svg to be added
          let buttonSvg = document.createElement("svg");
          buttonSvg.classList.add("svgBtnColour");

          //Give width and height to button
          buttonSvg.style.width = btnWidth + "px";
          buttonSvg.style.height = btnHeight + "px";
          
          //Give colour
          buttonSvg.style.background = c;
          buttonSvg.setAttribute("colour", c);

          //Assign the event for a click
          buttonSvg.addEventListener("click", function(e){
              //Get the colour to use now
              let colour = e.target.colour;

              //Apply the colour
              myCanvasArea.colourSelected = colour;
              ctx.strokeStyle = colour;

              btnColourContainer.style.background = colour;

              //Hide the menu
              colourMenu.hide();
          });

          //Add the button
          this.colourMenu.appendChild(buttonSvg);
      }*/
  }

  colourMenuToggle(){
      if(this.isColourMenuDisplayed){
          this.colourMenu.style.display = "none";
      }
      else{
          this.colourMenu.style.display = "block";
      }

      this.isColourMenuDisplayed = !(this.isColourMenuDisplayed);
  }

  colourMenuShow(){
      this.isColourMenuDisplayed = true;
      this.colourMenu.style.display = "block";
  }

  colourMenuHide(){
      this.isColourMenuDisplayed = false;
      this.colourMenu.style.display = "none";
  }

  btnColourClick(){
      this.showEraser();
      this.colourMenuToggle();
  }

  /*btnColour.addEventListener("click", function(){
      this.btnColourClick();
  });*/

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

  loadImages(){ 
    return new Promise<any>((resolve, reject) => {
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

      this.drawingService.getDrawingsPastId(lastDrawingNo).then((x) => {

        for(let item of x){
          this.drawingsList.push(item);
        }

        let newDrawings = x;

        for(let item of newDrawings){
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
        this.isButtonEnabled = true;
      }).catch((reason) => {
        console.error("Error retrieving drawings:", reason);
        reject("Rejected Drawing Past Id Promise");
        this.messageState = "Connection Error";
      })
      resolve(true);
    })
  }

  sendImage(){

    return new Promise<any>((resolve, reject) => {
      this.isButtonEnabled = false;
      this.messageState = "Sending";

      let imagedata = this.drawingCanvas.getCanvasImage()

      let drawingMessage: DrawingMessage = {
        data: imagedata.data,
        width: imagedata.width,
        height: imagedata.height,
        colorSpace: imagedata.colorSpace
      }

      this.drawingService.sendDrawing(drawingMessage).then((x) => {

        this.loadImages().then((value) => {
          this.messageState = "Idle";
        }).catch((reason) => {
          console.error("Error loading drawings:", reason);
        });
      });

      resolve(true);
    })
  }

}
