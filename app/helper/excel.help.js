const fs    = require('fs'),
excelPort   = require('excel-export');

const excel_helps = {
	toExcel : (filename, cols, data) => {
		return new Promise((resolve, reject) => {
			let conf   = {};  //只支持字母和数字命名
			conf.cols  = cols;
			conf.rows  = data;
			conf.name = "sheet";
			let result = excelPort.execute(conf),
			uploadDir  = 'public/upload/',
			filePath   = uploadDir + filename + ".xlsx";

			fs.writeFile(filePath, result, 'binary', (err) => {
				if(err) reject(err)
				else {
					console.log('filePath', filePath);
					resolve(filePath)
				}
			});
		});
	}
};

module.exports = excel_helps;
