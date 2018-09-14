'use strict';

class Cart {
	  constructor() {
      this.data = {};
      this.data.products = [];
      this.data.totals = 0;
      this.data.formattedTotals = '';
   }
     addToCart(product = null, qty = 1, cart, sessProducts) {
        if(!this.inCart(product.id, cart)) {
            let format = new Intl.NumberFormat('en-US', {style: 'currency', currency: "USD" });
            let prod = {
              id: product.id,
              title: product.product_name,
              price: product.price,
              qty: qty,
              image: product.product_image,
              formattedPrice: format.format(product.price)
            };
            cart.data.products.push(prod);
			this.data = cart.data
            this.calculateTotals(cart);
        }else{//add to qty
			this.updateQty(product.id, qty, cart)
		}
    }
	
	updateQty(id, qty, cart){
		for(let i = 0; i < cart.data.products.length; i++) {
            let item = cart.data.products[i];
            if(item.id === id) {
                cart.data.products[i].qty += qty
                this.calculateTotals(cart);
            }
        }
		
	}
	
     removeFromCart(id = 0, cart, sessProducts) {
		 cart.data.products = sessProducts;
        for(let i = 0; i < cart.data.products.length; i++) {
            let item = cart.data.products[i];
            if(item.id == id) {
                cart.data.products.splice(i, 1);
				this.calculateTotals(cart);
            }
        }
    }

     updateCart(ids = [], qtys = [], cart) {
        let map = [];
        let updated = false;

        ids.forEach(id => {
           qtys.forEach(qty => {
              map.push({
                  id: parseInt(id, 10),
                  qty: parseInt(qty, 10)
              });
           });
        });
        map.forEach(obj => {
            cart.products.forEach(item => {
               if(item.id === obj.id) {
                   if(obj.qty > 0 && obj.qty !== item.qty) {
                       item.qty = obj.qty;
                       updated = true;
                   }
               }
            });
        });
        if(updated) {
            this.calculateTotals(cart);
        }
    }

     inCart(productID = 0, cart) {
        let found = false;
        cart.data.products.forEach(item => {
           if(item.id === productID) {
               found = true;
           }
        });
        return found;
    }

     calculateTotals(cart) {
        cart.totals = 0.00;
        cart.data.products.forEach(item => {
            let price = item.price;
            let qty = item.qty;
            let amount = price * qty;

            cart.totals += amount;
        });
        this.setFormattedTotals(cart);
    }

    emptyCart(request) {
        if(request.session) {
            request.session.cart.products = [];
            request.session.cart.totals = 0.00;
            request.session.cart.formattedTotals = '';
			this.data = request.session.cart;
        }
    }
	
	saveCart(request, next) {
    if(request.session) {
        request.session.cart = this.data;
		request.session.save(next())
    }
}

     setFormattedTotals(cart) {
        let format = new Intl.NumberFormat("en-US", {style: 'currency', currency: "USD" });
        let totals = cart.totals;
        cart.formattedTotals = format.format(totals);
    }

}

module.exports = new Cart();