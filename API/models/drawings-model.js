pool = require("../db.js");

let drawing_list = [];

const Drawings = {

    async add(drawing){
      try{ 
        drawing_list.push(drawing);
        console.log("drawings-model.js Drawing list length after adding: ", drawing_list.length)
      }catch (error) {
        return error;
      }
    },

    async getAll(){
      try{
        console.log("drawings-model.js Drawing list length while getting all: ", drawing_list.length)
        return drawing_list;
      } catch (error){
        return error
      }
    }
  
}; 

module.exports = Drawings;