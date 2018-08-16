require('dotenv').config()
const express = require('express')
const app = express()
const path = require("path")
const handlebars = require('handlebars')
const fs = require("fs")
const pg = require("pg")

var template = fs.readFileSync('./ProductView.html', "utf8");
var data = JSON.parse(fs.readFileSync("./ProImagingTemplate.json"))
var compileTemplate = handlebars.compile(template);
var finalPageHTML = compileTemplate(data);


var isLocal = process.env.DATABASE_LOCAL == "true"
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: !isLocal,
});

if(isLocal){
client.connect();
client.query('SELECT * FROM product;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});
}

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => 
res.send(finalPageHTML));
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
  
