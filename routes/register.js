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
router.use(flash());
router.use(cookieParser());

router.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge:60000},
    resave: false
  }));
  
  
  const con=mysql.createConnection({
    host: "localhost",
    user:"root",
    password:"",
    database:"redeecom",
    multipleStatements:true
  
  });
  
  con.connect((err)=>{
    if(err) throw err;
    console.log("");
  });





router.get('/register', function(req, res, next) {
    if (req.session.loggedin) {
      var sql='SELECT * FROM attribute where att_position=0';
      con.query(sql, function (err, data, fields) {
       if (err) throw err;
  
       res.render('registration',{message : req.flash('error'),alert : req.flash('error2'),Sidebar:data });
     });
     
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });
  
  router.post('/addvendor',function(req, res, next){
    if (req.session.loggedin) {
  
     
    inputData ={
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)

     
  }
  // check unique email address
  var sql='SELECT * FROM registration WHERE email =?';
  con.query(sql, [inputData.email] ,function (err, data, fields) {
  if(err) throw err
  if(data.length>1){
   var msg1 = inputData.email+ "was already exist";
  }else{
   
  // save users data into database
  var sql = 'INSERT INTO registration SET ?';
  con.query(sql, inputData, function (err, data) {
    if (err) throw err;
         });
         console.log(inputData);
  var msg ="Your are successfully registered";
  }
  req.flash('error', msg)
  req.flash('error2', msg1)
  // res.render('registration',{alertMsg:msg});
  
  return  res.redirect("/register");
  })
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });
  
  router.get('/registerlist', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     var sql1='SELECT * FROM registration';
     con.query(sql1, function (err1, data1, fields1) {
      if (err1) throw err1;
     console.log(JSON.stringify(data))
     res.render('ListRegister',{ListData: data1,message : req.flash('message'),Sidebar:data});
  
   });
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });
  
  router.get('/EditVendor', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
    var sql1='SELECT * FROM registration where id='+req.query.id;
   con.query(sql1, function (err1, data1, fields1) {
    if (err1) throw err1;
    res.render('EditRegister', { ListData: data1,Sidebar:data});
  });
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });
  
  

  
  
  router.post('/updateregister', function(req, res, next) {
    if (req.session.loggedin) {
   const name= req.body.name;
   const  email= req.body.email;
    const password= bcrypt.hashSync(req.body.password, 10)
  
   const insertQuery = "Update  registration set name=?,email=?,password=?  WHERE id = ? ";
   const values =[name,email,password,req.query.id]
   con.query(insertQuery,values,(err,results,fields)=>{
     if(err){
       console.log('filed to update',err);
       res.sendStatus(500)
       return;
     }
     console.log('Inserted new User :',results)
     req.flash('message','Data Updated Successfully');
    
      return  res.redirect("registerlist");
      
    });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });
  
  router.get('/DeleteVendor', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='DELETE FROM registration where id='+req.query.id;
   con.query(sql, function (err, data, fields) {
    if (err) throw err;
    req.flash('message','Data Delete Successfully');
    return  res.redirect("registerlist");
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });

  router.get('/logout', function(req, res, next) {
    req.session.loggedin = false;
    req.session.name = '';
    res.redirect('/');
  });

  module.exports = router;