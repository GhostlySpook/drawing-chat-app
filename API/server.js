const express = require("express");
const routes = require('./routes/drawings-routes.js'); // import the routes
/*require('dotenv').config();*/

const app = express();

app.use(express.json());
app.use('/', routes); //to use the routes

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('App is listening on port ' + listener.address().port)
})