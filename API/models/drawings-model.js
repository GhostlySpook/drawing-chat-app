pool = require("../db.js");

let message_list = [];
let messageId = 0;
let message_limit = 5;
let drawing_width_limit = 512;
let drawing_height_limit = 512;
let message_length_limit = 128;

const Drawings = {

    async add(message){
      try{ 
        //console.log("Received message:");
        //console.log(message);

        if(message_list.length >= message_limit){
          message_list.shift();
        }

        message.id = messageId++;

        message_list.push(message);

        /*this.validate(drawing);
        
        if(message_list.length >= message_limit){
          message_list.shift();
        }

        drawing.id = messageId++;

        message_list.push(drawing);*/
      }catch (error) {
        return error;
      }
    },

    async getAll(){
      try{
        //console.log("drawings-model.js Drawing list length while getting all: ", message_list.length)
        return message_list;
      } catch (error){
        return error;
      }
    },

    async getPastId(lastMessageId){
      try {
        return message_list.filter(message => message.id > lastMessageId);
      } catch (error) {
        return error; 
      }
    },

    validate(message){
      try {
        //Check drawing data is correct
        if(message == null){
          throw("Drawing is null");
        }

        if(typeof message.width != "number" || typeof message.height != "number" || message.colorSpace != "string" || message.text_message != "string"){
          throw("Type of field isn't correct");
        }

        //Check the drawing received isn't too big
        if(message.width > drawing_width_limit || message.height > drawing_height_limit){
          throw("Drawing size is too big");
        }

        //Check text message isn't too big
        if(message.textMessage > message_length_limit){
          throw("Text message is too long");
        }

      } catch (error) {
        return error;
      }
    }
  
}; 

module.exports = Drawings;