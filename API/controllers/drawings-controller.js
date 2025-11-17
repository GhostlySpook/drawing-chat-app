const { type } = require('express/lib/response');
const Drawings = require('../models/drawings-model.js');

// Reaction function for get reaction route
const newMessage = (req, res, next) => {
    try {
        Drawings.add(req.body.message);
        console.log("Added drawing");
        res.json({message: "Save successful"});
    } catch (error) {
        console.log("Exception: " + error);
    }
};

const getAllMessages = async (req, res, next) => {
    try{
        message_list = await Drawings.getAll();
        console.log("Giving all", message_list.length);
        return res.json(message_list);
    }
    catch(error){
        console.log(error);
    }
};

const getMessagesPastId = async (req, res, next) => {
    try{
        message_list = await Drawings.getPastId(req.params.messageId);
        console.log("Controller from Id length:", message_list.length);
        return res.json(message_list);
    }
    catch(error){
        console.log(error);
    }
}

module.exports = { 
    newMessage,
    getAllMessages,
    getMessagesPastId
};