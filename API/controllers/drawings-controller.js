const { type } = require('express/lib/response');
const Drawings = require('../models/drawings-model.js');

// Reaction function for get reaction route
const newDrawing = (req, res, next) => {
    try {
        Drawings.add(req.params.drawing)
        res.json({message: "Save successful"})
    } catch (error) {
        console.log("Exception: " + error);
    }
};

const getAllDrawings = async (req, res, next) => {
    try{
        return res.json(Drawings.getAll());
    }
    catch(error){
        console.log(error);
    }
};

module.exports = { 
    newDrawing,
    getAllDrawings
};