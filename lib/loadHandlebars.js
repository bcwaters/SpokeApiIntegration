const handlebars = require('handlebars')
var componentData = require('../lib/loadComponentData')

registerHelpers();
registerPartials();

function registerPartials(){
	for(partial in componentData)
	{
		handlebars.registerPartial(partial, componentData[partial])
		//console.log(handlebars.PARTIALS[partial])
	}
}

function registerHelpers(){
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











module.exports = handlebars;