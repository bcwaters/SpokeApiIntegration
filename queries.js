
module.exports = function(db){
// add query functions
var module = {};
module.apiAllProducts = function(req, res, next) {
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

//get request for a product by id
module.getProductData = function (req, res, next) {
	var queryValues = req._parsedUrl['query'];
	queryValues = queryValues.split("=");
	validateQuery(queryValues, res, next)
	dbQuery = 'select * from products WHERE $1~ = $2'	
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

//post request for a product by id
module.getProductById = function (id, next) {
  var queryString= 'select * from products WHERE $1~ = $2';
  //validates values on client side
  let values = ['id', id]
  db.query(queryString, values).then(function (data) {
			if(data === undefined || data.length == 0){data=[{'product_name':'not_found', 'product_description':'no item found'}]}
			next(data[0])})
  .catch(e => {
	  next(e)
	  })
}
module.registerUser = function (userValues, req, res, next){

  let queryString= 'INSERT INTO users(login, password) VALUES($1, $2)';
 
  db.query(queryString, userValues)
  .then(res =>{res.userCreated=true; next()})
  .catch(e => {
	  //TODO this is if the user already exists... might want to check in a seperate query
	  if(e.code == 23505){
		  console.log("handle duplicate user")
		  res.userCreated = false;
		  next()
	  }
	  next(e)
	  })  
}

module.saveUserCart = function(userName, cart){
	let queryString = 'UPDATE users SET cart = $1 WHERE login = $2';
	let queryValues = [cart, userName]
	console.log("SAVING USER CART")
	db.any(queryString, queryValues).then().catch(e => {})
	
}
	
module.findUser = function(username, callbackFunction){
	db.any('select * from users WHERE login = \'' + username+ "\'").then(function (data) {
			if(data === undefined || data.length == 0){
				callbackFunction(null, null)}
				else{
					
				callbackFunction(null, data[0]);
				}
		})  .catch(function (err) {
      return callbackFunction(err, null);
    });
}

module.getUserCart = function(req, res, next){
	let queryString = 'select * from users WHERE login = $1';
	let queryValues = [req.session.userName]
	db.query(queryString, queryValues).then( function(data){
		next(JSON.parse(data[0].cart))
	})
	.catch(e => {})
}

module.getFeaturedProducts = function (req, res, next) {
	
	db.any('select * from products')
    .then(function (data) {
      res.data = data;
	  next(data.cart);
    })
    .catch(function (err) {
      return next(err);
    });
}

return module;
}
