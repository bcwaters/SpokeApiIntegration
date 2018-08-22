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
			if(data === undefined || data.length == 0){data=[{'product_name':'not_found', 'product_description':'no item found'}]}
			res.dbResult = data;
			next();
		})
    .catch(function (err) {
      return next(err);
    });
}

function loginAuth(req, res, next){
	var userData = req.body;
	db.any('select * from users WHERE login = \'' + req.body.username+ "\'").then(function (data) {
			if(data === undefined || data.length == 0){
				res.Authenticated = false; 
				next()}
				else if(data[0].password == userData.password){
				res.Authenticated = true; 
				next()}
				else{
				res.Authenticated = false; next();
				}
		})  .catch(function (err) {
      return next(err);
    });
	//#issue passwords should be encrypted switch to passport
	//db.any('select * from user WHERE password = '+ dbPassword )
}

function getFeaturedProducts(req, res, next) {
	res.products = [{'product_name':'shoe', 'product_image':"shoe.png"},{'product_name':'toy','product_image':"toy.png"},{'product_name':'tattoo','product_image':"tattoo.png"}]
   next();
}

module.exports = {
  apiAllProducts: apiAllProducts,
  getProductData: getProductData,
  getFeaturedProducts: getFeaturedProducts,
  loginAuth : loginAuth
};