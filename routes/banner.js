const express = require('express');
const path = require('path');
const mysql = require('mysql');
const flash = require('connect-flash');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const multer  = require('multer');
var indexRouter = require('../routes/index');

const router = express.Router();
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})
var upload = multer({ storage: storage })
router.use(express.json());
router.use(flash());
router.use(cookieParser());
router.use('/uploads', express.static('uploads'));
router.use('/', indexRouter);
router.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized:true,
  cookie: { maxAge:50000 },
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




router.get('/Banner_AddBanner', function(req, res, next) {
    if (req.session.loggedin) {
        var sql='SELECT * FROM attribute where att_position=0';
        con.query(sql, function (err, data, fields) {
         if (err) throw err;
         res.render('Banner_AddBanner',{message : req.flash('message'),Sidebar:data});
       });
      } else {
        req.flash('success', 'Please login first!');
        res.redirect('/');
      }
  });
  
router.post('/addbanner', upload.single('banner_image'),(req,res)=>{
    //  sessions = req.session;
    if (req.session.loggedin) {

    console.log(JSON.stringify(req.file))
   
    const banner_image="uploads/"+req.file.filename;
    const cat_name=req.body.cat_name;
    const user_status=req.body.user_status;
    const admin_status=req.body.admin_status;
    const insertQuery = "INSERT INTO banner_master (banner_image,cat_name,user_status,admin_status) VALUES ? ";
    const values =[[banner_image,cat_name,user_status,admin_status]]
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
     
       return  res.redirect("Banner_AddBanner");
       
      
       //console.log("Data Inserted Succcessfuly");
      //return res.status(200).json({success: 'Insert row success'});
   
    })
    // res.end();
  
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });
  
  router.get('/bannerList', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     var sql1='SELECT * FROM banner_master';
     con.query(sql1, function (err1, data1, fields1) {
      if (err1) throw err1;
     console.log(JSON.stringify(data))
     res.render('Banner_ListBanner',{ListData: data1,message : req.flash('message'),Sidebar:data});

   });
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });
 
  router.get('/Banner_EditBanner', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     var sql1='SELECT * FROM banner_master where id='+req.query.id;
     con.query(sql1, function (err1, data1, fields1) {
      if (err1) throw err1;
     res.render('Banner_EditBanner', {ListData: data1,Sidebar: data,message:req.flash('message')});
   });
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
  }
});
 


  router.get('/bannerstatus', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='UPDATE  banner_master set banner_status='+ req.query.val +' where id='+req.query.id;
    
   con.query(sql, function (err, data, fields) {
    if (err) throw err; 
    req.flash('message','Data Updated Successfully');
    return  res.redirect("/bannerList");
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });

  
  router.post('/bannerUpdate', upload.single('banner_image'),(req,res)=>{
    //  sessions = req.session;
    if (req.session.loggedin) {
    console.log(JSON.stringify(req.file))
    const cat_name=req.body.cat_name;
    const user_status=req.body.user_status;
    const admin_status=req.body.admin_status;
   
  
  if(req.file!=null){
    const banner_image="uploads/"+req.file.filename;
  
  
    const insertQuery = "Update  banner_master set banner_image=?,cat_name=?,user_status=?,admin_status=?  WHERE id = ? ";
    const values =[banner_image,cat_name,user_status,admin_status,req.query.id]
    con.query(insertQuery,values,(err,results,fields)=>{
      if(err){
        console.log('filed to update',err);
        res.sendStatus(500)
        return;
      }
      console.log('Inserted new User :',results)
      req.flash('message','Data Updated Successfully');
       return  res.redirect("/bannerList");

    })
  }else{
    const insertQuery = "Update  banner_master set cat_name=?,user_status=?,admin_status=?  WHERE id = ? ";
    const values =[cat_name,user_status,admin_status,req.query.id]
    con.query(insertQuery,values,(err,results,fields)=>{
      if(err){
        console.log('filed to update',err);
        res.sendStatus(500)
        return;
      }
      console.log('Inserted new User :',results)
      req.flash('message','Data Updated Successfully');
     // req.session.message('success','Data is Inserted');
      // res.locals.message = req.flash();
      //res.end();
     
       return  res.redirect("/bannerList");
       
    })
  }
   
   
    // res.end();
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  
  });


  router.get('/bannerDelete', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='DELETE FROM banner_master where id='+req.query.id;
   con.query(sql, function (err, data, fields) {
    if (err) throw err;
    req.flash('message','Data Delete Successfully');
    return  res.redirect("/bannerList");
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });



  module.exports = router;