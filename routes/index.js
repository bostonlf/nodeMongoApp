var express = require('express');
var router = express.Router();
var user = require('../database/db').user;
//var cookieParser = require('cookie-parser');
//db.js里设置了用那个数据库（lvfei） ， 这里定义用lvfei里的哪张表
//这时 user是一个 Model ，它是在db.js里定义的
// var cat = require('../database/cat').cat;
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require("fs");
var app = express();
//app.use(cookieParser());
//app.use(session({secret2: '22222'}));
/*
express中app.render和res.render方法有哪些具体的区别？
把app.render当成一个生成视图的工具，而且res.render内部也是调用了app.render。
区别是这样，app.render只负责生成视图，你会发现它是没能力把视图响应给客户端（浏览器）的，只有res.render手里有response对象，可以把视图响应给客户端。
 */

 
 
//test session
router.get('/testsession', function (req, res) {
    if (req.session.sign) {//检查用户是否已经登录
        console.log(req.session);//打印session的值
        res.send('welecome <strong>' + req.session.name + '</strong>, 3333');
    } else {//否则展示index页面
        req.session.sign = true;
        req.session.name = '1111';
        res.send('2222');
    }
}); 
 
router.get('/testAngularsHTTP', function (req, res) {
res.send('2222');
});  
 
 
 
 
//Defined global variable
var allUserGroup = ["CA","R01", "R02", "R03", "R04", "R05"];
//end


/* turn to home page. */
router.get('/homePage', function (req, res) {
				res.render('homePage', {
					sessionUserINFO : req.session
				});	
});

/* turn to login page. */
router.get('/', function (req, res) {
	res.render('index', {
		sessionUserINFO : req.session,
		title : 'MYdemo',
		WellcomeMSG : 'Well come to my app',
		LoginMSG : 'Please login with your name and group',
		registMSG : 'Regist new user',
		UserRPTMSG : 'Mange Users'
	});
});

/* got to login page*/
router.get('/login', function (req, res) {
	res.render('login', {
		allUserGroup : allUserGroup
	});
});

/* create new user*/
router.get('/CreateNewUser', function (req, res) {
	var tmpOBJ={
		NodejsMSG : "This is my nodeJS app",
		sessionUserINFO : req.session,
		allUserGroup : allUserGroup,
		historyLog:JSON.stringify([{Date:'Mondy',User:'Boston',Comments:'Approved'},
{Date:'Tuesday',User:'Lvfei',Comments:'Reject'},
{Date:'Thirday',User:'Owen',Comments:'Cancel'}])
	}
	
	res.render('CreateNewUser', tmpOBJ);
	 console.log(tmpOBJ);
});

//edit user
router.get('/editUser', function (req, res) {
	res.render('editUser', {
		sessionUserINFO : req.session,
		allUserGroup : allUserGroup
	});
});


/* login */
router.post('/ucenter', function (req, res) {
	var query = {
		name : req.body.name,
		Ugroup : req.body.Ugroup
	};
	var longinUser = {
		name : req.body.name,
		Ugroup : req.body.Ugroup
	};
	(function () {
		user.count(query, function (err, total) { //count返回集合中文档的数量，和 find 一样可以接收查询条件。query 表示查询的条件
			if (total == 1) {
				console.log(query.name + ": successfully " + new Date());
				
	user.find({"name":"lvfei4"},function (err, persons) { //怎样做有条件的查询？ 第一个参数就是查询条件，去掉就是查询所有
		//查询到的所有 person
		//res.send(persons);//persons [{"_id":"58100d5dc44c23102407940c","name":"lvfei","Ugroup":"CA","tmpcol":"aabbcc"}]
		//console.log(JSON.stringify(persons));
		//console.log(persons[0].toObject().Ugroup);//下面这段暂时不好用，我的目的是让一个用户登陆之后再申请新用户的时候能看到自己的userinfo
		console.log("@@@@"+query.name+"^^"+persons[0].name);
				req.session.currentUserName = persons[0].name;
				req.session.currentUserGroup = persons[0].toObject().Ugroup;
		console.log("####"+req.session.currentUserName);	
//req.session=persons[0];
//req.session={"currentUserName"}
	});				
				
				
				//req.session.currentUserName = longinUser.name;
				//req.session.currentUserGroup = longinUser.Ugroup;
				res.render('homePage', {
					sessionUserINFO : req.session
				});

			} else {
				console.log(query.name + ": failed " + new Date());
				res.render('noAccessPage', {
					title : JSON.stringify(longinUser)
				});
				//res.redirect('/');
			}
		});
	})(query);
});

/* user management RPT*/
router.get('/UserRPT', function (req, res) {
	var userData = {};
	var names = ['foo', 'bar', 'baz'];
	var articles = [{
			title : 'title name',
			content : 'this is a test content!'
		}, {
			title : 'title name',
			content : 'this is a test content!'
		}
	];
	user.find(function (err, persons) { //怎样做有条件的查询？ 第一个参数就是查询条件，去掉就是查询所有
		//查询到的所有 person
		//res.send(persons);//persons [{"_id":"58100d5dc44c23102407940c","name":"lvfei","Ugroup":"CA","tmpcol":"aabbcc"}]
		//console.log(JSON.stringify(persons));
		//console.log(persons[0].toObject().Ugroup);
		res.render('UserRPT', {
			persons : persons,
			articles : articles,
			tmpSTR : JSON.stringify(persons)
		});
	});
});
//JSON.stringify(persons)

/**将页面值写入DB**/
router.get('/saveUser', function (req, res) {
	// 输出 JSON 格式
				/*
	name: String,
	password: String,
	Ugroup: String,
	Company: String,
	CompanyPhone: String,
	Email: String				
				*/
	response = {
		name : req.query.name,
		Ugroup : req.query.Ugroup,
		Company : req.query.Company,
		CompanyPhone : req.query.CompanyPhone,
		Email : req.query.Email,
	};
	console.log(response);
	// res.end(JSON.stringify(response));

	//save to DB
	var MongoClient = require('mongodb').MongoClient;
	var DB_CONN_STR = 'mongodb://localhost:27017/lvfei';
	var insertData = function (db, targetData, callback) {
		//连接到表
		var collection = db.collection('users');
		//插入数据
		//  var data = [{"name":'boston',"age":21},{"name":'wilson002',"age":22}];
		//var data = response;
		collection.insert(targetData, function (err, result) {
			if (err) {
				console.log('Error:' + err);
				return;
			}
			callback(result);
		});
	}

	MongoClient.connect(DB_CONN_STR, function (err, db) {
		console.log("conect succefully!");
		insertData(db, response, function (result) {
			console.log(result);
			db.close();
		});
	});
	/*end*/

	// res.end(JSON.stringify(response));
	res.render('homePage', {
		//title : JSON.stringify(response)
		title : response,
		sessionUserINFO : req.session
	}); //response will be showed in a ejs page
})

//修改Doc
router.get('/submit_editUser', function (req, res) {
	var allUserGroup = ["CA","R01", "R02", "R03", "R04", "R05"];
	// 输出 JSON 格式
	response = {
		name : req.query.name,
		Ugroup : req.query.Ugroup
	};
	console.log(response);
	// res.end(JSON.stringify(response));

	//save to DB
	var MongoClient = require('mongodb').MongoClient;
	var DB_CONN_STR = 'mongodb://localhost:27017/lvfei';

var updateData = function(db, callback) {  
	//连接到表  
	var collection = db.collection('users');
	//更新数据
var whereStr = {"name":req.session.currentUserName,"Ugroup":req.session.currentUserGroup};
	var updateStr = {$set: response};
	console.log('whereStr:'+ JSON.stringify(whereStr)+"\n"+'updateStr:'+ JSON.stringify(updateStr));
	collection.update(whereStr,updateStr, function(err, result) {
		if(err)
		{
			console.log('Error:'+ err);
			return;
		}	 
		callback(result);
	});
}


	MongoClient.connect(DB_CONN_STR, function (err, db) {
		console.log("conect succefully!");
		updateData(db, function (result) {
			console.log(result);
			db.close();
		});
	});
	/*end*/

	// res.end(JSON.stringify(response));
	res.render('editUser', {
		//title : JSON.stringify(response)
		sessionUserINFO : req.session,
		title : response,
		allUserGroup:allUserGroup
	}); //response will be showed in a ejs page
})



// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({
		extended : false
	})

router.post('/process_post', urlencodedParser, function (req, res) {
		// 输出 JSON 格式
		response = {
			first_name : req.body.first_name,
			last_name : req.body.last_name
		};
		console.log(response);
		res.end(JSON.stringify(response));
	})
	//end
	/**end**/



/* upload file*/
router.post('/file_upload', function (req, res) {
	console.log(req.files[0]); // 上传的文件信息
	//怎样指定保存附件的文件夹 ？
	var des_file = __dirname + "/" + req.files[0].originalname;
	fs.readFile(req.files[0].path, function (err, data) {
		fs.writeFile(des_file, data, function (err) {
			if (err) {
				console.log(err);
			} else {
				response = {
					message : 'File uploaded successfully',
					filename : req.files[0].originalname
				};
			}
			console.log(response);
			res.end(JSON.stringify(response));
		});
	});
})

/* end */




/**数据库操作start**/
/***
Schema  ：  一种以文件形式存储的数据库模型骨架，不具备数据库的操作能力

Model   ：  由Schema发布生成的模型，具有抽象属性和行为的数据库操作对

Entity  ：  由Model创建的实体，他的操作也会影响数据库

Schema、Model、Entity的关系请牢记，Schema生成Model，Model创造Entity，Model和Entity都可对数据库操作造成影响，但Model比Entity更具操作性。
 ***/

//添加User
router.get('/addUser', function (req, res) {
	//var PersonModel = db.model('Person',PersonSchema);
	/*
	//使用Entity来增加一条数据
	var personEntity = new user({name:'Krouky'});
	personEntity.speak();//我的名字叫Krouky
	personEntity.save();
	//end
	 */

	//使用Model来增加一条数据
	var MDragon = {
		name : 'lvfeibbb'
	};
	user.create(MDragon); //这个create方法是哪里来的 ？？跟下面定义个那个export.create没关系
	//end
	res.send("user lvfeibbb was added");
})

//两种新增方法区别在于，如果使用Model新增时，传入的对象只能是纯净的JSON对象，不能是由Model创建的实体，原因是：由Model创建的实体krouky虽然打印是只有{name:'krouky'}，但是krouky属于Entity，包含有Schema属性和Model数据库行为模型。如果是使用Model创建的对象，传入时一定会将隐藏属性也存入数据库，虽然3.x追加了默认严格属性，但也不必要增加操作的报错

//http://blog.csdn.net/tengzhaorong/article/details/16802109  一些查询方法
router.get('/findUser', function (req, res) {
	//var PersonModel = db.model('Person',PersonSchema);
	var personEntity = new user({
			name : 'Krouky'
		}); //这里生成entity  Entity是具有具体的数据库操作CRUD的
	personEntity.speak(); //我的名字叫Krouky
	user.find({
		'name' : 'lvfei4'
	}, function (err, persons) { //怎样做有条件的查询？ 第一个参数就是查询条件，去掉就是查询所有
		//查询到的所有person
		res.send(persons);
	});

})
//删除 user
router.get('/deleteUser', function (req, res) {
	//var PersonModel = db.model('Person',PersonSchema);
	var personEntity = new user({
			name : 'Krouky'
		});
	personEntity.speak(); //我的名字叫Krouky

	var id = "580ec66c9dd8b6242dbf20b9";
	console.log('id = ' + id);
	if (id && '' != id) {
		console.log('----delete id = ' + id);
		user.findByIdAndRemove(id, function (err, docs) {
			console.log('delete-----' + docs);
			res.redirect('/');
		});
	}
})

//update
router.get('/updateOneUser_model', function (req, res) {
	var id = "580ec6629dd8b6242dbf20b8";
	user.findById(id, function (err, person) {
		person.name = 'MDragon_model666';
		person.save(function (err) {});
		res.send("Update model done");
	});
	/* 可以使用$set属性来配置，这样也不用先查询，如果更新的数据比较少，可用性还是很好的
	user.update({_id:id},{$set:{name:'MDragon_set'}},function(err){});
	res.send("Update model_set done");
	 */
})

router.get('/updateOneUser_Entity', function (req, res) {
	var id = "580ec6629dd8b6242dbf20b8";
	user.findById(id, function (err, person) {
		person.name = 'MDragon_Entity';
		var _id = person._id; //需要取出主键_id
		delete person._id; //再将其删除
		user.update({
			_id : _id
		}, person, function (err) {});
		//此时才能用Model操作，否则报错
		res.send("Update Entity done");
	});

})
/**数据库操作end**/



/* 增删改实例 start*/
//mongoose.connect('mongodb://localhost/monkey');

exports.index = function (req, res) {
	//查询所有数据，保存到demos中，在页面循环输出
	user.find(function (err, docs) {
		res.render('index', {
			title : 'Express user Example',
			demos : docs
		});
	});

};

//跳转到添加页面
exports.add = function (req, res) {
	console.log('----here');
	res.render('add.html', {
		title : '添加 demo list'
	});
};

//创建新纪录
exports.create = function (req, res) {
	var demo = new user({
			uid : req.body.uid,
			title : req.body.title,
			content : req.body.content
		});

	console.log('create----');
	demo.save(function (err, doc) {
		console.log(doc);
		res.redirect('/');
	});

};

// 根据id删除相应的记录
exports.delById = function (req, res) {

	var id = req.query.id;
	console.log('id = ' + id);

	if (id && '' != id) {
		console.log('----delete id = ' + id);
		user.findByIdAndRemove(id, function (err, docs) {
			console.log('delete-----' + docs);
			res.redirect('/');
		});
	}

};

// 查询对应修改记录，并跳转到修改页面
exports.toModify = function (req, res) {
	var name = req.query.name;
	console.log('id = ' + name);

	if (name && '' != name) {
		console.log('----delete name = ' + name);
		user.findById(name, function (err, docs) {
			console.log('-------findById()------' + docs);

			res.render('modify.html', {
				title : '修改ToDos',
				demo : docs
			});
		});
	};
};

//修改相应的值
exports.modify = function (req, res) {

	var demo = {
		uid : req.body.uid,
		title : req.body.title,
		content : req.body.content
	};

	var id = req.body.id; //因为是post提交，所以不用query获取id
	if (id && '' != id) {
		console.log('----update id = ' + id + "," + demo);
		user.findByIdAndUpdate(id, demo, function (err, docs) {
			console.log('update-----' + docs);
			res.redirect('/');
		});
	}

};

/* 增删改实例 end*/





/**some test (not useless)**/

//这个用法很好，用来提交给自己
router.get('/:username/:id', function (req, res, next) {
	res.send('Request Type:', req.method+"@"+req.params.username+"@"+req.params.id);
});

router.get('/user2/:id', function (req, res, next) {
	console.log('ID2:', req.params.id);
	next();
}, function (req, res, next) {
	res.send('User Info');
});

//这样写可以指定一个路径的文件  貌似指定的只能是app根目录下 不会改成指定文件夹的
router.get('/runoob_index.htm', function (req, res) {
	res.sendFile(__dirname + "/" + "runoob_index.html"); //这时的 __dirname 是当前文件 index.js所在的目录
})

router.get('/MNGcook', function (req, res) {
		console.log("Cookies: ", req.cookies)
	})

/*匹配正则*/
router.get('/ab*cd', function (req, res) {
		console.log("/ab*cd GET 请求");
		res.send('正则匹配');
	})
/*end*/

// 匹配 butterfly、dragonfly，不匹配 butterflyman、dragonfly man等
router.get(/.*fly$/, function (req, res) {
		res.send('/.*fly$/');
	});





router.get('/runoob_index', function (req, res) {
	res.render('runoob_index', {
		title : 'login'
	});
});


router.get('/runoob_index_post', function (req, res) {
	res.render('runoob_index_post', {
		title : 'login'
	});
});
// 匹配任何路径中含有 m 的路径：
/*
router.get(/m/, function(req, res) {
res.send('/m/');
});
 */
//使用多个回调函数处理路由（记得指定 next 对象）：
router.get('/example/b', function (req, res, next) {
	console.log('response will be sent by the next function ...');
	next();
}, function (req, res) {
	res.send('Hello from B!');
});

//混合使用函数和函数数组处理路由：
var cb0 = function (req, res, next) {
	console.log('CB0');
	next();
}

var cb1 = function (req, res, next) {
	console.log('CB1');
	next();
}

router.get('/example/d', [cb0, cb1], function (req, res, next) {
	console.log('response will be sent by the next function ...');
	next();
}, function (req, res) {
	res.send('Hello from D!');
});
/*end*/

//下面这个示例程序使用 app.route() 定义了链式路由句柄。
router.route('/book')
.get(function (req, res) {
	res.send('Get a random book');
})
.post(function (req, res) {
	res.send('Add a book');
})
.put(function (req, res) {
	res.send('Update the book');
});
/*  mongo中的数据并显示 不会用
exports.userlist = function(db) {
return function(req, res) {
var collection = db.get('usercollection');
collection.find({},{},function(e,docs){
res.render('userlist', {
"userlist" : docs
});
});
};
};
end */
/**some test end**/
module.exports = router;