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



var isLocal = process.env.DATABASE_LOCAL == "true"
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: !isLocal,
});

client.connect();
var testString;



var finalPageHTML = compileTemplate(data);


app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => 
res.send(finalPageHTML))


app.get('/test', (req, res, next) => {
	client.query('SELECT * FROM product;', (err, result) => {
    if (err) {
      return next(err)
    }
    res.send(result.rows[0])
	})
});



var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
  
