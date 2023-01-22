const express = require('express'); //import express

// 1. Create route object
const router  = express.Router(); 
// 2. Import controller
const drawingsController = require('../controllers/drawings-controller.js'); 
// 3. Route to obtain table
router.post('/drawings', drawingsController.newDrawing);
router.get('/drawings', drawingsController.getAllDrawings);
router.get('/drawings/pastId/:drawingId', drawingsController.getDrawingsPastId);
// 4. 
module.exports = router; // export to use in server.js