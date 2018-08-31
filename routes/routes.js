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
	
router.use(express.static("public"));
router.use(session({ secret: "cats" }));
router.use(bodyParser.urlencoded({ extended: true }));

router.use("/", db.getFeaturedProducts);								
router.get('/', (req, res) => {
		if(res.products)products = res.products;
		console.log(res.products)
		res.send(renderPage('./index.html', brandingData))
		}
	)

//add middleware to send database request	
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

router.get('/cart',(req, res) =>{
	var testItems = [{'product_name':'shoe', 'product_image':"shoe.png", 'id':1, 'qty':1, 'price':5},{'product_name':'toy','product_image':"toy.png", 'id':2, 'qty':1, 'price':5},{'product_name':'tattoo','product_image':"tattoo.png", 'id':3, 'qty':1, 'price':5}];
	
	var i;
	for(i=0; i<testItems.length; i++){

		cart.addToCart(testItems[i], 1, cart)
	}
		console.log(cart.data)
	res.send(cart.data.items)
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
	console.log(res.userCreated)
	if(res.userCreated == false){
		res.redirect("/#duplicate")
	}
		res.redirect("/#registerResultTrue")
	
});

/*
router.post('/cart', (req, res) => {
  let qty = parseInt(req.body.qty, 10);
  let product = parseInt(req.body.product_id, 10);
  if(qty > 0) {
    Products.findOne({product_id: product}).then(prod => {
        Cart.addToCart(prod, qty);
        Cart.saveCart(req);
        res.redirect('/cart');
    }).catch(err => {
       res.redirect('/');
    });
} else {
    res.redirect('/');
}
});
*/





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

module.exports = router;