var express = require('express');
var router = express.Router();
const handlebars = require('../lib/loadHandlebars');
const fs = require("fs")
var brandingData = require('../lib/loadDefaultJSON')
const url = require('url')
bodyParser = require("body-parser");
var cart = require("../lib/shoppingCart")
var bcrypt = require('bcrypt')
module.exports = function(db){
	
	
router.use(express.static("public"));
router.use(bodyParser.urlencoded({ extended: true }));
router.use('/*', applySessionVariables)

router.use("/", db.getFeaturedProducts);								
router.get('/', (req, res) => {
		res.send(renderPage('./index.html', brandingData, { featuredProducts:res.data}) )
		}
	)

//TODO add middleware to send database request	
router.use("/ProductView.html", db.getProductData);
router.get('/ProductView.html', (req, res) => {
	
	res.send(renderPage('./ProductView.html', brandingData, res.dbResult[0]))
	})
	
router.get('/logout', (req, res) => {
		db.saveUserCart('user', req.session.cart)
	endSession(req, res);
	})
	
	
router.get('/register.html', (req,res) =>
{
	res.send(renderPage('./register.html', brandingData, {}));
});	

router.get('/api/products', db.apiAllProducts)

router.use("/addToCart", addToCart);
router.post("/addToCart", (req, res) =>{
		console.log("ITEM ADDED TO CART ABOUT TO REDIRECT")
		console.log(req.session)
		req.session.save(res.redirect("/viewCart.html"))
})

router.post("/removeProduct", (req, res) =>{
		
		cart.removeFromCart(req.body.id, cart, req.session.cart.products)
		cart.saveCart(req, function(){res.redirect("/viewCart.html")})
	
})

router.get("/viewCart.html", (req, res) =>{
	if(req.session.cart == null) req.session.cart = {};	
	res.send(renderPage('./cart.html', brandingData, req.session.cart))
})


router.use('/login', authenticateUser);
router.post('/login', (req,res) => {
	if(res.Authenticated){
		brandingData['Login'] = req.body.username;
		loginRedirect(res, url.parse(req.body.currentUrl).path, true);
	}else{
		loginRedirect(res, url.parse(req.body.currentUrl).path, false);
	}
});

router.use('/registerUser', registerUser);
router.post('/registerUser', (req,res) => {
	
	if(res.userCreated == false){
		res.redirect("/#duplicate")
	}
		res.redirect("/#registerResultTrue")
	
});

function registerUser(req, res, next){
	var values = [];
	
	bcrypt.hash(req.body.password, 10, function(err, hash) {
		values.push( req.body.username)
		values.push(hash);
		db.registerUser(values, req, res, next);
	})
}

function renderPage(templateURI, currentJSON, JSON_retrieved ){
	var template = fs.readFileSync(templateURI, "utf8");
	var data = currentJSON;
	for(var key in JSON_retrieved){
			data[key] = JSON_retrieved[key]
	}
	
	var compileTemplate = handlebars.compile(template);
	finalPageHTML = compileTemplate(data);
	return finalPageHTML;
}

function loginRedirect(res, location, loginSuccess) {
	if(loginSuccess){
		res.redirect(location)
	}else{
		brandingData['Login'] = 'failed';
		res.redirect(location+"#modalLoginForm")
	}
}

function endSession(req, res){
	brandingData['Login'] = 'login';
	req.session.regenerate(function(err){res.redirect('/')});
}

function authenticateUser(req, res, next){
	db.findUser(req.body.username, function(err,data){
		//Authentication logic will go here
		if(data){
			//response has sent back data
			//TODO compare password login
			bcrypt.compare(req.body.password, data.password, function(err, isMatch) {
				if(isMatch){
					req.session.username = data.login
					req.session.isAuth = true;
					console.log("parsing string")
					console.log(data.cart)
					req.session.cart = JSON.parse(data.cart)
					res.Authenticated = true; 
					next()
				}else{
					//no password match
					res.Authenticated = false;
				}
			});
		}else{
			//no user found		
			res.Authenticated = false;
			next();
		}
	})
}

function addToCart(req, res, next){
	db.getProductById(req.body.id, function(data){
		//add db response to cart object
		if(data){
		//TODO get quanity amount from body instead of defaulting to 1
			cart.addToCart(data, 1, cart, req.session.cart.products)
			cart.saveCart(req, next)
		}else{
			console.log("NO ITEM FOUND")
			next();
		}
	})
}


function applySessionVariables(req, res, next){

	if(req.session.cart == null){req.session.cart = {}; req.session.cart.products = [] }
	brandingData['cartQty'] = req.session.cart.products.length;
	console.log(req.session.id)
	console.log(req.session.cart)
	
	
	next();
}
	return router;
}


