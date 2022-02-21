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
const { json } = require('body-parser');
const saltRounds = 10;

// const app = require('../app');


// session.cookie.expires = 7 * 24 * 3600 * 1000; 

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
// app.use(express.cookieParser());
router.use('/uploads', express.static('uploads'));
  // const mysqlconnection=require("../connection");
// router.use('/', admin);
router.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized:true,
  resave: true
}));

router.use(express.json ());
router.use(express.urlencoded({ extended: true }));
router.use(express.static(path.join(__dirname, 'public')));



// const con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "redeecom",
//   multipleStatements: true

// });


  const con = mysql.createConnection({
    socketPath     : '/cloudsql/redeecom:us-central1:myredeemocomdbinstrance',
    user:"root",
    password:"Ksingh@9825",
    database:"redeecomdb",
 });




router.get('/AttributesData' , function(req, res, next) {
    if (req.session.loggedin) {
  
  
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     var sql1='SELECT * FROM attribute where att_id='+req.query.id;
     con.query(sql1, function (err1, data1, fields1) {
      if (err1) throw err1;
      var sql2='SELECT * FROM attribute_data where att_id='+req.query.id;
     con.query(sql2, function (err2, data2, fields2) {
      if (err2) throw err2;
     res.render('AttributesData',{message : req.flash('message'),Sidebar:data,Data:data1,ListData:data2});
   
   
    });
  });
  });
   
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  
  });
  
  
  
  router.post('/AttributesDatasave', upload.single('image'),(req,res)=>{
    //  sessions = req.session;
    if (req.session.loggedin) {
  
    console.log(JSON.stringify(req.file))
    const att_id= req.query.id;
    const value=req.body.name;
    
    const insertQuery = "INSERT INTO attribute_data (att_id,value) VALUES ? ";
    const values =[[att_id,value]]
    con.query(insertQuery,[values],(err,results,fields)=>{
      if(err){
        console.log('filed to insert',err);
        res.sendStatus(500)
        return;
      }
      console.log('Inserted new User :',results)
      req.flash('message','Data Inserted Successfully');
       return  res.redirect("AttributesData?id="+req.query.id);
   
    })
  
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  
   
  });
  router.get('/AttributeEdit', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err;
     var sql1='SELECT * FROM attribute where att_id='+req.query.att_id;
     con.query(sql1, function (err1, data1, fields1) {
      if (err1) throw err1;
      var sql2='SELECT * FROM attribute_data where att_id='+req.query.att_id;
     con.query(sql2, function (err2, data2, fields2) {
      if (err2) throw err2;
  
     
    var sql3='SELECT * FROM attribute_data where id='+req.query.id;
   con.query(sql3, function (err3, data3, fields3) {
    if (err3) throw err3;
    res.render('AttributeData_edit',{message : req.flash('message'),Sidebar:data,Data:data1,ListData:data2,form:data3});
  });
  });
  });
  });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });
  router.post('/AttributesDataupdate', upload.single('image'),(req,res)=>{
    //  sessions = req.session;
    if (req.session.loggedin) {
    console.log(JSON.stringify(req.file))
    const att_id= req.query.id;
    const value=req.body.name;
    
    const insertQuery = "UPDATE  attribute_data  set value='"+value+"'   where id= "+req.query.id;
   
    con.query(insertQuery,(err,results,fields)=>{
      if(err){
        console.log('filed to insert',err);
        res.sendStatus(500)
        return;
      }
      console.log('Inserted new User :',results)
      req.flash('message','Data Updated Successfully');
     // req.session.message('success','Data is Inserted');
      // res.locals.message = req.flash();
      //res.end();
     
      return  res.redirect("AttributesData?id="+req.query.att_id);
       
      
       //console.log("Data Inserted Succcessfuly");
      //return res.status(200).json({success: 'Insert row success'});
   
    })
    // res.end();
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  
  });
  

  router.get('/Attribute_AddAttribute', function(req, res, next) {
    if (req.session.loggedin) {
      
        var sql='SELECT * FROM attribute where att_position=0';
        con.query(sql, function (err, data, fields) {
         if (err) throw err; 
        //  var sql1='SELECT * FROM attribute where isparent=0';
        //  con.query(sql1, function (err2, data2, fields1) {
        //   if (err2) throw err2;
          var sql1='SELECT * FROM attribute where cat_id='+req.query.id;
          con.query(sql1, function (err2, data2, fields1) {
           if (err2) throw err2;
       
           var category=req.query.id;
          var field =['Number','Text','Text Area','Searchable Radio (Searchable Dropdown)','Searchable Checkbox (Multi-Select)','Searchable Dropdown','Color'];
         res.render('Attribute_AddAttribute',{message : req.flash('message'),Sidebar:data,field:field,parent:data2,category:category});
        
         console.log("id"+category);
  
  });
    });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });
  
  async function attributes () {
    if (req.session.loggedin) {
    var returnresult=[];
    var att_name=''
   
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
      if (err)  throw err;
      
        data.forEach(function(mydata){ 
          con.query('SELECT * FROM attribute_data where att_id='+mydata.att_id, function (err, data1, fields) {
            // console.log(JSON.stringify(data1))
            var key=mydata.att_name;
            var Jarray={
              key : data1
            }
            returnresult.push(Jarray)
          });
        });  
       
      return returnresult ;   
      
  });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  }
  

  router.post('/addattribute', (req,res)=>{
    //  sessions = req.session;
    if (req.session.loggedin) {
  
    console.log(JSON.stringify(req.file))
    const att_name= req.body.att_name;
    const att_type=req.body.att_type;
    const att_position=req.body.att_position;
    const att_number=req.body.att_number;
    const cat_id=req.query.id;
    const isparent=req.body.isparent;
    const key_name=att_name.replace(/\s/g, '');
    const insertQuery = "INSERT INTO attribute (att_name,att_type,att_position,att_number,cat_id,isparent,key_name) VALUES ? ";
    const values =[[att_name,att_type,att_position,att_number,cat_id,isparent,key_name]]
    console.log('data'+values);
    con.query(insertQuery,[values],(err,results,fields)=>{
      if(err){
        console.log('filed to insert',err);
        res.sendStatus(500)
        return;
      }
      
      console.log('Inserted new User :',results)
      
      req.flash('message','Data Inserted Successfully');  
       return  res.redirect("Attribute_ListAttribute?id="+req.query.id);
    })
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });

  router.get('/Attribute_ListAttribute', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err; 
     var sql1='SELECT * FROM attribute where cat_id='+req.query.id;
     con.query(sql1, function (err1, data1, fields1) {
      if (err1) throw err1;
   
      var category=req.query.id;
      var field =['Number','Text','Text Area','Search Radio','Searchable Checkbox','Searchable Dropdown','Color'];
     res.render('Attribute_ListAttribute',{ListData: data1,message : req.flash('message'),Sidebar:data,field:field,category:category});

});
});
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });

  router.get('/EditAttribute', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='SELECT * FROM attribute where att_position=0';
    con.query(sql, function (err, data, fields) {
     if (err) throw err; 
     var sql1='SELECT * FROM attribute where isparent=0 and att_id!='+req.query.id;
     con.query(sql1, function (err2, data2, fields1) {
      if (err2) throw err2;
       var sql1='SELECT * FROM attribute where att_id='+req.query.id;
      con.query(sql1, function (err1, data1, fields1) {
       if (err1) throw err1;
      var field =['Number','Text','Text Area','Search Radio','Searchable Checkbox','Searchable Dropdown','Color'];
     res.render('Attribute_EditAttribute',{ListData: data1,message : req.flash('message'),Sidebar:data,field:field,parent:data2});
    
  });
});
});
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });

  router.post('/update',(req,res)=>{
    if (req.session.loggedin) {
    //  sessions = req.session;
    
    const att_name= req.body.att_name;
    const att_type=req.body.att_type;
    const att_position=req.body.att_position;
    const att_number=req.body.att_number;
    const isparent=req.body.isparent;
    const key_name=att_name.replace(/\s/g, '');
  
    const insertQuery = "Update  attribute set att_name=?,att_type=?,att_position=?,att_number=?,isparent=?,key_name=? WHERE att_id = ?";
    const values =[att_name,att_type,att_position,att_number,isparent,key_name,req.query.id]

    con.query(insertQuery,values,(err,results,fields)=>{
      if(err){
        console.log('filed to insert',err);
        res.sendStatus(500)
        return;
      }
      req.flash('message','Data Updated Successfully'); 
      return  res.redirect("/Attribute_ListAttribute");
    });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
  });


  router.get('/attributeDelete', function(req, res, next) {
    if (req.session.loggedin) {
    var sql='DELETE FROM attribute where att_id='+req.query.id;
   con.query(sql, function (err, data, fields) {
    if (err) throw err;
    req.flash('message','Data Delete Successfully');
    return  res.redirect("Attribute_ListAttribute");
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });

  router.get('/attribute_attributeDelete', function(req, res, next) {
    if (req.session.loggedin) {
      console.log("id="+req.query.id);
    var sql='DELETE FROM attribute_data where id='+req.query.id;
   con.query(sql, function (err, data, fields) {
    if (err) throw err;
    req.flash('message','Data Delete Successfully');
    return  res.redirect("/AttributesData?id="+req.query.att_id);
  });
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
  });

//   router.get('/listattribute', function(req, res, next) {
//     // if (req.session.loggedin) {
//     console.log("id="+req.query.id);
//     var sql='select * from category_master where cat_id='+req.query.id;
//    con.query(sql, function (err, data, fields) {
//     if (err) throw err;
//     req.flash('message','Data Find Successfully');
//     return  res.redirect("/Attribute_ListAttribute");
//   });
// // } else {
// //   req.flash('success', 'Please login first!');
// //   res.redirect('/');
// // }
//   });

  



  
  module.exports = router;