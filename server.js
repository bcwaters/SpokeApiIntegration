require('dotenv').config()
const express = require('express')
const app = express()
const path = require("path")
const pg = require("pg")
var dba = require("./queries")
var routes = require('./routes/routes');



var isLocal = process.env.DATABASE_LOCAL == "true"
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: !isLocal,
});

client.connect();
app.use('/', routes);

app.use(express.static(__dirname + '/public'));


var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
  
