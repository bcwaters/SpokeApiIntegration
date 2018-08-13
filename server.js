const express = require('express')
const app = express()
const path = require("path")

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => res.sendFile(path.join( __dirname +'/index.html')));
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });