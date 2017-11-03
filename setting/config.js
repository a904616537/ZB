const path 	   = require('path'),
	rootPath   = path.normalize(__dirname + '/..'),
	env        = process.env.NODE_ENV || 'production';

console.log('当前环境', env)

const config = {
	//开发者环境配置
	development: {
		root         : rootPath,
		port         : 9080,
		maxOrderTime : 1080,
		app          : {
			name : 'ZB-dev',
			local: 'http://localhost:9080'
		},
		mailer : {
			email   : 'postmaster@mybarrefitness.com',
			service : 'smtp.mxhichina.com',
			pass    : 'Znbfitness2017',
			port    : 25
		},
		mongo : 'mongodb://127.0.0.1/ZB',
		main  : {
			languagePath : rootPath + '/language/'
		},
		cookie : {
			secret      : 'ZB',
			sessionName : 'session'
		},
		wechat : {
			// Kain 的测试公众号
			pay : {
				partnerKey : "<partnerkey>",
				appId      : "<appid>",
				mchId      : "<mchid>",
				notifyUrl  : "<notifyurl>",
				// pfx        : fs.readFileSync(rootPath + '/setting/apiclient_cert.p12')
			}
		}
	},
	test: {
		root         : rootPath,
		port         : 9080,
		maxOrderTime : 1080,
		app          : {
			name : 'ZB-test',
			local: 'http://localhost:9080'
		},
		mailer : {
			email   : 'postmaster@mybarrefitness.com',
			service : 'smtp.mxhichina.com',
			pass    : 'Znbfitness2017',
			port    : 25
		},
		mongo : 'mongodb://ec2-54-223-41-81.cn-north-1.compute.amazonaws.com.cn:27017/ZB',
		main  : {
			languagePath : rootPath + '/language/'
		},
		cookie : {
			secret      : 'ZB',
			sessionName : 'session'
		}
	},
	// 线上产品配置
	production : {
		root         : rootPath,
		port         : 9080,
		maxOrderTime : 1080,
		app          : {
			name : 'ZB',
			local: 'http://www.mybarrefitness.com'
		},
		mailer : {
			email   : 'postmaster@mybarrefitness.com',
			service : 'smtp.mxhichina.com',
			pass    : 'Znbfitness2017',
			port    : 25
		},
		mongo : 'mongodb://localhost:27017/ZB',
		main  : {
			languagePath : rootPath + '/language/'
		},
		cookie : {
			secret      : 'ZB',
			sessionName : 'session'
		},
		wechat : {
			// Kain 的测试公众号
			pay : {
				partnerKey : "<partnerkey>",
				appId      : "<appid>",
				mchId      : "<mchid>",
				notifyUrl  : "<notifyurl>",
				// pfx        : fs.readFileSync(rootPath + '/setting/apiclient_cert.p12')
			}
		}
	}
}

module.exports = config[env];
