const express = require('express');
const path = require('path');
const mysql = require('mysql');
const flash = require('connect-flash');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const multer  = require('multer');
const { futimesSync } = require('fs');
const { count } = require('console');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// const app = require('../app');

const router = express.Router();
//const admincontroller=require("../Controller/admin");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

const cors = require("cors");

router.options("*", cors({ origin: 'http://localhost:3000', optionsSuccessStatus: 200 }));

router.use(cors({ origin: "http://localhost:3000", optionsSuccessStatus: 200 }));

var upload = multer({ storage: storage })

router.use(flash());
router.use(cookieParser());
router.use('/uploads', express.static('uploads'));
  // const mysqlconnection=require("../connection");
// router.use('/', admin);
router.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized:true,
  
  resave: true
}));

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(express.static(path.join(__dirname, 'public')));

// const con=mysql.createConnection({
//   host: "localhost",
//   user:"root",
//   password:"",
//   database:"redeecom",
//   multipleStatements:true
// });


const con = mysql.createConnection({
 socketPath     : '/cloudsql/redeecom:us-central1:myredeemocomdbinstrance',
//   // host:'49.36.92.51',
   user:"root",
   password:"Ksingh@9825",
  database:"redeecomdb",
});


// router.get('/',admincontroller);




router.get('/', function(req, res, next) {
  if (req.session.loggedin) {
  
    res.redirect('/adminDashboard');

  }

  res.render('Login',{message : req.flash('error')});

});
router.post('/', function(req, res) {
  const username=req.body.username;
  const password=req.body.password;
  try {
    con.query("select * from admin where username = ? and password = ?",[username,password],function(err,results,fields){
      if(err) throw err;
          if (results.length > 0) {
            req.session.loggedin = true;
            req.session.name = username;
            res.redirect('/adminDashboard');
            }
          else{
          
            req.flash('error', 'Please enter correct email and Password!')
            res.redirect('/')
          //   res.set({
          //     'Cache-Control': 'no-cache, no-store, must-revalidate',
          //     'Pragma' : 'no-cache',
          //     'Expires' : '0',
          // })
            
          }
        });
  } catch (error) {
    console.log(error.toString());
  }
  
});



router.get('/adminDashboard', function(req, res, next) {
  if (req.session.loggedin) {
        
 
  var sql='SELECT * FROM attribute where att_position=0';
  con.query(sql, function (err, data, fields) {
   if (err) throw err;
   var sql1='SELECT * FROM user ';
   con.query(sql1, function (err1, data1, fields1) {
    if (err1) throw err1;
    var sql2='SELECT count(*) as total FROM user ';
   con.query(sql2, function (err2, data2, fields2) {
    if (err2) throw err2;
   
    var sql3='SELECT count(*) as total FROM category_master ';
    con.query(sql3, function (err3, data3, fields3) {
     if (err3) throw err3;
     var sql4='SELECT count(*) as total FROM medicine ';
     con.query(sql4, function (err4, data4, fields4) {
      if (err4) throw err4;
      var sql5='SELECT count(*) as total FROM registration ';
     con.query(sql5, function (err5, data5, fields5) {
      if (err5) throw err5;
      var sql6='SELECT count(*) as total FROM banner_master ';
     con.query(sql6, function (err6, data6, fields6) {
      if (err6) throw err6;
      var sql7='SELECT count(*) as total FROM attribute ';
      con.query(sql7, function (err7, data7, fields7) {
       if (err7) throw err7;
       var sql8='SELECT count(*) as total FROM delivery_master ';
       con.query(sql8, function (err8, data8, fields8) {
        if (err8) throw err8;
        var sql9='SELECT count(*) as total FROM order_master ';
        con.query(sql9, function (err9, data9, fields9) {
         if (err9) throw err9;
   res.render('adminDashboard', {Sidebar: data,data1:data1,data2:data2,totalcat:data3,product:data4,vendor:data5,banner:data6,attribute:data7,delivery:data8,order:data9});
  
 });
});
});
});
});
});
});
});
});
});
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
}); 








router.get('/User_Customer', function(req, res, next) {
  if (req.session.loggedin) {
  var sql='SELECT * FROM attribute where att_position=0';
  con.query(sql, function (err, data, fields) {
   if (err) throw err;
   res.render('User_Customer', {Sidebar: data});
});
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
});
// router.get('/AddressList', function(req, res, next) {
//   res.render('AddressList');
// });

router.get('/PendingOrder', function(req, res, next) {
  if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     res.render('PendingOrder', {Sidebar: data});
  });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
});
router.get('/PopupPage', function(req, res, next) {
  res.render('PopupPage');
});

router.get('/CompleteOrder', function(req, res, next) {
  if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     res.render('CompleteOrder', {Sidebar: data});
  });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
});
router.get('/CancelledOrder', function(req, res, next) {
  if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     res.render('CancelledOrder', {Sidebar:data});
  });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
});




module.exports = router;
