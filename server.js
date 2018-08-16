const express = require('express')
const app = express()
const path = require("path")
const handlebars = require('handlebars')
const fs = require("fs")

var template = fs.readFileSync('./ProductView.html', "utf8");
var data = JSON.parse(fs.readFileSync("./ProImagingTemplate.json"))
var compileTemplate = handlebars.compile(template);
var finalPageHTML = compileTemplate(data);


app.use(express.static(__dirname + '/public'));
//app.get('/', (req, res) => res.sendFile(path.join( __dirname +'/index.html')));

app.get('/', (req, res) => 
res.send(finalPageHTML));
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });