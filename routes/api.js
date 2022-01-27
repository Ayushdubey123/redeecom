const express = require('express');
const path = require('path');
const mysql = require('mysql');
const flash = require('connect-flash');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
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


// User Registration/Login Api

  router.post('/Apiadduser',function(req, res, next){

    inputData ={
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: bcrypt.hashSync(req.body.password, 10),
      token: req.body.token,
  }
  // check unique email address
  var sql='SELECT * FROM user WHERE email =? or mobile=?';
  con.query(sql, [inputData.email,inputData.mobile] ,function (err, data, fields) {
  if(err) throw err
  
  if(data.length>0){
  const user={
    status:false,
    data:data,
    message:"User Exist"
  }
  res.writeHead(200,{"Content-Type":"application/json"});
      res.end(JSON.stringify(user));
  }else{

          
          // save users data into database
          var sql = 'INSERT INTO user SET ?';
          con.query(sql, inputData, function (err, data) {
            if (err) {
              const user={
                status:true,
                data:[],
                message:"User Not inserted"+err
              }
              res.writeHead(200,{"Content-Type":"application/json"});
              res.end(JSON.stringify(user));
            
            }

            else{
              const user={
                status:true,
                data:data,
                message:"User inserted"
              }
              res.writeHead(200,{"Content-Type":"application/json"});
              res.end(JSON.stringify(user));
            
            }
                });
          
  }
        });
  });
  router.post('/Apicheckuser',function(req, res, next){

    inputData ={
      mobile: req.body.mobile,
  }
  // check unique email address
  var sql='SELECT * FROM user WHERE email =? or mobile=?';
  con.query(sql, [inputData.mobile,inputData.mobile] ,function (err, data, fields) {
  if(err) throw err
  if(data.length>0){
  const user={
    status:true,
    data:data,
    message:"User Exist"
  }
  res.writeHead(200,{"Content-Type":"application/json"});
      res.end(JSON.stringify(user));
  }else{
    const user={
      status:false,
      data:data,
      message:"User Not Exist"
    }
    res.writeHead(200,{"Content-Type":"application/json"});
        res.end(JSON.stringify(user));
        
  }
        });
  });
  
  
  router.post('/apiuserlogin', function(req, res) {
    const username=req.body.username;
    const password=req.body.password;
    
   res.set('Access-Control-Allow-Origin','*');
     con.query("select * from user where email=? or mobile = ?",[username,username],function(err,results,fields){
    if(err) throw err
        if (results.length <= 0) {
          const user={
            status:false,
            data:fields,
            message:"Invalid User"+err
          }
          res.writeHead(200,{"Content-Type":"application/json"});
              res.end(JSON.stringify(user));
          }
        else{
          const verified = bcrypt.compareSync(password,results[0].password);    
          if(verified){
            const user={
              status:true,
              data:results,
              message:"User Loged In Successfully"
            }
            res.writeHead(200,{"Content-Type":"application/json"});
                res.end(JSON.stringify(user));
              
          }
          else{
             const user={
            status:false,
            data:[],
            message:"User Not LogedIN"
          }
          res.writeHead(200,{"Content-Type":"application/json"});
              res.end(JSON.stringify(user));
          }
        
        }
      });
  });


//Vender Login Api 

  router.post('/apivendorlogin', function(req, res) {
    const email=req.body.email
    const password=req.body.password;
    console.log(email)
     con.query("select * from registration where email = ? ",[email],function(err,results,fields){
    if(err) throw err
        if (results.length <= 0) {
          const user={
            status:false,
            data:fields,
            message:"Invalid User"+err
          }
          res.writeHead(200,{"Content-Type":"application/json"});
              res.end(JSON.stringify(user));
          }
        else{
          const verified = bcrypt.compareSync(password,results[0].password);    
          if(verified){
            const user={
              status:true,
              data:results,
              message:"User Loged In Successfully"
            }
            res.writeHead(200,{"Content-Type":"application/json"});
                res.end(JSON.stringify(user));
              
          }
          else{
             const user={
            status:false,
            data:[],
            message:"User Not LogedIN"
          }
          res.writeHead(200,{"Content-Type":"application/json"});
              res.end(JSON.stringify(user));
          }
        
        }
      });
  });

// Add Medicine Api

  router.post('/apiaddmedicine', upload.single('image'), (req, res) => {
      var attribute_detail = {};
      var sql = 'SELECT * FROM attribute where status=0 ';
      con.query(sql, function (err, data, fields) {
  
        data.forEach(function (data) {
          attribute_detail[data.key_name] = req.body[data.key_name]
  
        });

        var instockdata = 0;
        var statusdata = 0;
        const image="uploads/"+req.file.filename;
        const name = req.body.name;
  
  
        const instock = req.body.instock;
        if (instock == '0') {
          instockdata = 0
        } else {
          instockdata = 1
        }
        const status = req.body.status;
        if (status == '0') {
          statusdata = 0
        } else {
          statusdata = 1
        }
        const price = req.body.price;
        const category = req.body.category;
  
        const insertQuery = "INSERT INTO medicine (image,name,instock,status,price,category,attribute_details) VALUES ? ";
        const values = [[image, name, instockdata, statusdata, price, category, JSON.stringify(attribute_detail)]]

        con.query(insertQuery, [values], (err, results, fields) => {
          if (err) {
            const medicine={
              status:true,
              data:[],
              message:"Medicine Not inserted"+err
            }
            res.writeHead(200,{"Content-Type":"application/json"});
            res.end(JSON.stringify(medicine));
          
          }
          const medicine={
            status:true,
            data:data,
            message:"Data Inserted Successfully"
          }
          res.writeHead(200,{"Content-Type":"application/json"});
          res.end(JSON.stringify(medicine));
        
  
        })
        console.log("jhsad".results);
      });
 
   
  });


router.post('/apibannerList', function(req, res, next) {
     var sql1='SELECT * FROM banner_master where banner_status=0';
     con.query(sql1, function (err1, data1, fields1) {
      if (err1) throw err1;
      if (data1.length <= 0) {
        const user={
          status:false,
          data:[],
          message:"No Banner Found"+err
        }
        res.writeHead(200,{"Content-Type":"application/json"});
            res.end(JSON.stringify(user));
        }
        else{
          const user={
            status:true,
            data:data1,
            message:"Yes Banner Gotted"
          }
          res.writeHead(200,{"Content-Type":"application/json"});
              res.end(JSON.stringify(user));
        }
  });
});
 
router.post('/apipoductbycatId', function(req, res, next) {
  const data=req.body.id;
  var sql1='SELECT * FROM medicine where category='+data;
  con.query(sql1, function (err1, data1, fields1) {
   if (err1) throw err1;
   if (data1.length <= 0) {
     const user={
       status:false,
       data:[],
       message:"No Product Found"
     }
     res.writeHead(200,{"Content-Type":"application/json"});
         res.end(JSON.stringify(user));
     }
     else{
       const user={
         status:true,
         data:data1,
         message:"Yes Products Gotted"
       }
       res.writeHead(200,{"Content-Type":"application/json"});
           res.end(JSON.stringify(user));
     }
});
});

router.post('/apigetallcat', function(req, res, next) {
  
  var sql1='SELECT * FROM category_master WHERE cat_status = 0 ';
  con.query(sql1, function (err1, data1, fields1) {
   if (err1) throw err1;
   if (data1.length <= 0) {
     const user={
       status:false,
       data:[],
       message:"No Category Found"
     }
     res.writeHead(200,{"Content-Type":"application/json"});
         res.end(JSON.stringify(user));
     }
     else{
       const user={
         status:true,
         data:data1,
         message:"Yes Categorys Gotted"
       }
       res.writeHead(200,{"Content-Type":"application/json"});
           res.end(JSON.stringify(user));
     }
});
});

 
router.post('/apipoductbyproId', function(req, res, next) {
  const data=req.body.id;
  const cat_data=req.body.cat_id;
  var sql1='SELECT * FROM medicine where id='+data;
  con.query(sql1, function (err1, data1, fields1) {
   if (err1) throw err1;
   if (data1.length <= 0) {
     const user={
       status:false,
       data:[],
       message:"No Product Found"
     }
     res.writeHead(200,{"Content-Type":"application/json"});
         res.end(JSON.stringify(user));
     }
     else{
      var sql1='SELECT * FROM medicine where category='+cat_data;
      con.query(sql1, function (err1, data2, fields1) {
       if (err1) throw err1;


       const user={
         status:true,
         data:data1,
         related_data:data2,
         message:"Yes Products Gotted"
       }
       res.writeHead(200,{"Content-Type":"application/json"});
           res.end(JSON.stringify(user));
          });
     }

});
});


router.post('/apigetallproduct', function(req, res, next) {
  
  var sql1='SELECT * FROM medicine WHERE status =0  ';
  con.query(sql1, function (err1, data1, fields1) {
   if (err1) throw err1;
   if (data1.length <= 0) {
     const user={
       status:false,
       data:[],
       message:"No Category Found"
     }
     res.writeHead(200,{"Content-Type":"application/json"});
         res.end(JSON.stringify(user));
     }
     else{
       const user={
         status:true,
         data:data1,
         message:"Yes Categorys Gotted"
       }
       res.writeHead(200,{"Content-Type":"application/json"});
           res.end(JSON.stringify(user));
     }
});
});


router.post('/apiorder', function(req,res){
});







module.exports=router;