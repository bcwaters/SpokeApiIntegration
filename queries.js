var pgp = require('pg-promise')({});

var isLocal = process.env.DATABASE_LOCAL == "true"
const db = pgp(
   process.env.DATABASE_URL
);

// add query functions
function getAllProducts(req, res, next) {
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

function getProduct(req, res, next) {
  db.any('select * from product')
    .then(function (data) {
		
			res.dbResult = data;
			next();
		})
    .catch(function (err) {
      return next(err);
    });
}


module.exports = {
  getAllProducts: getAllProducts,
  getProduct: getProduct
};