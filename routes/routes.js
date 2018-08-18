var express = require('express');
var router = express.Router();
var db = require('../queries');
const handlebars = require('handlebars')
const fs = require("fs")

router.get('/', (req, res) => 
		res.send(renderPage('./index.html', './ProImagingTemplate.json')
		)
	)

//add middleware to send database request	
router.use("/ProductView.html", db.getProduct);
router.get('/ProductView.html', (req, res) => 
	res.send(renderPage('./ProductView.html', './ProImagingTemplate.json', res.dbResult[0]))
	)
	
router.get('/api/products', db.getAllProducts)

function joinJSON(obj1, obj2)
{
	var result = {}
	for(var key in obj1) result[key] = obj1[key];
	for(var key in obj2) result[key] = obj2[key];
	
	return result;
}

function renderPage(templateURI, JSON_uri, JSON_retrieved )
{
	var template = fs.readFileSync(templateURI, "utf8");
	var data = JSON.parse(fs.readFileSync(JSON_uri))
	var compileTemplate = handlebars.compile(template);
	var finalPageHTML = compileTemplate(joinJSON(data, JSON_retrieved));
	
	return finalPageHTML;
}

module.exports = router;