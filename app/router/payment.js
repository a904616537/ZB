/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description:  支付处理
 */

'use strict';

var express = require('express'),
router      = express.Router(),
moment      = require('moment'),
ip          = require('ip'),
wechat      = require('../../setting/config.js').wechat,
Payment     = require('wechat-pay').Payment;


const payinfo = wechat.pay;

const initConfig = {
	partnerKey : payinfo.partnerKey,
	appId      : payinfo.appId,
	mchId      : payinfo.mchId,
	notifyUrl  : payinfo.notifyUrl,	//微信商户平台API密钥 
	pfx        : payinfo.pfx, 		//微信商户平台证书 
};

const payment = new Payment(initConfig);
const middleware = require('wechat-pay').middleware;

router.route('/sweep')
.post((req, res) => {
	const {total, order} = req.body;
	console.log('req.body', req.body)
	const body = {
		body             : 'MYbarre',
		out_trade_no     : order + '_' + Math.random().toString().substr(2, 10),
		total_fee        : total,
		spbill_create_ip : ip.address(),
		trade_type       : 'NATIVE',
		product_id       : order
	};

	payment.getBrandWCPayRequestParams(body, (err, payargs) => {
		console.log(moment(), '扫码支付调用', payargs);
		res.json(payargs);
	});
})


router.use('/notify', middleware(initConfig).getNotify().done((message, req, res, next) => {
	var openid = message.openid,
	order_id   = message.out_trade_no.split("_", 1),
	attach     = {};
	try{
		attach = JSON.parse(message.attach);
		console.log(moment(), 'notify message', message)
	}catch(e) {}
	console.log(moment(), 'wechat payment notify order id:', order_id)
	socket.emit('wechatPay', {
		status       : true,
		order_id     : order_id,
		out_trade_no : message.out_trade_no,
		type         : 'wechat pay'
	})
	/**
	* 查询订单，在自己系统里把订单标为已处理
	* 如果订单之前已经处理过了直接返回成功
	*/
	res.reply('success');

	/**
	* 有错误返回错误，不然微信会在一段时间里以一定频次请求你
	* res.reply(new Error('...'))
	*/
}));

module.exports = app => {
	app.use('/payment', router);
}