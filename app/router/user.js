/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: user 路由配置
 */

'use strict';

var express   = require('express'),
service       = require('../service/user.service'),
help          = require('../helper/page.help.js'),
moment        = require('moment'),
jwt           = require('jwt-simple'),
router        = express.Router();


router.route('/user')
.get((req, res) => {
	let { page, per_page, sort, query } = req.query;
	page     = parseInt(page);
	per_page = parseInt(per_page);
	service.getUser(page, per_page, sort, (users, count) => {
		let { total, last_page, next_page_url, prev_page_url} = help.calculate(page, per_page, count, '/user?query=' + query);
		res.send({data: users, current_page: page, total, per_page, last_page, next_page_url, prev_page_url })
	})
})
.put((req, res) => {
	res.send('put user');
})

router.route('/user/level/:_id')
.get((req, res) => {
	const {_id} = req.params;
	service.SelectById(_id)
	.then(user => {
		if(user) {
			res.send({status: true, level : user.level})
		} else res.send({status: false, level : 0})
	})
	.catch(err => res.send({status: false, level : 0}))
})
.put((req, res) => {
	const {_id, level} = req.body;
	service.SelectById(_id)
	.then(user => {
		if(user) {
			user.level = level;
			service.Update(user)
			.then(user => res.send({status : true, user}))
			.catch(err => res.send({status: false}))
		} else res.send({status: false})
	})
	.catch(err => res.send({status: false}))
})

router.route('/user/audit')
.post((req, res) => {
	const {_id, audit} = req.body;
	service.Audit(_id, audit)
	.then(() => res.send({status : true}))
	.catch(err => res.send({status: false}))
})


router.route('/login')
.post((req, res) => {
	const query = req.body;
	service.SelectUser(query)
	.then(user => {

		user.key         = '';
		user.password    = '';
		const expires = moment().minutes(1).valueOf();
		const token = jwt.encode({
			iss : user,
			exp : expires
		}, 'ZB');
		res.send({status: true, token, expires, user})
	})
	.catch(err => res.send({status: false}))
})

// 注册
router.route('/register')
.post((req, res) => {
	console.log('req.body', req.body)
	const user = req.body;
	service.Register(user)
	.then(result => res.send({status : true}))
	.catch(err =>{ console.error('err', err); res.send({status : false})})
})

module.exports = app => {
	app.use('/', router);
}