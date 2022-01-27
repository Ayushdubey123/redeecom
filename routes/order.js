const express = require('express');
const path = require('path');
const mysql = require('mysql');
const flash = require('connect-flash');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const { futimesSync } = require('fs');
const { count } = require('console');
const bcrypt = require('bcrypt');
const { CLIENT_RENEG_LIMIT } = require('tls');
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
var upload = multer({ storage: storage })

router.use(flash());
router.use(cookieParser());
router.use('/uploads', express.static('uploads'));
// const mysqlconnection=require("../connection");
// router.use('/', admin);
router.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized: true,
  cookie: { maxAge: 60000 },
  resave: false
}));


const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "redeecom",
  multipleStatements: true

});

con.connect((err) => {
  if (err) throw err;
  console.log("");
});


router.get('/order', function (req, res, next) {
  var sql = 'SELECT * FROM attribute where att_position=0';
  con.query(sql, function (err, data, fields) {
    if (err) throw err;
    var sql2 = 'SELECT * FROM medicine where id' + req.body.id;
    con.query(sql2, function (err2, data2, fields2) {
      if (err2) throw err2;
      var sql3 = 'SELECT * FROM user where id' + req.body.id;
      con.query(sql3, function (err3, data3, fields3) {
        if (err3) throw err3;

        var sql4 = 'SELECT * FROM order ';
        con.query(sql4, function (err4, data4, fields4) {
          if (err4) throw err4;

          res.render('order', { Sidebar: data });
        });
      });
    });
  });

});




router.get('/PopupPage', function (req, res, next) {
  res.render('PopupPage');
});



router.get('/CompleteOrder', function (req, res, next) {
  if (req.session.loggedin) {
    var sql = 'SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
      if (err) throw err;
      res.render('CompleteOrder', { Sidebar: data });
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
      res.render('CancelledOrder', { Sidebar: data });
    });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
});