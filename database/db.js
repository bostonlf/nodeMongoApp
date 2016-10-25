var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/lvfei');//；连接数据库  db是 lvfei  这个db下还有表 真正使用的 users 表，这是在index.js里设置的
var Schema = mongoose.Schema;   //  创建模型
var userScheMa = new Schema({
	name: String,
	password: String
}); //  定义了一个新的模型，但是此模式还未和users集合有关联
userScheMa.methods.speak = function () {
  var greeting = this.name
    ? "Meow name is " + this.name
    : "I don't have a name";
  console.log(greeting);
}
exports.user = db.model('users', userScheMa); //  与users集合关联   将Schema发布为Model


//如果该Model已经发布，则可以直接通过名字索引到，如下：
//var PersonModel = db.model('Person');
//如果没有发布，上一段代码将会异常