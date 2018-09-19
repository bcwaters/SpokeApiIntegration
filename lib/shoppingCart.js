'use strict';

class Cart {
	  constructor() {
      this.data = {};
      this.data.products = [];
      this.data.cartTotal = 0;
	  this.data.itemCount = 0;
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
			this.data.itemCount+= qty;
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
				this.data.itemCount -= item.qty
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
        cart.cartTotal = 0.00;
		cart.qty = 0;
        cart.data.products.forEach(item => {
            let price = item.price;
			price = Number(price.replace(/[^0-9.-]+/g,""));
            let qty = item.qty;
			cart.qty += qty;
            let amount = price * qty;
			
			console.log("calc total: " + qty + " x " + price)
			console.log("item ammount:" + amount)
            cart.cartTotal += amount;
        });
	
		this.data.itemCount = cart.qty;
		this.data.cartTotal = cart.cartTotal.toFixed(2);
      
    }

    emptyCart(request) {
        if(request.session) {
            request.session.cart.products = [];
            request.session.cart.cartTotal = 0.00;
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

   

}

module.exports = new Cart();