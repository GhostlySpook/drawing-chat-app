pool = require("../db.js");

let drawing_list = [];
let drawingId = 0;
let drawing_limit = 5;
let drawing_width_limit = 512;
let drawing_height_limit = 512;
let message_length_limit = 128;

const Drawings = {

    async add(drawing){
      try{ 
        this.validate(drawing);
        
        if(drawing_list.length >= drawing_limit){
          drawing_list.shift();
        }

        drawing.id = drawingId++;

        drawing_list.push(drawing);
      }catch (error) {
        return error;
      }
    },

    async getAll(){
      try{
        //console.log("drawings-model.js Drawing list length while getting all: ", drawing_list.length)
        return drawing_list;
      } catch (error){
        return error;
      }
    },

    async getPastId(lastDrawingId){
      try {
        return drawing_list.filter(drawing => drawing.id > lastDrawingId);
      } catch (error) {
        return error; 
      }
    },

    validate(drawing){
      try {
        //Check drawing data is correct
        if(drawing == null){
          throw("Drawing is null");
        }

        if(typeof drawing.width != "number" || typeof drawing.height != "number" || drawing.colorSpace != "string" || drawing.text_message != "string"){
          throw("Type of field isn't correct");
        }

        //Check the drawing received isn't too big
        if(drawing.width > drawing_width_limit || drawing.height > drawing_height_limit){
          throw("Drawing size is too big");
        }

        //Check text message isn't too big
        if(drawing.textMessage > message_length_limit){
          throw("Text message is too long");
        }

      } catch (error) {
        return error;
      }
    }
  
}; 

module.exports = Drawings;