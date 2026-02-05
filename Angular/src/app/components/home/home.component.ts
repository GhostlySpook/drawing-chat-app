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
  @ViewChild('modalImage') modalImage!: ElementRef;

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

  @ViewChild('avatarModal', { static: true }) avatarModal!: ElementRef;
  @ViewChild('avatarTable', { static: true }) avatarTable!: ElementRef<HTMLTableElement>;

  textMessageInput: string;
  usernameInput: string;

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

  messageModalVisible: boolean;
  isZoomedModalImage: boolean;

  avatarPixelData: Array<string>;
  avatarSize: number;
  //avatarModalVisible: boolean;
  selectedAvatarColour: string;

  isNewMessageAlertShown: boolean;

  selectAudio: any;

  modalData = {
    message: "",
    path: ""
  }

  constructor(private drawingService: DrawingService) {
    this.textMessageInput = "";

    //Load Username!
    let storagedUsername = localStorage.getItem('username');

    if(storagedUsername == null){
      //console.log("Didn't find username")
      localStorage.setItem('username', 'User :-)')
      this.usernameInput = 'User :-)';
    }
    else{
      this.usernameInput = storagedUsername;
      //console.log("Found username!", this.usernameInput)
    }

    //Load Avatar!
    this.avatarSize = 9;
    let storagedAvatar = localStorage.getItem('avatar');
    if(storagedAvatar == null){
      console.log("Didn't find avatar")
      this.avatarPixelData = [].constructor(this.avatarSize ** 2).fill("#ffffff")
    }
    else{
      this.avatarPixelData = JSON.parse(storagedAvatar);
      //console.log("Found avatar!", this.avatarPixelData)
    }

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

    this.messageModalVisible = false;
    this.isZoomedModalImage = false;

    //this.avatarModalVisible = false;
    this.selectedAvatarColour = "#000000";

    this.isNewMessageAlertShown = false;
    
    this.selectAudio = new Audio('assets/sound/select.mp3')
   }

  ngOnInit(): void {
    this.messageState = "Loading";
    this.isButtonEnabled = false;
    this.loadMessages();

    //Add an interval to load images every now and then
    this.loadImageInterval = setInterval(() => this.loadMessages(), this.milisecondsForLoading);

    //Add shortcuts
    document.addEventListener("keydown", (e) => this.shortcutFunction(e));

    window.addEventListener("pointerdown", (e) => this.pressingWindowFunction(e));
  }

  ngAfterViewChecked(){  
    if(this.wasAtBottom){
      this.scrollChatContainerDown();
      this.wasAtBottom = false;
    }
  }

  sendKeypressHandler(e: any){
    if(e.key == 'Enter'){
      console.log("To send")
      this.sendMessage();
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

    let imagedata = this.drawingCanvas.getCanvasImage()

    this.conversionCanvas.width = imagedata.width;
    this.conversionCanvas.height = imagedata.height;

    let conversionContext = this.conversionCanvas.getContext("2d");
    conversionContext.fillStyle = window.getComputedStyle(this.drawingCanvas.drawingCanvas).backgroundColor;
    conversionContext.fillRect(0, 0, imagedata.width, imagedata.height);
    conversionContext.drawImage(this.drawingCanvas.drawingCanvas, 0, 0, imagedata.width, imagedata.height);

    let canvasUrl = this.conversionCanvas.toDataURL("image/jpeg");
    const createEl = document.createElement('a');
    createEl.href = canvasUrl;

    // This is the name of our downloaded file
    createEl.download = "drawing";

    // Click the download button, causing a download, and then remove it
    createEl.click();
    createEl.remove();
  }

  scrollChatContainerHandler(){
    if(this.chatContainer.nativeElement.scrollTop + this.chatContainer.nativeElement.clientHeight == this.chatContainer.nativeElement.scrollHeight)
      this.isNewMessageAlertShown = false;
  }

  scrollChatContainerDown(){
    //console.log("Was at bottom: ", this.wasAtBottom)
    if(this.wasAtBottom || this.firstLoadNo > 0){
      if(this.firstLoadNo != 0){
        if(this.firstLoadNo == 1){
          this.wasAtBottom = false;
        }

        this.firstLoadNo--
      }
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }, 0);
    }
  }

  scrollChatContainerDownForced(){
    this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
  }

  copyDrawingIntoCanvas(path: any){
    //console.log(path)
    let image = new Image()
    image.src = path;

    console.log("Pressed")

    this.drawingCanvas.context.drawImage(image, 0, 0, 1100, 800)
    this.drawingCanvas.addRedo(this.drawingCanvas.getCanvasImage())
  }

  //Modal Functions--------------------------------
  openMessageModal(message: any){
    this.modalData.path = message.path;
    this.modalData.message = message.text;
    this.messageModalVisible = true;
  }

  closeMessageModal(){
    this.isZoomedModalImage = false;
    this.messageModalVisible = false;
    this.modalData.path = "";
    this.modalData.message = "";
  }

  zoomModalImage(){
    this.isZoomedModalImage = !this.isZoomedModalImage;
    //console.log(this.isZoomedModalImage);
  }

  //END Modal Functions--------------------------------

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

      this.drawingCanvas.changeCursor(DrawingCanvasComponent.cursorPath.PENCIL);

      //Make the pencil menu appear
      this.pencilMenuHide();
      this.selectAudio.play();
  }

  pencilMenuButtonClickHandler(){
      this.pencilMenuToggle();
      this.selectAudio.play();
  }

  eraserButtonClickHandler(){
      this.drawingCanvas.toolSelected = DrawingCanvasComponent.drawingCanvasTools.ERASER;

      this.drawingCanvas.context.lineCap = "round";
      this.drawingCanvas.context.lineJoin = "round";
      this.drawingCanvas.context.lineWidth = this.drawingCanvas.eraserRadius * 2;

      this.drawingCanvas.changeCursor(DrawingCanvasComponent.cursorPath.ERASER);
      this.selectAudio.play();
  }

  bucketButtonClickHandler(){
      this.drawingCanvas.toolSelected = DrawingCanvasComponent.drawingCanvasTools.BUCKET;
      this.drawingCanvas.changeCursor(DrawingCanvasComponent.cursorPath.BUCKET);
      this.selectAudio.play();
  }

  bombButtonClickHandler(){
      this.drawingCanvas.bombClear();
      this.pencilButtonClickHandler();
      this.selectAudio.play();
  }

  showColoursButtonHandler(){
    this.isColourMenuDisplayed = !this.isColourMenuDisplayed;
    this.selectAudio.play();
  }

  colourButtonHandler(colour: string){
    this.drawingCanvas.colourSelected = colour;
    this.drawingCanvas.context.strokeStyle = colour;

    this.isColourMenuDisplayed = false;

    this.selectAudio.play();

    //this.btnColourContainer.nativeElement.style.background = colour;

    //Hide the menu
    //colourMenu.hide();
  }

  selectColour(e: any){
    //console.log(e.target.value);
    let color = e.target.value;

    this.drawingCanvas.colourSelected = color;
    this.drawingCanvas.context.strokeStyle = color;
  }

  undoButtonClickHandler(){

      //If it is the first step, don't do anything
      if(this.drawingCanvas.redoPointer == 0){
          return false;
      }

      //Show previous frame
      this.drawingCanvas.redoPointer--;
      this.drawingCanvas.context.putImageData(this.drawingCanvas.redoFramesList[this.drawingCanvas.redoPointer], 0, 0);
      this.selectAudio.play();

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

      this.selectAudio.play();

      return true;
  }

  userNameInputKeypressHandler(e: any){
    if(e.key == 'Enter'){
      this.saveUsernameInCookie();
    }
  }
  
  saveUsernameInCookie(){
    localStorage.setItem("username", this.usernameInput);
  }

  selectAvatarColour(e: any){
    let color = e.target.value;
    this.selectedAvatarColour = color;
  }

  showAvatarModal(){
    for(let rowNum = 0; rowNum < this.avatarTable.nativeElement.rows.length; rowNum++){
      let row = this.avatarTable.nativeElement.rows[rowNum]

      for(let col = 0; col < row.cells.length; col++){
        let cell = row.cells[col]
        cell.style.backgroundColor = this.avatarPixelData[rowNum*this.avatarSize + col];
      }
    }

    this.avatarModal.nativeElement.style.display = 'flex'
  }

  hideAvatarModal(){
    this.avatarModal.nativeElement.style.display = 'none'
  }

  fillAvatarPixel(e: any){
    //console.log(e.target.style.backgroundColor)

    //Color cell
    e.target.style.backgroundColor = this.selectedAvatarColour;

    //Get the pixel id
    //let pixelId = Number(e.target.getAttribute("pixelId"));
    //console.log(pixelId)

    //Save the color in the pixel array
    //this.avatarPixelData[pixelId] = this.selectedAvatarColour;
    //console.log(this.avatarPixelData)
  }

  fillAvatar(){
    for(let rowNum = 0; rowNum < this.avatarTable.nativeElement.rows.length; rowNum++){
      let row = this.avatarTable.nativeElement.rows[rowNum]
      //console.log(row)

      for(let col = 0; col < row.cells.length; col++){
        let cell = row.cells[col]
        cell.style.backgroundColor = this.selectedAvatarColour;
      }
    }
  }

  saveAvatar(){
    console.log("Table:", this.avatarTable)

    for(let rowNum = 0; rowNum < this.avatarTable.nativeElement.rows.length; rowNum++){
      let row = this.avatarTable.nativeElement.rows[rowNum]
      //console.log(row)

      for(let col = 0; col < row.cells.length; col++){
        let cell = row.cells[col]
        this.avatarPixelData[rowNum*this.avatarSize + col] = cell.style.backgroundColor;
      }
    }

    localStorage.setItem('avatar', JSON.stringify(this.avatarPixelData))
    //this.avatarModalVisible = false;

    //console.log(this.avatarPixelData)
    this.avatarModal.nativeElement.style.display = 'none'
    //console.log(this.avatarModalVisible)
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

        //This flag is used to tell if this is the first load and should scroll to the bottom from the start
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
            this.messageList.push({path: this.conversionCanvas.toDataURL("image/png"), text: item.textMessage, username: item.username, avatar: item.avatar});
          }
          else{
            this.messageList.push({path: null, text: item.textMessage, username: item.username, avatar: item.avatar});
          }
        }

        this.messageState = "Idle";
        this.isButtonEnabled = true;

        if(!this.wasAtBottom && newDrawings.length > 0){
          //console.log("Would show new message")
          this.isNewMessageAlertShown = true;
        }

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

          this.messageList.push({path: this.conversionCanvas.toDataURL("image/png"), text: item.textMessage, username: item.username, avatar: item.avatar});
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
      this.scrollChatContainerDownForced()
      clearInterval(this.loadImageInterval);

      this.isButtonEnabled = false;
      this.messageState = "Sending";

      let drawingMessage: DrawingMessage = {
        avatar: this.avatarPixelData,
        data: null,
        width: null,
        height: null,
        colorSpace: null,
        username: this.usernameInput,
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
      this.scrollChatContainerDownForced()
      this.isButtonEnabled = false;
      this.messageState = "Sending";

      let imagedata = this.drawingCanvas.getCanvasImage()

      let newWidth = imagedata.width;
      let newHeight = imagedata.height;
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

      let conversionContext = this.conversionCanvas.getContext("2d");
      this.conversionCanvas.width = newWidth;
      this.conversionCanvas.height = newHeight;

      //Fill background with the background color of the canvas
      conversionContext.fillStyle = window.getComputedStyle(this.drawingCanvas.drawingCanvas).backgroundColor;
      conversionContext.fillRect(0, 0, newWidth, newHeight);
      conversionContext.drawImage(this.drawingCanvas.drawingCanvas, 0, 0, newWidth, newHeight);
      imagedata = conversionContext.getImageData(0, 0, this.conversionCanvas.width, this.conversionCanvas.height)

      let drawingMessage: DrawingMessage = {
        avatar: this.avatarPixelData,
        data: imagedata.data,
        width: imagedata.width,
        height: imagedata.height,
        colorSpace: imagedata.colorSpace,
        username: this.usernameInput,
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
