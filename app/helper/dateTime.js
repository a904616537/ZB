/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description:  管理员数据服务
 */

'use strict';

const moment = require('moment'),
localTime    = require('moment-timezone');

const timeHelp = {
	//Returns the current time in Shanghai time zone
	timeShanghai() {
		return localTime.tz(moment(), "Asia/Shanghai").format("YYYY-MM-DD HH:mm");
	},
	//Passes in a UNIX time value, converts to local Shanghai Time, and returns the value
	unixToShanghaiTime(unixTime) {
		return localTime.tz(moment.unix(unixTime),"Asia/Shanghai")
		.format("YYYY-MM-DD HH:mm");
	},
	//Pass in a Unix timestamp (from the past), calculate how many minutes has elapsed
	//Return the "minutes" value
	howOldInMinutes(unixTime) {
		var currentTime = moment().unix(),
			age         = moment(moment.unix(currentTime)).diff(moment.unix(unixTime), 'minutes');
		return age;
	},
	hasExpired() {
		var currentDateTime = moment().unix();
		return currentDateTime;
	}
}

 module.exports = timeHelp