pool = require("../db.js");

let drawing_list = [];

const Drawings = {

    async add(drawing){
      try{ 
        drawing_list.push(drawing);
        console.log("Model: ", drawing_list.length)
      }catch (error) {
        return error;
      }
    },

    async getAll(){
      try{
        console.log("Model. Get All: ", drawing_list.length);
        console.log("Drawing_list:")
        //console.log(drawing_list)
        return drawing_list;
      } catch (error){
        return error
      }
    }
  
}; 

module.exports = Drawings;