var session = require("express-session")
var FileStore = require('session-file-store')(session);

var config = {
	name: 'server-session-cookie-id',
	secret: 'cats',
	saveUninitialized: true,
	resave: true,
	store: new FileStore()
}


module.exports = session(config)