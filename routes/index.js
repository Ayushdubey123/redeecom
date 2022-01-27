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
  cookie: { maxAge:60000},
  resave: false
}));



// const con=mysql.createPool({
  const con = mysql.createConnection({
 socketPath     : '/cloudsql/redeecom:us-central1:myredeemocomdbinstrance',
  // host:'49.36.92.51',
  // host:'localhost',
  user:"root",
  password:"Ksingh@9825",
  // password:"",
  database:"redeecomdb",
  // database:"redeecom",
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
          if (results.length <= 0) {
              req.flash('error', 'Please enter correct email and Password!')
              res.redirect('/')
            }
          else{
            req.session.loggedin = true;
            req.session.name = username;
            res.set({
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma' : 'no-cache',
              'Expires' : '0',
          })
            res.redirect('/adminDashboard');
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
    
   
   res.render('adminDashboard', {Sidebar: data,data1:data1,data2:data2});
   console.log("total User=>"+data2[0].total);
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


// router.get('/countuser',function(req,res,next){
//   if (req.session.loggedin) {
//     var sql='SELECT * FROM attribute where att_position=0';
//     con.query(sql, function (err, data, fields) {
//      if (err) throw err;
//      var sql1='SELECT * FROM user ';
//      con.query(sql1, function (err1, data1, fields1) {
//       if (err1) throw err1;
//       var sql2='SELECT count(*) as total FROM user ';
//      con.query(sql2, function (err2, data2, fields2) {
//       if (err2) throw err2;

//      console.log("total User"+data2[0].total);
//   });
// });
// });
//   } else {
//     req.flash('success', 'Please login first!');
//     res.redirect('/');
//   }
// });





module.exports = router;
