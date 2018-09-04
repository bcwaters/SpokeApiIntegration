var express = require('express');
var router = express.Router();
const handlebars = require('../lib/loadHandlebars');
const fs = require("fs")
var brandingData = require('../lib/loadDefaultJSON')
const url = require('url')
bodyParser = require("body-parser");
var cart = require("../lib/shoppingCart")
module.exports = function(db, passport){
	
	
router.use(express.static("public"));
router.use(bodyParser.urlencoded({ extended: true }));
router.use('/*', updateCart)

router.use("/", db.getFeaturedProducts);								
router.get('/', (req, res) => {
		console.log(req.session)
		res.send(renderPage('./index.html', brandingData, { featuredProducts:res.data}) )
		}
	)

//TODO add middleware to send database request	
router.use("/ProductView.html", db.getProductData);
router.get('/ProductView.html', (req, res) => {
	
	res.send(renderPage('./ProductView.html', brandingData, res.dbResult[0]))
	})
	
router.get('/logout', (req, res) => {
	console.log("calling req.logout")
	brandingData['Login'] = 'login';
	 req.session.destroy(function (err) {
    res.redirect('/'); //Inside a callback… bulletproof!
  });
	res.redirect("/")
	})
	
	
router.get('/register.html', (req,res) =>
{
	res.send(renderPage('./register.html', brandingData, {}));
});	

router.get('/api/products', db.apiAllProducts)

router.use("/addToCart", db.getProductById);
router.post("/addToCart", (req, res) =>{
		
		//TODO get quanity amount from body instead of defaulting to 1
		cart.addToCart(res.dbResult[0], 1, cart, req.session.cart.products)
		cart.saveCart(req)
	res.redirect("/viewCart.html")
})

router.post("/removeProduct", (req, res) =>{
		
		cart.removeFromCart(req.body.id, cart, req.session.cart.products)
		cart.saveCart(req)
	res.redirect("/viewCart.html")
})

router.get("/viewCart.html", (req, res) =>{
	if(req.session.cart == null) req.cart = {};	
	console.log("session cart data: "); console.log(req.session)
	res.send(renderPage('./cart.html', brandingData, req.session.cart))
})


//router.use('/login', db.loginAuth);
router.post('/login', passport.authenticate('login', {
    successRedirect: '/loginSuccess',
    failureRedirect: '/loginFailed',
    failureFlash : true 
  })
);

router.get('/loginSuccess',(req,res) => {
	
		brandingData['Login'] = req.user;
		handleResponse(res, '/', true);

});

//router.use('/registerUser', db.registerUser);
router.post('/registerUser', passport.authenticate('signup',{
    successRedirect: '/#registerResultTrue',
    failureRedirect: '/#duplicate',
    failureFlash : true 
  })
 )

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

function handleResponse(res, location, loginSuccess) {
	if(loginSuccess){
		res.redirect(location)
	}else{
		brandingData['Login'] = 'failed';
		res.redirect(location+"#modalLoginForm")
	}
}

function endSession(req){
	
	req.logout();
}

function updateCart(req, res, next){
	console.log("is logging in?:"+req.isAuthenticated())
	console.log(req.user)
	if(req.session.cart == null){req.session.cart = {}; req.session.cart.products = [] }
	brandingData['cartQty'] = req.session.cart.products.length;
	console.log(req.session.id)
	
	next();
}
	return router;
}


