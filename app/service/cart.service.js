/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

const config = require('../../setting/config'),
mongoose     = require('mongoose'),
cart_mongo   = mongoose.model('cart');

module.exports = {
	getCart(user_id) {
		return new Promise((resolve, reject) => {
			cart_mongo.getUserId(user_id, (err, cart) => {
				if(err) return reject(err);
				if(!cart || cart == 'null' || cart == null) {
					var model  = new cart_mongo({
						user      : user_id,
						cart_item : []
					});
					model.save(err => {
						if(err) return reject(err)
						return resolve(model)
					})
				} else {
					if(!cart.cart_item) cart.cart_item = [];
					cart.cart_item = cart.cart_item.filter(c => {
						if(!c.product) return false;
						return true;
					})
					resolve(cart)
				}
			})
		})
	},
	getCartForMongo(user_id) {
		return new Promise((resolve, reject) => {
			cart_mongo.findOne({user : user_id}, (err, cart) => {
				if(err) reject(err);
				else resolve(cart)
			})
		})
	},
	Init(user_id) {
		return new Promise((resolve, reject) => {
			cart_mongo.getUserId(user_id, (err, cart) => {
				if(cart) return resolve(cart)

				var model  = new cart_mongo({
					user      : user_id,
					cart_item : []
				});
				model.save(err => {
					if(err) return reject(err)
					resolve(cart)
				})
			});	
		})
	},
	Update(cart) {
		return new Promise((resolve, reject) => {
			const _id = cart._id;
			delete cart._id;
			cart_mongo.update({_id}, cart, err => {
				console.log('update cart mongodb', cart);
				if(err){
					console.error('update cart error:', err);
					return reject(err);
				}
				resolve(cart);
			})
		})
	},
	Clear(user_id) {
		const that = this;
		return new Promise((resolve, reject) => {
			
			that.getCart(user_id)
			.then(cart => {

				resolve({cart_item: cart.cart_item, clearNext: () => {
						cart.cart_item = [];
						cart.save(err => {
							if(err) console.log('清空购物车失败:', err)
						})
					}
				});
			})
		})
	}
}
