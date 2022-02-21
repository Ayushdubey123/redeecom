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


// const con = mysql.createConnection({
//   socketPath     : '/cloudsql/redeecom:us-central1:myredeemocomdbinstrance',
//    user:"root",
//    password:"Ksingh@9825",
//    database:"redeecomdb",  
//  });

const con=mysql.createConnection({
  host: "localhost",
  user:"root",
  password:"",
  database:"redeecom",
  multipleStatements:true

});

router.get('/deliverydashboard',function(req,res,next){
  res.render('deliveryboy_dashboard');
});


// router.get('/deliverydashboard', function(req, res, next) {
//   // if (req.session.loggedin) {
//    res.render('delivery_dashboard',{message : req.flash('message')});

// // } else {
// //   req.flash('success', 'Please login first!');
// //   res.redirect('/');
// // }
// });



router.get('/DeliveryBoy_AddDeliveryBoy', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     res.render('DeliveryBoy_AddDeliveryBoy',{message : req.flash('message'),Sidebar:data});
  });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });
  
  
  router.post('/addDelivery', upload.single('image'),(req,res)=>{
  
    //  sessions = req.session;
    if (req.session.loggedin) {
    console.log(JSON.stringify(req.file))
    const delivery_name= req.body.delivery_name;
    const mobile_no=req.body.mobile_no;
    
    const delivery_email=req.body.delivery_email;
    const delivery_password=req.body.delivery_password;
    const delivery_status=req.body.delivery_status;
    const commission=req.body.commission;
    // const deliveryboy_address=req.body.deliveryboy_address;
  
    const insertQuery = "INSERT INTO delivery_master (delivery_name,mobile_no,delivery_email,delivery_password,delivery_status,commission) VALUES ? ";
    const values =[[delivery_name,mobile_no,delivery_email,delivery_password,delivery_status,commission]]
    con.query(insertQuery,[values],(err,results,fields)=>{
      if(err){
        console.log('filed to insert',err);
        res.sendStatus(500)
        return;
      }
      console.log('Inserted new User :',results)
      req.flash('message','Data Inserted Successfully');
     // req.session.message('success','Data is Inserted');
      // res.locals.message = req.flash();
      //res.end();
     
       return  res.redirect("DeliveryBoy_AddDeliveryBoy");
       
      
      
   
    })
    // res.end();
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  
  });

  // 
  router.get('/deliverystatus', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='UPDATE  delivery_master set delivery_status='+ req.query.val +' where id='+req.query.id;
    
   con.query(sql, function (err, data, fields) {
    if (err) throw err; 
    req.flash('message','Data Updated Successfully');
    return  res.redirect("deliverylist");
  });

} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}

  

  });
  // 
  
  router.get('/editdelivery', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
    var sql1='SELECT * FROM delivery_master where id='+req.query.id;
   con.query(sql1, function (err1, data1, fields1) {
    if (err1) throw err1;
    var gradedata=["A","B","C","D","E"];
    
    res.render('Delivery_EditDelivery', { ListData: data1,Sidebar:data,message:req.flash('message'),grade:gradedata});
  });
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });

  router.get('/deliverylist', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     var sql1='SELECT * FROM delivery_master';
     con.query(sql1, function (err1, data1, fields1) {
      if (err1) throw err1;
  
     res.render('DeliveryBoy_ListDeliveryBoy',{ListData: data1, message : req.flash('message'),Sidebar:data});
  
   });
  });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });

  router.post('/updateDelivery',function(req,res){
    if (req.session.loggedin) {
    //  sessions = req.session;
    

    const delivery_name= req.body.delivery_name;
    const mobile_no=req.body.mobile_no;
    const delivery_email=req.body.delivery_email;
    const delivery_password=req.body.delivery_password;
    const delivery_status=req.body.delivery_status;
    const commission=req.body.commission;

  
    const insertQuery = "Update  delivery_master set delivery_name=?,mobile_no=?,delivery_email=?,delivery_password=?,delivery_status=?,commission=? WHERE id = ?";
    const values =[delivery_name,mobile_no,delivery_email,delivery_password,delivery_status,commission,req.query.id]
   
    con.query(insertQuery,values,(err,results,fields)=>{
      if(err){
        console.log('filed to insert',err);
        res.sendStatus(500)
    
        return;
      }
   
      req.flash('message','Data Updated Successfully'); 
      return  res.redirect("/deliverylist");
     
    });
   
    console.log("Updated Mobile No is "+mobile_no);
  
 
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });

  router.get('/DeleteDelivery', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='DELETE FROM delivery_master where id='+req.query.id;
   con.query(sql, function (err, data, fields) {
    if (err) throw err;
    req.flash('message','Data Delete Successfully');
    return  res.redirect("/deliverylist");
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });


  module.exports = router;