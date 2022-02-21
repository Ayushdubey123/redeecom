const express = require('express');
const path = require('path');
const mysql = require('mysql');
const flash = require('connect-flash');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const { count } = require('console');
const bcrypt = require('bcrypt');
const { CLIENT_RENEG_LIMIT } = require('tls');
const saltRounds = 10;
const uploadImage = require('../helpers/helpers')

// const app = require('../app');

const router = express.Router();
//const admincontroller=require("../Controller/admin");
var storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  
  }

})
 
var upload = multer({ storage: storage })

router.use(flash());
router.use(express.json());
router.use(cookieParser());
router.use('/uploads', express.static('uploads'));
// const mysqlconnection=require("../connection");
// router.use('/', admin);
router.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized: true,

  resave: true
}));

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(express.static(path.join(__dirname, 'public')));



const con = mysql.createConnection({
  socketPath     : '/cloudsql/redeecom:us-central1:myredeemocomdbinstrance',
   user:"root",
   password:"Ksingh@9825",
   database:"redeecomdb", 
 });

// 

// con.connect((err) => {
//   if (err) throw err;
//   console.log("");
// });

router.get('/orderList', function(req, res, next) {
  if (req.session.loggedin) {

  //  var sql1='SELECT * FROM order_master';
   var sql1='SELECT * FROM registration inner join order_master on registration.id=order_master.vendor_id ';
   con.query(sql1, function (err1, data1, fields1) {
    if (err1) throw err1;
  
   res.render('PendingOrder',{ListData: data1,message : req.flash('message')});

 
});
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}

});


router.get('/vendordashboard', function(req, res, next) {
  if (req.session.loggedin) {

   var sql1='SELECT * FROM order_master where vendor_id='+req.query.id;
   con.query(sql1, function (err1, data1, fields1) {
    if (err1) throw err1;
    var vendor=req.query.id;
   res.render('vendordashboard',{ListData: data1,message : req.flash('message'),vendor:vendor});

});
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}

});

router.get('/userdashboard', function(req, res, next) {
  if (req.session.loggedin) {

   var sql1='SELECT * FROM order_master where userid='+req.query.id;
   con.query(sql1, function (err1, data1, fields1) {
    if (err1) throw err1;
    var vendor=req.query.id;
    console.log("data="+JSON.stringify(data1));
   res.render('userdashboard',{ListData: data1,message : req.flash('message'),vendor:vendor});

 
});
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}

});

router.get('/order', function (req, res, next) {
  if (req.session.loggedin) {
        var sql4 = 'SELECT *,registration.name as v_name FROM order_master inner join user on user.id=order_master.userid inner join registration on registration.id=order_master.vendor_id where order_master.order_id='+req.query.id;
        con.query(sql4, function (err4, data4, fields4) {
          if (err4) throw err4;
          res.render('PopupPage', {ListData:data4});

});
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
});




router.get('/PopupPage', function (req, res, next) {
  if (req.session.loggedin) {
  res.render('PopupPage');
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
});



router.post('/CompleteOrder', function (req, res, next) {
  if (req.session.loggedin) {
    var sql4 = 'SELECT *,registration.name as v_name FROM order_master inner join user on user.id=order_master.userid inner join registration on registration.id=order_master.vendor_id where order_master.order_id='+req.query.id;
    con.query(sql4, function (err4, data4, fields4) {
      if (err4) throw err4;
      res.render('CompleteOrder', {Data:data4});

});
} else {
req.flash('success', 'Please login first!');
res.redirect('/');
}
});

router.get('/CancelledOrder', function (req, res, next) {
  if (req.session.loggedin) {
    var sql = 'SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
      if (err) throw err;
      var sql1 = 'SELECT * FROM order_master';
      con.query(sql1, function (err1, data1, fields1) {
        if (err1) throw err1;
      res.render('CancelledOrder', { Sidebar: data, ListData:data1});
    });
  });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
});


// function makeid(length) {
//   var result           = '';
//   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   var charactersLength = characters.length;
//   for ( var i = 0; i < length; i++ ) {
//     result += characters.charAt(Math.floor(Math.random() * 
// charactersLength));
//  }
//  return result;
// }

// console.log(makeid(5));

module.exports = router;