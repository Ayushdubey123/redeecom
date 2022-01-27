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
  // const mysqlconnection=require("../connection");
// router.use('/', admin);
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
<<<<<<< HEAD
    if(err) throw err;
    console.log("");
  });


  
  router.get('/adminDashboard', function(req, res, next) {
    if (req.session.loggedin) {
=======
    if(err)throw err;
    console.log("");
  });

  router.get('/adminDashboard', function(req, res, next) {
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     res.render('adminDashboard', {Sidebar: data});
   });
<<<<<<< HEAD
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  }); 

  router.get('/Category' , function(req, res, next) {
    if (req.session.loggedin) {
=======
   
  }); 

  router.get('/Category' , function(req, res, next) {
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     res.render('Category_AddCategory',{message : req.flash('message'),Sidebar:data});
   });
<<<<<<< HEAD
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
=======
   
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31
  });

router.post('/save', upload.single('image'),(req,res)=>{
    //  sessions = req.session;
<<<<<<< HEAD
    if (req.session.loggedin) {

    console.log(JSON.stringify(req.file))
    const name= req.body.name;
    const image="uploads/"+req.file.filename;
=======
    console.log(JSON.stringify(req.file))
    const name= req.body.name;
    const image=req.file.path;
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31
    
    const user_status=req.body.user_status;
    const admin_status=req.body.admin_status;
    const insertQuery = "INSERT INTO category_master (cat_name,cat_image,user_status,admin_status) VALUES ? ";
    const values =[[name,image,user_status,admin_status]]
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
     
       return  res.redirect("Category");
       
      
       //console.log("Data Inserted Succcessfuly");
      //return res.status(200).json({success: 'Insert row success'});
   
    })
    // res.end();
  
<<<<<<< HEAD
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });

  router.get('/CategoryList', function(req, res, next) {
    if (req.session.loggedin) {
=======
  
  });

  router.get('/CategoryList', function(req, res, next) {
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     var sql1='SELECT * FROM category_master';
     con.query(sql1, function (err1, data1, fields1) {
      if (err1) throw err1;
     console.log(JSON.stringify(data))
     res.render('Category_ListCategory',{ListData: data1,message : req.flash('message'),Sidebar:data});

   });
  });
<<<<<<< HEAD
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
=======
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31
  });

  
  
  
  router.get('/CategoryEdit', function(req, res, next) {
<<<<<<< HEAD
    if (req.session.loggedin) {
=======
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
    var sql1='SELECT * FROM category_master where cat_id='+req.query.id;
   con.query(sql1, function (err1, data1, fields1) {
    if (err1) throw err1;
    res.render('Category_EditCategory', { ListData: data1,Sidebar:data});
  });
});
<<<<<<< HEAD
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });
  

  
  router.get('/catstatus', function(req, res, next) {
    if (req.session.loggedin) {
=======
  });
  
  router.get('/CategoryDelete', function(req, res, next) {
    var sql='DELETE FROM category_master where cat_id='+req.query.id;
   con.query(sql, function (err, data, fields) {
    if (err) throw err;
   
   
   
    req.flash('message','Data Delete Successfully');
    return  res.redirect("CategoryList");
  });
  
  });
  
  router.get('/catstatus', function(req, res, next) {
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31
    var sql='UPDATE  category_master set cat_status='+ req.query.val +' where cat_id='+req.query.id;
    
   con.query(sql, function (err, data, fields) {
    if (err) throw err; 
    req.flash('message','Data Updated Successfully');
    return  res.redirect("CategoryList");
  });
<<<<<<< HEAD
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
=======
  
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31
  });
  
  
  router.post('/CategoryUpdate', upload.single('image'),(req,res)=>{
    //  sessions = req.session;
<<<<<<< HEAD
    if (req.session.loggedin) {
=======
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31
    console.log(JSON.stringify(req.file))
    const name= req.body.name;
    const user_status=req.body.user_status;
    const admin_status=req.body.admin_status;
   
  
  if(req.file!=null){
<<<<<<< HEAD
    // const image=req.file.path;
    const image="uploads/"+req.file.filename;
=======
    const image=req.file.path;
  
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31
  
    const insertQuery = "Update  category_master set cat_name=?,cat_image=?,user_status=?,admin_status=?  WHERE cat_id = ? ";
    const values =[name,image,user_status,admin_status,req.query.id]
    con.query(insertQuery,values,(err,results,fields)=>{
      if(err){
        console.log('filed to update',err);
        res.sendStatus(500)
        return;
      }
      console.log('Inserted new User :',results)
      req.flash('message','Data Updated Successfully');
       return  res.redirect("CategoryList");

    })
  }else{
    const insertQuery = "Update  category_master set cat_name=?,user_status=?,admin_status=?  WHERE cat_id = ? ";
    const values =[name,user_status,admin_status,req.query.id]
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
     
       return  res.redirect("CategoryList");
       
      
       //console.log("Data Inserted Succcessfuly");
      //return res.status(200).json({success: 'Insert row success'});
   
    })
  }
   
   
    // res.end();
<<<<<<< HEAD
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  
  });

  router.get('/CategoryDelete', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='DELETE FROM category_master where cat_id='+req.query.id;
   con.query(sql, function (err, data, fields) {
    if (err) throw err;
    req.flash('message','Data Delete Successfully');
    return  res.redirect("CategoryList");
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });

=======
  
  
  });

>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31
  module.exports = router;