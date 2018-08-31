const fs = require("fs")

var loadedComponents = {};
fs.readdirSync('./components/').forEach(file => {
	loadedComponents[file.split('.')[0]] = fs.readFileSync('./components/' + file, "utf8")
	});

module.exports = loadedComponents;