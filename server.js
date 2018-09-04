require('dotenv').config()
const express = require('express')
const app = express()
const path = require("path")
var session = require("express-session")
var uuid = require('uuid');
//TODO config pgPromise connection pool and fix cart action session issues
const pgp = require('./lib/loadDb');
var db = require('./queries')(pgp);

var pgSession = require('connect-pg-simple')(session);
var passport = require('./lib/loadPassport')(db);





var routes = require('./routes/routes')(db,passport)
var config = {
	genid: function(req) { return uuid(); },
	name: 'sid',
	secret: 'cats',
	saveUninitialized: true,
	resave: true,
	store: new pgSession({pgPromise: pgp}),
	cookie:{secure: false}
}

app.use(session(config));
app.use(passport.initialize())
app.use(passport.session())

app.use('/', routes);
app.use(express.static(__dirname + '/public'));


var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
  
