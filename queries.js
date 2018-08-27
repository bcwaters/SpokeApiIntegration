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

function validateQuery(query, res, next)
{
	if(query.length!=2){
		res.dbResult=[{'product_name':'notasdf_found', 'product_description':'no item found'}];
		next()
	}
}

function validateQueryResponse(data, res, next)
{
	if(data === undefined || data.length == 0){data=[{'product_name':'not_found', 'product_description':'no item found'}]}
			res.dbResult = data;
			next();
}

function getProductData(req, res, next) {
	var queryValues = req._parsedUrl['query'];
	queryValues = queryValues.split("=");
	validateQuery(queryValues, res, next)
	dbQuery = 'select * from product WHERE $1~ = $2'

	
  db.any(dbQuery, queryValues)
    .then(function (data) {
			validateQueryResponse(data, res, next)
			res.dbResult = data;
			next();
		})
    .catch(function (err) {
      return next(err);
    });
}

function registerUser(req, res, next){

	console.log("register user called")
  var queryString= 'INSERT INTO users(login, password) VALUES($1, $2)';
  //validates values on client side
  var values = [req.body.username, req.body.password]
  db.query(queryString, values)
  .then(res =>{res.userCreated=true; next()})
  .catch(e => {
	  if(e.code == 23505){
		  console.log("handle duplicate user")
		  res.userCreated = false;
		  next()
	  }
	  next(e)
	  })
  
  
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
  loginAuth : loginAuth,
  registerUser: registerUser
};