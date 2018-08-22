var express = require('express');
var router = express.Router();
var db = require('../queries');
const handlebars = require('handlebars')
registerHelpers();
const fs = require("fs")
var brandingData = require('../helperFunctions/loadDefaultJSON')
var componentData = require('../helperFunctions/loadComponentData')
var products= [{'product_name' : 'default'}]
const url = require('url')
var session = require("express-session"),
    bodyParser = require("body-parser");
	
	
router.use(express.static("public"));
router.use(session({ secret: "cats" }));
router.use(bodyParser.urlencoded({ extended: true }));

router.use("/", db.getFeaturedProducts);								
router.get('/', (req, res) => {
		if(res.products)products = res.products;
		res.send(renderPage('./index.html', brandingData))
		}
	)

//add middleware to send database request	
router.use("/ProductView.html", db.getProductData);
router.get('/ProductView.html', (req, res) => {
	res.send(renderPage('./ProductView.html', brandingData, res.dbResult[0]))
	}
	)
	
router.get('/logout', (req, res) => {
	endSession(req);
	res.redirect("/")
	}
	)
	

router.get('/api/products', db.apiAllProducts)

function renderPage(templateURI, currentJSON, JSON_retrieved )
{
	var template = fs.readFileSync(templateURI, "utf8");
	var data = currentJSON;
	data['products'] = products;
	for(var key in JSON_retrieved)
	{
			data[key] = JSON_retrieved[key]
	}
	
	//#ISSUE this needs to done only on first render
	registerPartials();
	var compileTemplate = handlebars.compile(template);
	var finalPageHTML = compileTemplate(componentData);
	finalPageHTML = compileTemplate(data);
	return finalPageHTML;
}


router.use('/login', db.loginAuth);
router.post('/login', (req,res) => {
console.log()
fs.writeFile("/tmp/log" + new Date().getTime() + ".txt" , JSON.stringify(req.body), function(err) {
    if(err) {
        return console.log(err);
    }

}); 
	if(res.Authenticated)
	{
		brandingData['Login'] = req.body.username;
		handleResponse(res, url.parse(req.body.currentUrl).path, true);
	}else{
		endSession(req);
		handleResponse(res, url.parse(req.body.currentUrl).path, false);
	}
});

function registerPartials()
{
	for(partial in componentData)
	{
		handlebars.registerPartial(partial, componentData[partial])
		//console.log(handlebars.PARTIALS[partial])
	}
	
}

function registerHelpers()
{
	handlebars.registerHelper('if_eq', function(a, b, opts) {

	if (a == b) {

        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

handlebars.registerHelper('if_not', function(a, b, opts) {

	if (a != b) {

        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

	handlebars.registerHelper('productUrl', function(a, opts) {
		return "ProductView.html?product_name="+ a;
	});
}

function handleResponse(res, location, loginSuccess) {
	if(loginSuccess)
	res.redirect(location)
	res.redirect(location+"#modalLoginForm")
}

function endSession(req)
{
	brandingData['Login'] = 'login';
	req.session.destroy();
}

module.exports = router;