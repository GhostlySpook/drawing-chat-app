const { type } = require('express/lib/response');
const Drawings = require('../models/drawings-model.js');

// Reaction function for get reaction route
const newDrawing = (req, res, next) => {
    try {
        Drawings.add(req.body.drawing);
        //console.log("Added drawing");
        res.json({message: "Save successful"});
    } catch (error) {
        console.log("Exception: " + error);
    }
};

const getAllDrawings = async (req, res, next) => {
    try{
        drawing_list = await Drawings.getAll();
        //console.log("Giving all", drawing_list.length);
        return res.json(drawing_list);
    }
    catch(error){
        console.log(error);
    }
};

const getDrawingsPastId = async (req, res, next) => {
    try{
        drawing_list = await Drawings.getPastId(req.params.drawingId);
        //console.log("Controller from Id length:", drawing_list.length);
        return res.json(drawing_list);
    }
    catch(error){
        console.log(error);
    }
}

module.exports = { 
    newDrawing,
    getAllDrawings,
    getDrawingsPastId
};