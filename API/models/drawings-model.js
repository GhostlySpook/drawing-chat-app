pool = require("../db.js");

let drawing_list = [];

const Drawings = {

    async add(drawing){
      try{ 
        drawing_list.push(drawing);
      }catch (error) {
        return error;
      }
    },

    async getAll(){
      try{
        return drawing_list;
      } catch (error){
        return error
      }
    }
  
}; 

module.exports = Drawings;