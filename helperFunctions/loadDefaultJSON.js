const fs = require("fs")

var loadedJSON = [];
fs.readdirSync('./templateData/').forEach(file => {
	loadedJSON.push(JSON.parse((fs.readFileSync('./templateData/' + file))));
});

function joinJSON(objArray)
{
	var result = {}
	
	for(var objKey in objArray){
		var currentArray = objArray[objKey]
		for(var key in currentArray){
		 result[key] = currentArray[key];
		}
	}
	return result;
}

module.exports = joinJSON(loadedJSON);