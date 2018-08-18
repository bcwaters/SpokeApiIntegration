var express = require('express');
var router = express.Router();
var db = require('../queries');
const handlebars = require('handlebars')
const fs = require("fs")
var brandingData = require('../helperFunctions/loadDefaultJSON')
							
router.get('/', (req, res) => 
		res.send(renderPage('./index.html', brandingData)
		)
	)

//add middleware to send database request	
router.use("/ProductView.html", db.getProductData);
router.get('/ProductView.html', (req, res) => 
	res.send(renderPage('./ProductView.html', brandingData, res.dbResult[0]))
	)
	
router.get('/api/products', db.apiAllProducts)

function renderPage(templateURI, currentJSON, JSON_retrieved )
{
	var template = fs.readFileSync(templateURI, "utf8");
	var data = currentJSON;
	for(var key in JSON_retrieved)
	{
			data[key] = JSON_retrieved[key]
	}
	var compileTemplate = handlebars.compile(template);
	var finalPageHTML = compileTemplate(data);
	return finalPageHTML;
}

module.exports = router;