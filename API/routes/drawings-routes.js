const express = require('express'); //import express

// 1. Create route object
const router  = express.Router(); 
// 2. Import controller
const drawingsController = require('../controllers/drawings-controller.js'); 
// 3. Route to obtain table
router.post('/drawings', drawingsController.newMessage);
router.get('/drawings', drawingsController.getAllMessages);
router.get('/drawings/pastId/:messageId', drawingsController.getMessagesPastId);
// 4. 
module.exports = router; // export to use in server.js