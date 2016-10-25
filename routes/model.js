var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var demoSchema = new Schema({
	uid : String,
	title:String,
	content:String,
	createTime : { type: Date, default: Date.now }
});

exports.Demo = mongoose.model('Demo',demoSchema); //此处Demo会自动对应数据库中的demos表，不知道是不是可以修改，反正我是这个认为的