/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: user 路由配置
 */

'use strict';

var express   = require('express'),
service       = require('../service/user.service'),
help          = require('../helper/page.help.js'),
wechat        = require('../../setting/config.js').wechat,
Payment       = require('wechat-pay').Payment,
ip            = require('ip'),
moment        = require('moment'),
jwt           = require('jwt-simple'),
router        = express.Router();


const payinfo = wechat.pay;
const initConfig = {
	partnerKey : payinfo.partnerKey,
	appId      : payinfo.appId,
	mchId      : payinfo.mchId,
	notifyUrl  : payinfo.notifyUrl, //微信商户平台API密钥 
	pfx        : payinfo.pfx, //微信商户平台证书 
};

const payment = new Payment(initConfig);

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
	let { user_id, old_pwd, newpwd } = req.body;
	service.UpdatePwd(user_id, old_pwd, newpwd)
	.then(() => res.send({status : true}))
	.catch(err => res.send({status : false, err}))
})
.post((req, res) => {
	const user = req.body;
	console.log('user', user);
	service.UpdateDetails(user)
	.then(() => res.send({status : true}))
	.catch(err => res.send({status : false, err}))
})
.delete((req, res) => {
	const user = req.query.user;
	console.log('user', user)
	service.Delete(user)
	.then(() => res.send({status : true}))
	.catch(err => res.send({status : false, err}))
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

	service.UpdateLevel(_id, level)
	.then(user => res.send({status : true, user}))
	.catch(err => res.send({status: false}))
})

router.route('/user/audit')
.post((req, res) => {
	const {_id, audit} = req.body;
	service.Audit(_id, audit)
	.then(() => res.send({status : true}))
	.catch(err => res.send({status: false}))
})

router.route('/user/payment')
.post((req, res) => {
	const {_id, is_payment} = req.body;
	service.UpdatePayment(_id, is_payment)
	.then(() => res.send({status : true}))
	.catch(err => res.send({status: false}))
})

router.route('/login')
.post((req, res) => {
	const query = req.body;
	service.SelectUser(query)
	.then(user => {
		// 账户被锁定
		if(user.locking) {
			res.send({status: false, locking : true});
			return;
		}

		user.key         = '';
		user.password    = '';
		const expires = moment().minutes(1).valueOf();
		const model = {
				_id        : user._id,
				first_name : user.first_name,
				last_name  : user.last_name,
				phone      : user.phone,
				email      : user.email,
				wechatid   : user.wechatid,
				address    : user.address,
				city       : user.city,
				level      : user.level,
				is_payment : user.is_payment,
				CreateTime : user.CreateTime
		}
		const token = jwt.encode({
			iss : model,
			exp : expires
		}, 'ZB');
		res.send({status: true, token, expires, user : model})
	})
	.catch(err => res.send({status: false}))
})

// 注册
router.route('/register')
.post((req, res) => {
	req.body.language = req.body.lang;
	const user = req.body;
	service.Register(user)
	.then(result => res.send({status : true}))
	.catch(err =>{ console.error('err', err); res.send({status : false})})
})

router.route('/payment')
.get((req, res) => {
	let str = "" + moment().unix(),
        pad = "000000000",
        order = moment().format("YYYY") + moment().format("MM") + pad.substring(0, pad.length - str.length) + str;

	const body = {
		body             : 'Eatis',
		out_trade_no     : order + '_' + Math.random().toString().substr(2, 10),
		// total_fee        : total,
		total_fee        : 10,
		spbill_create_ip : ip.address(),
		trade_type       : 'NATIVE',
		product_id       : order
	};

	payment.getBrandWCPayRequestParams(body, (err, payargs) => {
		console.log(moment(), '扫码支付调用', payargs);
		res.json(payargs);
	});

})

module.exports = app => {
	app.use('/', router);
}