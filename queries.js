var pgp = require('pg-promise')({});

var isLocal = process.env.DATABASE_LOCAL == "true"
const db = pgp(
   process.env.DATABASE_URL
);

// add query functions
function apiAllProducts(req, res, next) {
  db.any('select * from product')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL products'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getProductData(req, res, next) {
	var query = req._parsedUrl['query'];
	var dbQuery = ''
	if(query)
	{
		query = query.split("=");
		dbQuery = ' WHERE ' + query[0] + ' = \'' + query[1] + "\'"
	}
  db.any('select * from product'+ dbQuery)
    .then(function (data) {
			if(!data[0]){data=[{'product_name':'not_found', 'product_description':'no item found'}]}
			res.dbResult = data;
			next();
		})
    .catch(function (err) {
      return next(err);
    });
}

function getFeaturedItems(req, res, next) {
 
   next();
}



module.exports = {
  apiAllProducts: apiAllProducts,
  getProductData: getProductData,
  getFeaturedItems: getFeaturedItems
};