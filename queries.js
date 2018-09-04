
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
module.getProductById = function (req, res, next) {
  var queryString= 'select * from products WHERE $1~ = $2';
  //validates values on client side
  var values = ['id', req.body.id]
  db.query(queryString, values).then(function (data) {
			res.dbResult = data;
			next()})
  .catch(e => {
	  next(e)
	  })
}
module.registerUser = function (req, newUser, next){

  var queryString= 'INSERT INTO users(login, password, sid) VALUES($1, $2, $3)';
  //validates values on client side
  var values = [newUser.username, newUser.password, req.session.id]
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
	
module.loginAuth = function (username, next){
	
	db.any('select * from users WHERE login = \'' + username+ "\'").then(function (data) {
			if(data === undefined || data.length == 0){
				next(null, null)}
				else{
				next(null, data[0]);
				}
		})  .catch(function (err) {
      return next(err, null);
    });
	//#TODO passwords should be encrypted switch to passport
	//db.any('select * from user WHERE password = '+ dbPassword )
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


/*
function getUserSession(req, res, sid, next){
	console.log(sid)
	db.any('select * from session where sid = \'' + sid + '\'').then(function(data){
		if(data === undefined || data.length == 0){
		//TODO no session stored update user table to include current session
		console.log("no sess exist for user")
		next();
		}else{
			console.log("setting session: ")
			console.log(sid);
			
			console.log("new session id:")
			//res.clearCookie(req.session.id)
			res.clearCookie('sid')
			res.cookie('sid', sid)
			
			console.log("end log")
			next();
	}}
	
	).catch(function(err){return next(err)})
	
}
*/

module.getFeaturedProducts = function (req, res, next) {
	
	db.any('select * from products')
    .then(function (data) {
      res.data = data;
	  next();
    })
    .catch(function (err) {
      return next(err);
    });
}

return module;
}
