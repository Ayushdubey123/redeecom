const express = require('express');
const path = require('path');
const mysql = require('mysql');
const flash = require('connect-flash');
const sessions = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer  = require('multer');
const { futimesSync } = require('fs');
const { count } = require('console');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const {check, validationResult} = require('express-validator');

// const app = require('../app');

const urlencodedParser = bodyParser.urlencoded({extended:false})

const router = express.Router();
router.use(flash());
router.use(cookieParser());

router.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
   
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
  
  
  // const con=mysql.createConnection({
  //   host: "localhost",
  //   user:"root",
  //   password:"",
  //   database:"redeecom",
  //   multipleStatements:true
  // });
  
  // con.connect((err)=>{
  //   if(err) throw err;
  //   console.log("");
  // });

  router.get('/userregister', function(req, res, next) {
    if (req.session.loggedin) {
      var sql='SELECT * FROM attribute where att_position=0';
      con.query(sql, function (err, data, fields) {
       if (err) throw err;
  
       res.render('UserRegistration',{message : req.flash('error'),alert : req.flash('error2'),Sidebar:data });
     });
     
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });
  
  // function phonenumber(inputtxt)
  // {
  //   var phoneno = /^\d{10}$/;
  //   if((inputtxt.value.match(phoneno))
  //         {
  //       return true;
  //         }
  //       else
  //         {
  //         alert("message");
  //         return false;
  //         }
  // }


  router.post('/adduser',function(req, res, next){
    if (req.session.loggedin) {
    inputData ={
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      mobile: req.body.mobile,
      password:  bcrypt.hashSync(req.body.password, 10),
      // cpassword:  bcrypt.hashSync(req.body.password, 10)
     
  }
  // check unique email address
  var sql='SELECT * FROM user WHERE email =?';
  con.query(sql, [inputData.email] ,function (err, data, fields) {
  if(err) throw err
  if(data.length>1){
   var msg1 = inputData.email+ "was already exist";
  }
  //else if(inputData.cpassword != inputData.password){
  // var msg1 ="  Password & Confirm Password is not Matched";
  
  // }
  else{
   
  // save users data into database
  var sql = 'INSERT INTO user SET ?';
  con.query(sql, inputData, function (err, data) {
    if (err) throw err;
         });
         console.log(inputData);
  var msg ="Your are successfully registered";
  }
  req.flash('error', msg)
  req.flash('error2', msg1)
  // res.render('registration',{alertMsg:msg});
  
  return  res.redirect("/userregister");
  })
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });
  
  router.get('/userlist', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     var sql1='SELECT * FROM user';
     con.query(sql1, function (err1, data1, fields1) {
      if (err1) throw err1;
     console.log(JSON.stringify(data))
     res.render('User_Customer',{ListData: data1,message : req.flash('message'),Sidebar:data});
  
   });
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });
  
  router.get('/Edituser', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
    var sql1='SELECT * FROM user where id='+req.query.id;
   con.query(sql1, function (err1, data1, fields1) {
    if (err1) throw err1;
    res.render('EditUserRegister', {ListData:data1,Sidebar:data,message : req.flash('message')});
  });
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });

  
  router.post('/updateuser', function(req, res, next) {
    if (req.session.loggedin) {
   const first_name= req.body.first_name;
   const last_name= req.body.last_name;
   const email= req.body.email;
   const mobile= req.body.mobile
   const password= req.body.password;
  //  const cpassword= req.body.cpassword;
    
   const insertQuery = "Update  user set first_name=?,last_name=?,email=?,mobile=?,password=? WHERE id = ? ";
   const values =[first_name,last_name,email,mobile,password,req.query.id]
   con.query(insertQuery,values,(err,results,fields)=>{
     if(err){
       console.log('filed to update',err);
       res.sendStatus(500)
       return;
     }
     console.log('Inserted new User :',results)
     req.flash('message','Data Updated Successfully');
    
      return  res.redirect("/userlist");
      
    });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });
  
  router.get('/Deleteuser', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='DELETE FROM user where id='+req.query.id;
   con.query(sql, function (err, data, fields) {
    if (err) throw err;
    req.flash('message','Data Delete Successfully');
    return  res.redirect("/userlist");
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });

  

  module.exports = router;