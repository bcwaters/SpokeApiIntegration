var express = require('express');
var router = express.Router();
var db = require('../queries');
const handlebars = require('handlebars')
const fs = require("fs")

router.get('/', (req, res) => 
		res.send(renderPage('./index.html', './ProImagingTemplate.json')
		)
	)

router.get('/api/products', db.getAllProducts)

function joinJSON(obj1, obj2)
{
	var result = {}
	for(var key in obj1) result[key] = obj1[key];
	for(var key in obj2) result[key] = obj2[key];
	
	return result;
}

function renderPage(templateURI, JSON_uri )
{
	var template = fs.readFileSync(templateURI, "utf8");
	var data = JSON.parse(fs.readFileSync(JSON_uri))
	var compileTemplate = handlebars.compile(template);
	var finalPageHTML = compileTemplate(data);
	
	return finalPageHTML;
}



module.exports = router;