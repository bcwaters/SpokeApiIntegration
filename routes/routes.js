var express = require('express');
var router = express.Router();
var db = require('../queries');
const handlebars = require('../lib/loadHandlebars');
const fs = require("fs")
var brandingData = require('../lib/loadDefaultJSON')
var products= [{'product_name' : 'default'}]
const url = require('url')
var session = require("express-session"),
    bodyParser = require("body-parser");
var cart = require("../lib/shoppingCart");
	
router.all('*', updateCart)	
router.use(express.static("public"));
router.use(session({ secret: "cats" }));
router.use(bodyParser.urlencoded({ extended: true }));

router.use("/", db.getFeaturedProducts);								
router.get('/', (req, res) => {
		
		res.send(renderPage('./index.html', brandingData, { products:res.data}) )
		}
	)

//TODO add middleware to send database request	
router.use("/ProductView.html", db.getProductData);
router.get('/ProductView.html', (req, res) => {
	
	res.send(renderPage('./ProductView.html', brandingData, res.dbResult[0]))
	})
	
router.get('/logout', (req, res) => {
	endSession(req);
	res.redirect("/")
	})
	
	
router.get('/register.html', (req,res) =>
{
	res.send(renderPage('./register.html', brandingData, {}));
});	

router.get('/api/products', db.apiAllProducts)

//TODO Change this middleware to query for a product id which is to be added to cart
router.use("/cart", db.getFeaturedProducts);
router.get('/cart',(req, res) =>{
	var i;
	for(i=0; i<res.data.length; i++){
		cart.addToCart(res.data[i], 1, cart)
	}
	res.send(renderPage('./cart.html', brandingData, cart.data))
})



router.use("/addToCart", db.getProductById);
router.post("/addToCart", (req, res) =>{
		
		//TODO get quanity amount from body instead of defaulting to 1
		cart.addToCart(res.dbResult[0], 1, cart)
	
	res.redirect("/viewCart.html")
})

router.post("/removeProduct", (req, res) =>{
		//TODO get quanity amount from body instead of defaulting to 1
		cart.removeFromCart(req.body.id, cart)
	
	res.redirect("/viewCart.html")
})

router.get("/viewCart.html", (req, res) =>{
		
	res.send(renderPage('./cart.html', brandingData, cart.data))
})

function renderPage(templateURI, currentJSON, JSON_retrieved ){
	var template = fs.readFileSync(templateURI, "utf8");
	var data = currentJSON;
	data['products'] = products;
	for(var key in JSON_retrieved){
			data[key] = JSON_retrieved[key]
	}
	var compileTemplate = handlebars.compile(template);
	finalPageHTML = compileTemplate(data);
	return finalPageHTML;
}

router.use('/login', db.loginAuth);
router.post('/login', (req,res) => {
	if(res.Authenticated){
		brandingData['Login'] = req.body.username;
		handleResponse(res, url.parse(req.body.currentUrl).path, true);
	}else{
		endSession(req);
		handleResponse(res, url.parse(req.body.currentUrl).path, false);
	}
});

router.use('/registerUser', db.registerUser);
router.post('/registerUser', (req,res) => {
	
	if(res.userCreated == false){
		res.redirect("/#duplicate")
	}
		res.redirect("/#registerResultTrue")
	
});

function handleResponse(res, location, loginSuccess) {
	if(loginSuccess){
		res.redirect(location)
	}else{
		brandingData['Login'] = 'failed';
		res.redirect(location+"#modalLoginForm")
	}
}

function endSession(req){
	brandingData['Login'] = 'login';
	req.session.destroy();
}

function updateCart(res, req, next){
	brandingData['cartQty'] = cart.data.products.length;
	next();
}

module.exports = router;