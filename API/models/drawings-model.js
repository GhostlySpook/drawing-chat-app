pool = require("../db.js");

let drawing_list = [];
let drawingId = 0;
let drawing_limit = 10;
let drawing_width_limit = 1024;
let drawing_height_limit = 1024;

const Drawings = {

    async add(drawing){
      try{ 
        drawing.id = drawingId++;

        if(drawing_list.length >= drawing_limit){
          drawing_list.shift();
        }

        drawing_list.push(drawing);
        //console.log("drawings-model.js Drawing list length after adding: ", drawing_list.length)
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
    }
  
}; 

module.exports = Drawings;