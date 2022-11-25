const express = require("express");
const cors = require('cors');
const routes = require('./routes/drawings-routes.js'); // import the routes
/*require('dotenv').config();*/

const app = express();

app.use(express.json({limit: '100mb', extended: true}));
app.use(express.urlencoded({limit: '100mb'}));
app.use(cors({
    origin: '*'
}));
app.use('/api/', routes); //to use the routes

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('App is listening on port ' + listener.address().port)
})