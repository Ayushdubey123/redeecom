const express = require('express');
const path = require('path');
const mysql = require('mysql');
const flash = require('connect-flash');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const multer  = require('multer');
var indexRouter = require('../routes/index');
const uploadImage = require('../helpers/helpers')
const router = express.Router();
  var storage = multer.memoryStorage({
 //var storage = multer.diskStorage({
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
 
  resave: true
}));

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(express.static(path.join(__dirname, 'public')));


// const con=mysql.createConnection({
//     host: "localhost",
//     user:"root",
//     password:"",
//     database:"redeecom",
//     multipleStatements:true
  
//   });
  
const con = mysql.createConnection({
   socketPath     : '/cloudsql/redeecom:us-central1:myredeemocomdbinstrance',
   // host:'49.36.92.51',
   user:"root",
   password:"Ksingh@9825",
   database:"redeecomdb",
   
  });
 
  // con.connect((err)=>{
  //   if(err) throw err;
  //   console.log("");
  // });




router.get('/Banner_AddBanner', function(req, res, next) {
    if (req.session.loggedin) {
        var sql='SELECT * FROM attribute where att_position=0';
        con.query(sql, function (err, data, fields) {
         if (err) throw err;
         var sql2 = 'SELECT * FROM category_master';
      con.query(sql2, function (err2, data3, fields2) {
        if (err2) throw err2;
         res.render('Banner_AddBanner',{message : req.flash('message'), catdata: data3,Sidebar:data});
       });
      });
      } else {
        req.flash('success', 'Please login first!');
        res.redirect('/');
      }
  });
  
router.post('/addbanner', upload.single('banner_image'), async(req,res)=>{
    //  sessions = req.session;
    if (req.session.loggedin) {
      const myFile = req.file
     const imageUrl = await  uploadImage(myFile)
    const banner_image="uploads/"+req.file.filename;
    const cat_name=req.body.cat_name;
   
    const insertQuery = "INSERT INTO banner_master (banner_image,cat_name) VALUES ? ";
    const values =[[imageUrl,cat_name]]
    console.log(req.body.cat_name);
    con.query(insertQuery,[values],(err,results,fields)=>{
      if(err){
        console.log('filed to insert',err);
        res.sendStatus(500)
        return;
      }
      console.log('Inserted new User :',results)
      req.flash('message','Data Inserted Successfully');     
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
      var sql2 = 'SELECT * FROM category_master';
      con.query(sql2, function (err2, data3, fields2) {
        if (err2) throw err2;
     res.render('Banner_EditBanner', {ListData: data1,catdata: data3,Sidebar: data,message:req.flash('message')});
   });
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

  
  router.post('/bannerUpdate', upload.single('banner_image'), async(req,res)=>{
    //  sessions = req.session;
    if (req.session.loggedin) {

      const myFile = req.file
      const imageUrl = await uploadImage(myFile)
    console.log(JSON.stringify(req.file))

    const cat_name=req.body.cat_name;
    const user_status=req.body.user_status;
    const admin_status=req.body.admin_status;
   
  
  if(req.file!=null){
    const banner_image="uploads/"+req.file.filename;
  
  
    const insertQuery = "Update  banner_master set banner_image=?,cat_name=?,user_status=?,admin_status=?  WHERE id = ? ";
    const values =[imageUrl,cat_name,user_status,admin_status,req.query.id]
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


/// Promotional Banner  Operation


  router.get('/promotionbanner', function(req, res, next) {
    if (req.session.loggedin) {
        var sql='SELECT * FROM attribute where att_position=0';
        con.query(sql, function (err, data, fields) {
         if (err) throw err;
         var sql2 = 'SELECT * FROM medicine where status=0';
         con.query(sql2, function (err2, data3, fields2) {
           if (err2) throw err2;
         res.render('addPromotional_products',{message : req.flash('message'),medcinedata: data3,Sidebar:data});
       
      });
    });
      } else {
        req.flash('success', 'Please login first!');
        res.redirect('/');
      }
  });
  
  
  router.post('/addpromotionalbanner', upload.single('image'), async(req,res)=>{
    //  sessions = req.session;
    if (req.session.loggedin) {
      const myFile = req.file
     const imageUrl = await  uploadImage(myFile)
    // const image="uploads/"+req.file.filename;
    const products=req.body.products;
    const data=products.toString();
    const insertQuery = "INSERT INTO promotional_banner (image,products) VALUES ? ";
    const values =[[imageUrl,(data)]]
    con.query(insertQuery,[values],(err,results,fields)=>{
       
      if(err){
        console.log('filed to insert',err);
        res.sendStatus(500)
        return;
      }
      console.log('Inserted new User :',results)
      req.flash('message','Data Inserted Successfully');     
       return  res.redirect("/promotionbanner");
     
    })
   
    // res.end();
  
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });
 

  router.get('/listpromotionalbanner', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     var sql1='SELECT * FROM promotional_banner';
     con.query(sql1, function (err1, data1, fields1) {
      if (err1) throw err1;
     console.log(JSON.stringify(data))
     res.render('listPromotional_product',{ListData: data1,message : req.flash('message'),Sidebar:data});

   });
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });


  router.get('/Editpromotionalbanner', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     var sql1='SELECT * FROM promotional_banner where id='+req.query.id;
     con.query(sql1, function (err1, data1, fields1) {
      if (err1) throw err1;
      var sql2 = 'SELECT * FROM medicine where status=0';
         con.query(sql2, function (err2, data2, fields2) {
           if (err2) throw err2;
     res.render('editPromotional_product', {ListData: data1,medcinedata: data2,Sidebar: data,message:req.flash('message')});
  });
});
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
  }
  });

  router.get('/promotionalbannerstatus', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='UPDATE  promotional_banner set status='+ req.query.val +' where id='+req.query.id;
    
   con.query(sql, function (err, data, fields) {
    if (err) throw err; 
    req.flash('message','Data Updated Successfully');
    return  res.redirect("/listpromotionalbanner");
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });
  
  router.post('/Updatepromotionalbanner', upload.single('image'), async(req,res)=>{
    //  sessions = req.session;
    if (req.session.loggedin) {

      const myFile = req.file
      const imageUrl = await uploadImage(myFile)
    console.log(JSON.stringify(req.file))

    const products=req.body.products;
 
   
  
  if(req.file!=null){
    const banner_image="/uploads"+req.file.filename;
  
  
    const insertQuery = "Update  promotional_banner set image=?,products=?  WHERE id = ? ";
    const values =[imageUrl,products,req.query.id]
    con.query(insertQuery,values,(err,results,fields)=>{
      if(err){
        console.log('filed to update',err);
        res.sendStatus(500)
        return; 
      }
      console.log('Inserted new User :',results)
      req.flash('message','Data Updated Successfully');
       return  res.redirect("/listpromotionalbanner");

    })
  }else{
    const insertQuery = "Update  promotional_banner set products=?  WHERE id = ? ";
    const values =[products,req.query.id]
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
     
       return  res.redirect("/listpromotionalbanner");
       
    })
  }
   
   
    // res.end();
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  
  });


  router.get('/Deletepromotionalbanner', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='DELETE FROM promotional_banner where id='+req.query.id;
   con.query(sql, function (err, data, fields) {
    if (err) throw err;
    req.flash('message','Data Delete Successfully');
    return  res.redirect("/listpromotionalbanner");
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });

 


  module.exports = router;