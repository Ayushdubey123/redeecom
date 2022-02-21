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
const uploadImage = require('../helpers/helpers');
const { json } = require('body-parser');

// const app = require('../app');

const router = express.Router();
//const admincontroller=require("../Controller/admin");

// var storage = multer.diskStorage({
  var storage = multer.memoryStorage({
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
  cookie: { maxAge: 120000 },
  resave: false
}));

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "redeecom",
  multipleStatements: true
});

const con = mysql.createConnection({
  socketPath     : '/cloudsql/redeecom:us-central1:myredeemocomdbinstrance',
   user:"root",
   password:"Ksingh@9825",
   database:"redeecomdb",
 });


  //User Registration/Login Apis 
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
                status:false,
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
  router.post('/apiupdateuser', function(req, res, next) {
    // if (req.session.loggedin) {
   const first_name= req.body.first_name;
   const last_name= req.body.last_name;
   const  email= req.body.email;
  //  const mobile= req.body.mobile
   const password= bcrypt.hashSync(req.body.password, 10);
  //const cpassword= req.body.cpassword;
    
   const insertQuery = "Update  user set first_name=?,last_name=?,email=?,password=? WHERE id = "+req.body.id;
   const values =[first_name,last_name,email,password,req.body.id]
   con.query(insertQuery,values,(err,results,fields)=>{
    if (err) 
    {
     const order={
       status:false,
       data:[],
       message:"Some Error Ocure"+err1
     }
     res.writeHead(200,{"Content-Type":"application/json"});
         res.end(JSON.stringify(order));
         console.log("err"+err1);
     }
     else{
       const order={
         status:true,
         data:results,
         message:"Update User Successfully"
       }
       res.writeHead(200,{"Content-Type":"application/json"});
           res.end(JSON.stringify(order));
     }
      
    });
  // } else {
  //   req.flash('success', 'Please login first!');
  //   res.redirect('/');
  // }
  });

  //Vender Opereation  Apis  
  router.post('/Apiaddvendor',function(req, res, next){

  inputData ={
    name: req.body.name,
    email: req.body.email,
    mobile: req.body.mobile,
    password: bcrypt.hashSync(req.body.password, 10),
    location: req.body.location,
    b_name:req.body.b_name,
    address:req.body.address,
    business_type:req.body.business_type,
    trade_licence:req.body.trade_licence,
    drug_licence:req.body.drug_licence
}
// check unique email address
var sql='SELECT * FROM registration WHERE email =? or mobile=?';
con.query(sql, [inputData.email,inputData.mobile] ,function (err, data, fields) {
if(err) throw err

if(data.length>0){
const user={
  status:false,
  data:data,
  message:"Vendor Exist"
}
res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(user));
}else{

        
        // save users data into database
        var sql = 'INSERT INTO registration SET ?';
        con.query(sql, inputData, function (err, data) {
          if (err) {
            const user={
              status:false,
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
              message:"Vendor inserted Successfully"
            }
            res.writeHead(200,{"Content-Type":"application/json"});
            res.end(JSON.stringify(user));
          
          }
              });
        
}
      });
  });
  router.post('/apivendorlogin', function(req, res) {
    const email=req.body.email
    const password=req.body.password;
    
     con.query("select * from registration where email = ? or mobile = ? ",[email,email],function(err,results,fields){
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
  router.post('/apiaddbusiness', function (req,res){

  try{
    const type=req.body.type;
    const insertQuery = "INSERT INTO business (type) VALUES ? ";
    const values =[[type]]
    console.log("values="+insertQuery);
    
    console.log("values="+JSON.stringify(values));
    con.query(insertQuery,[values],(err,results,fields)=>{
      if(err){
        const business={
          status:false,
          data:[],
          message:"Some Error Ocure"+err
        }
        res.writeHead(200,{"Content-Type":"application/json"});
            res.end(JSON.stringify(business));
      }
      const business={
        status:true,
        data:results,
        message:"Data Inserted"
      }
      res.writeHead(200,{"Content-Type":"application/json"});
      res.end(JSON.stringify(business)); 
    })
    // res.end();
  }catch(ex){
  
    const business={
      status:false,
      data:[],
      message:"Order Faild"+ex.toString()
    }
    res.writeHead(200,{"Content-Type":"application/json"});
        res.end(JSON.stringify(business));
  }
  
  
    });
  router.post('/apigetbusiness', function(req, res, next) {
      var sql1='select * from business';
      con.query(sql1, function (err1, data1, fields1) {
       if (err1) throw err1;
      
       if (data1.length <= 0) {
  
         const get={
           status:false,
           data:[],
           message:"Data Not Found"
         }
         res.writeHead(200,{"Content-Type":"application/json"});
             res.end(JSON.stringify(get));
         }
         else{
           const get={
             status:true,
             data:data1,
             message:"Find Successfully"
           }
           res.writeHead(200,{"Content-Type":"application/json"});
               res.end(JSON.stringify(get));
            
         }
         

    });
    });




  // Add Medicine Apis
  router.post('/apiaddmedicine', upload.single('image'),async(req, res) => {
      var attribute_detail = req.body.attribute_detail;
     
      
        var instockdata = 0;
        var statusdata = 0;
  
        const myFile = req.file
        const imageUrl = await uploadImage(myFile)
        
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
         const added_by = req.body.added_by;
        const insertQuery = "INSERT INTO medicine (image,name,instock,status,price,category,attribute_details,added_by) VALUES ? ";
        const values = [[imageUrl,name, instockdata, statusdata, price, category, JSON.stringify(attribute_detail),added_by]]

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
            data:results,
            message:"Data Inserted Successfully"
          }
          res.writeHead(200,{"Content-Type":"application/json"});
          res.end(JSON.stringify(medicine));
        
  
        })
      
  });
 
   
  // Attribut Apis
  router.post('/apiaddAttribute', function(req, res, next) {
    
    
  var returnresult = [];
  var key = '';
  var sql = 'SELECT * FROM attribute where att_position=0';
  con.query(sql,async function (err, data, fields) {
    if (err) throw err;
    var sql1 = 'SELECT * FROM attribute where status=0 and isparent=0';
    con.query(sql1,async function (err1, data1, fields1) {
      if (err) throw err;
      myarray=[];
      var i=0;
      data1.map(async mapdata => {  
        var sql1 = 'SELECT * FROM attribute where isparent='+mapdata.att_id;
         con.query(sql1, function (err1, mydata, fields1) {
            if (err) throw err;
                      
          var myjson={
            "parent_detail":mapdata,
            "child_detail":mydata
          }
          returnresult[i]=myjson; 
          i++;
        });
      })
      
      await new Promise(r => setTimeout(r, 200));
      console.log('arrayt='+JSON.stringify(returnresult));
      
      var sql2 = 'SELECT * FROM category_master';
      con.query(sql2, function (err2, data3, fields2) {
        if (err2) throw err2;
        var sql3 = 'SELECT * FROM attribute_data';
        con.query(sql3, function (err1, data4, fields4) {
          if (err) throw err;

          
          
            const user={
              status:true,
              attributesData:data4,
              attributesView:returnresult,
              category:data3,
              message:"No Banner Found"+err
            }
            res.writeHead(200,{"Content-Type":"application/json"});
                res.end(JSON.stringify(user));
            
         
        });
      });
    });
  });

  });

  


  // Banner Apis
  router.post('/apibannerList', function(req, res, next) {
    var sql='SELECT * FROM category_master';
     con.query(sql, function (err, data, fields) {
    
      // var sql1='select * from category_master inner join banner_master on category_master.cat_id= where banner_master.banner_status=0';
    var sql1='SELECT * FROM banner_master where banner_status=0';
     con.query(sql1, function (err1, data1, fields1) {
      if (err1) throw err1;
      if (data1.length <= 0) {
        const user={
          status:false,
          data:[],
          message:"No Banner Found"+err1
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
});
 
  // Product Apis
  router.post('/apipoductbycatId', function(req, res, next) {
  const data=req.body.id;
  var sql1='select * from medicine inner join vendor_product on medicine.id=vendor_product.medicine_id where medicine.category='+data;
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
  router.post('/apipoductbyproId', function(req, res, next) {
    const data=req.body.id;
    const cat_data=req.body.cat_id;
 
    var sql1='select * from medicine inner join vendor_product on medicine.id=vendor_product.medicine_id where vendor_product.vp_id='+data;
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
   router.post('/apigetallproduct', function(req, res, next) {
  
    var sql1='select * from medicine inner join vendor_product on medicine.id=vendor_product.medicine_id  WHERE medicine.status=0';
    con.query(sql1, function (err1, data1, fields1) {
     if (err1) throw err1;
     if (data1.length <= 0) {

       const user={
         status:false,
         data:[],
         message:"No Medicine Found"
       }
       res.writeHead(200,{"Content-Type":"application/json"});
           res.end(JSON.stringify(user));
       }
       else{
         const user={
           status:true,
           data:data1,
           message:"Find Successfully"
         }
         res.writeHead(200,{"Content-Type":"application/json"});
             res.end(JSON.stringify(user));
       }
  });
  });

  // Remove karna
  router.post('/apiallproduct', function(req, res, next) {
  
    var sql1='select * from medicine  WHERE status=0';
    con.query(sql1, function (err1, data1, fields1) {
     if (err1) throw err1;
     if (data1.length <= 0) {
       const user={
         status:false,
         data:[],
         message:"No Medicine Found"
       }
       res.writeHead(200,{"Content-Type":"application/json"});
           res.end(JSON.stringify(user));
       }
       else{
         const user={
           status:true,
           data:data1,
           message:"Find Successfully"
         }
         res.writeHead(200,{"Content-Type":"application/json"});
             res.end(JSON.stringify(user));
       }
  });
  });


  // Category Apis
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

  // Order Apis
  router.post('/apiorder', function (req,res){
  //  sessions = req.session;
try{
  const vendor_id=req.body.vendor_id;
  const user_id= req.body.user_id;
  const order_id=req.body.id;
  const address=req.body.address;
  const product=req.body.products;
  const order_status=req.body.status;
  const coupon_code=req.body.Coupon_code;
  const note=req.body.note;
  const delivery_charges=req.body.delivery_charges;
  const total_amount =req.body.amount;
  const order_date_time=req.body.order_date;
  const payment_status=req.body.payment_status
  const payment_mode=req.body.payment_mode;

  const insertQuery = "INSERT INTO order_master (vendor_id,userid,order_id,address,product,order_status,coupon_code,note,delivery_charges,total_amount,order_date,payment_status,payment_mode) VALUES ? ";
  const values =[[vendor_id,user_id,order_id,address,JSON.stringify(product),order_status,coupon_code,note,delivery_charges,total_amount,order_date_time,payment_status,payment_mode]]
  console.log("values="+insertQuery);
  
  console.log("values="+JSON.stringify(values));
  con.query(insertQuery,[values],(err,results,fields)=>{
    if(err){
      const order={
        status:false,
        data:[],
        message:"Order Faild"+err
      }
      res.writeHead(200,{"Content-Type":"application/json"});
          res.end(JSON.stringify(order));
    }
    const order={
      status:true,
      data:results,
      message:"Order Receive"
    }
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(order)); 
  })
  // res.end();
}catch(ex){

  const order={
    status:false,
    data:[],
    message:"Order Faild"+ex.toString()
  }
  res.writeHead(200,{"Content-Type":"application/json"});
      res.end(JSON.stringify(order));
}


  });
  router.post('/apiordergetmobile', function(req,res){
  const user_id=req.body.user_id;
  var sql1='SELECT * FROM order_master WHERE userid ='+user_id;
  con.query(sql1, function (err1, result, fields1) {
   if (err1) throw err1;
   if (result.length <= 0) {
     const user={
       status:false,
       data:[],
       message:"No User Found"
     }
     res.writeHead(200,{"Content-Type":"application/json"});
         res.end(JSON.stringify(user));
     }
     else{
       const user={
         status:true,
         data:result,
         message:"Yes user Gotted"
       }
       res.writeHead(200,{"Content-Type":"application/json"});
           res.end(JSON.stringify(user));
     }
});
  });

// Made By Sir
  router.post('/apiupdatestatus', function(req,res){
  const order_status=req.body.order_status;
  const order_id=req.body.order_id;
  var sql="UPDATE order_master SET order_status='"+order_status+"'  where id ="+order_id;
console.log(sql);
  con.query(sql, function (err1, result, fields1) {
    if (err1) 
     {
      const order={
        status:false,
        data:[],
        message:"Some Error Ocure"+err1
      }
      res.writeHead(200,{"Content-Type":"application/json"});
          res.end(JSON.stringify(order));
          console.log("err"+err1);
      }
      else{
        const order={
          status:true,
          data:result,
          message:"Update Successfully"
        }
        res.writeHead(200,{"Content-Type":"application/json"});
            res.end(JSON.stringify(order));
      }
 });
  });


  

// Api Address Made By ayush
router.post('/apiaddress', function(req,res){
  
  //  sessions = req.session;
  // if (req.session.loggedin) {
  console.log(JSON.stringify(req.file))
  const user_id= req.body.user_id;
  const address=req.body.address;
  
  const	letlong=req.body.letlong;
  const title=req.body.title;
  
  // const deliveryboy_address=req.body.deliveryboy_address;

  const insertQuery = "INSERT INTO address (user_id,address,letlong,title) VALUES ? ";
  const values =[[user_id,address,letlong,title]]
  con.query(insertQuery,[values],(err,results,fields)=>{
    if (err) {
      const address={
        status:false,
        data:[],
        message:"Data Not inserted"+err
      }
      res.writeHead(200,{"Content-Type":"application/json"});
      res.end(JSON.stringify(address));   
    }
    const address={
      status:true,
      data:results,
      message:"Data Inserted Successfully"
    }
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(address));
  })
  // res.end();
// } else {
//   req.flash('success', 'Please login first!');
//   res.redirect('/');
// }

});

router.post('/apigetaddress', function(req,res){
  const user_id=req.body.user_id;
  var sql1='SELECT * FROM address WHERE user_id ='+user_id;
  con.query(sql1, function (err1, result, fields1) {
   if (err1) throw err1;
   if (result.length <= 0) {
     const user={
       status:false,
       data:[],
       message:"No User Found"
     }
     res.writeHead(200,{"Content-Type":"application/json"});
         res.end(JSON.stringify(user));
     }
     else{
       const user={
         status:true,
         data:result,
         message:"Yes user Gotted"
       }
       res.writeHead(200,{"Content-Type":"application/json"});
           res.end(JSON.stringify(user));
     }
});

});


router.post('/apideleteaddress', function(req, res, next) {
  // if (req.session.loggedin) {
  var sql='DELETE FROM address where id='+req.body.user_id;
 con.query(sql, function (err, data, fields) {
  if (err) {
    const user={
      status:false,
      data:[],
      message:"Data Not Deleted"
    }
    res.writeHead(200,{"Content-Type":"application/json"});
        res.end(JSON.stringify(user));
    }
    else{
      const user={
        status:true,
        data:data,
        message:"Data Deleted Successfully"
      }
      res.writeHead(200,{"Content-Type":"application/json"});
          res.end(JSON.stringify(user));
    }
});
// } else {
//   req.flash('success', 'Please login first!');
//   res.redirect('/');
// }
});




//Add Vendor Product Api-> Apiaddvendorproduct and apiupdatevendormedicine made by  ayush
router.post('/apiaddvendorproduct', function(req,res){
  
  var sql2='select * from medicine inner join vendor_product on medicine.id=vendor_product.medicine_id';
  // con.query(sql2, function (err2, data2, fields2) {
  //   if(err)throw(err);
  //  sessions = req.session;
  // if (req.session.loggedin) {
  console.log(JSON.stringify(req.file))
  const medicine_id= req.body.medicine_id;
  const quantity=req.body.quantity;
  
  const	amount=req.body.amount;
  const detail=req.body.detail;
  const vendor_id=req.body.vendor_id;
  
  // const deliveryboy_address=req.body.deliveryboy_address;

  const insertQuery = "INSERT INTO vendor_product (medicine_id,quantity,amount,detail,vendor_id) VALUES ? ";
  const values =[[medicine_id,quantity,amount,detail,vendor_id]]
  con.query(insertQuery,[values],(err,results,fields)=>{
    if (err) {
      const addvendor={
        status:false,
        data:[],
        message:"Data Not inserted"+err
      }
      res.writeHead(200,{"Content-Type":"application/json"});
      res.end(JSON.stringify(addvendor));   
    }
    const addvendor={
      status:true,
      data:results,
      message:"Data Inserted Successfully"
    }
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(addvendor));
  })
  // res.end();
// } else {
//   req.flash('success', 'Please login first!');
//   res.redirect('/');
// }
});
// });
  
router.post('/apiupdatevendormedicine', function(req, res, next) {
  
  const medicine_id= req.body.medicine_id;
  const quantity=req.body.quantity;
  
  const	amount=req.body.amount;
  const detail=req.body.detail;
  const vendor_id=req.body.vendor_id;
   
  const insertQuery = "Update  vendor_product set medicine_id=?,quantity=?,amount=?,detail=?,vendor_id=? WHERE vp_id="+req.body.vp_id;
  const values =[medicine_id,quantity,amount,detail,vendor_id,req.body.vp_id]
  con.query(insertQuery,values,(err,results,fields)=>{
    if(err){
     const vendor={
       status:true,
       data:[],
       message:"Data Not Updated"+err
     }
     res.writeHead(200,{"Content-Type":"application/json"});
     res.end(JSON.stringify(vendor));
   
   }    
       const vendor={
         status:true,
         data:results,
         message:"Data Updated Successfully"
       }
       res.writeHead(200,{"Content-Type":"application/json"});
       res.end(JSON.stringify(vendor));
    
   });
 
   });
 
router.post('/apilistvendorproduct', function(req, res, next) {
  var sql2='select * from medicine inner join vendor_product on medicine.id=vendor_product.medicine_id where vendor_product.vendor_id='+req.body.id;
  con.query(sql2, function (err2, data2, fields2) {
   
  if (err2) {
    const listvendordata={
      status:false,
      data:[],
      message:"Data Not Find=>"+err2
    }
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(listvendordata));
  }
  else{
    const listvendordata={
      status:true,
      data:data2,
      message:"Data Find Successfully"
    }
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(listvendordata));     
  }
});

}); 

//api for vendor orders Made By Sir 

router.post('/vendororderlist', function(req, res, next) {
   var sql1='SELECT *,registration.name as v_name FROM order_master inner join user on user.id=order_master.userid inner join registration on registration.id=order_master.vendor_id  where order_master.vendor_id='+req.body.id;
  // var sql1='SELECT *,registration.name as v_name FROM order_master inner join user on user.id=order_master.userid inner join registration on registration.id=order_master.vendor_id  where order_master.id='+req.body.id;
  con.query(sql1, function (err1, data1, fields1) {
    if (err1) {
   
    const listvendordata={
      status:false,
      data:[],
      message:"Data Not Find=>"+err1
    }
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(listvendordata));
 
} else {
  const listvendordata={
    status:true,
    data:data1,
    message:"Data Find Successfully"
  }
  res.writeHead(200,{"Content-Type":"application/json"});
  res.end(JSON.stringify(listvendordata));
}

});
});

// Api Update Mobile Number Made by ayush
router.post('/apiupdatemobilenumber', function(req, res, next) {
  // if (req.session.loggedin) {
 const mobile= req.body.mobile;
 
//const cpassword= req.body.cpassword;
  
 const insertQuery = "Update  registration set mobile=? WHERE id = "+req.body.id;
 const values =[mobile,req.body.id]
 con.query(insertQuery,values,(err,results,fields)=>{
  if (err) 
  {
   const mobile={
     status:false,
     data:[],
     message:"Some Error Ocure"+err1
   }
   res.writeHead(200,{"Content-Type":"application/json"});
       res.end(JSON.stringify(mobile));
       console.log("err"+err1);
   }
   else{
     const mobile={
       status:true,
       data:results,
       message:"Update Mobile Number Successfully"
     }
     res.writeHead(200,{"Content-Type":"application/json"});
         res.end(JSON.stringify(mobile));
   }
    
  });
// } else {
//   req.flash('success', 'Please login first!');
//   res.redirect('/');
// }
});

//Update Password Made by ayush

router.post('/apiupdatepassword', function(req, res, next) {
  // if (req.session.loggedin) {
 const password=bcrypt.hashSync(req.body.password, 10);
 
//const cpassword= req.body.cpassword;
  
 const insertQuery = "Update  registration set password=? WHERE id = "+req.body.id;
 const values =[password,req.body.id]
 con.query(insertQuery,values,(err,results,fields)=>{
  if (err) 
  {
   const mobile={
     status:false,
     data:[],
     message:"Some Error Ocure"+err1
   }
   res.writeHead(200,{"Content-Type":"application/json"});
       res.end(JSON.stringify(mobile));
       console.log("err"+err1);
   }
   else{
     const mobile={
       status:true,
       data:results,
       message:"Update Password Successfully"
     }
     res.writeHead(200,{"Content-Type":"application/json"});
         res.end(JSON.stringify(mobile));
   }
    
  });
// } else {
//   req.flash('success', 'Please login first!');
//   res.redirect('/');
// }
});

//Promotional-Banner Made by ayush

router.post('/apigetallpromotionalproduct', function(req, res, next) {
  // var sql2='select * from medicine inner join vendor_medicine on medicine.id=medicine.vendor_medicine where vendor_medicine.vendor_id='+req.body.id;
  var sql2='SELECT * FROM promotional_banner  INNER JOIN medicine ON FIND_IN_SET(medicine.id,promotional_banner.products) != 0 INNER JOIN vendor_product ON  FIND_IN_SET(vendor_product.medicine_id,promotional_banner.products) != 0  WHERE promotional_banner.id='+req.body.id;
  // var sql2='SELECT * FROM promotional_banner  INNER JOIN medicine ON FIND_IN_SET(medicine.id,promotional_banner.products) != 0 WHERE vendor_product ='+req.body.id;
  con.query(sql2, function (err2, data2, fields2) {
   
  if (err2) {
    const listdata={
      status:false,
      data:[],
      message:"Data Not Find=>"+err2
    }
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(listdata));
  }
  else{
    const listdata={
      status:true,
      data:data2,
      message:"Data Find Successfully"
    }
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(listdata));     
  }
});
}); 

router.post('/apigetallpromotionalbanner', function(req, res, next) {
  
  // var sql2='select * from medicine inner join vendor_medicine on medicine.id=medicine.vendor_medicine where vendor_medicine.vendor_id='+req.body.id;
  var sql2='SELECT * FROM promotional_banner where status=0';
  con.query(sql2, function (err2, data2, fields2) {
   
  if (err2) {
    const listdata={
      status:false,
      data:[],
      message:"Banner Not Found=>"+err2
    }
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(listdata));
  }
  else{
    const listdata={
      status:true,
      data:data2,
      message:"Banner Find Successfully"
    }
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(listdata));     
  }
});
}); 

router.post('/apigetalldeliveryboy', function(req, res, next) {
  
  // var sql2='select * from medicine inner join vendor_medicine on medicine.id=medicine.vendor_medicine where vendor_medicine.vendor_id='+req.body.id;
  var sql2='SELECT * FROM delivery_master';
  con.query(sql2, function (err2, data2, fields2) {
   
  if (err2) {
    const delivery={
      status:false,
      data:[],
      message:"Data Note Found=>"+err2
    }
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(delivery));
  }
  else{
    const delivery={
      status:true,
      data:data2,
      message:"Delivery Boy Data Find Successfully"
    }
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(delivery));     
  }
});
}); 



// router.post('/apigetallpromotionalproduct', function(req, res, next) {
  
  
//   var sql2='SELECT * FROM promotional_banner  INNER JOIN medicine on promotional_banner.product ';
//   con.query(sql2, function (err2, data2, fields2) {
   
//   if (err2) {
//     const listdata={
//       status:false,
//       data:[],
//       message:"Data Not Find=>"+err2
//     }
//     res.writeHead(200,{"Content-Type":"application/json"});
//     res.end(JSON.stringify(listdata));
//   }
//   else{
//     const listdata={
//       status:true,
//       data:data2,
//       message:"Data Find Successfully"
//     }
//     res.writeHead(200,{"Content-Type":"application/json"});
//     res.end(JSON.stringify(listdata));     
//   }
// });
// }); 



//Profile Api




//Random Number Genretor Api


// router.post('/randomnumber',function(req,res,next){
//   var err=err;
// function makeid(length) {
//   var result           = '';
//   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   var charactersLength = characters.length;
//   for ( var i = 0; i < length; i++ ) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
    
// }
// if(err){
//   const randomdata={
//     status:false,
//     Number:[],
//     message:"Some Error=>"+err
//   }
//   res.writeHead(200,{"Content-Type":"application/json"});
//   res.end(JSON.stringify(randomdata));

// }
// else {
//   const data={
//     status:true,
//     Number:result,
  
//   }
//   res.writeHead(200,{"Content-Type":"application/json"});
//   res.end(JSON.stringify(data));
  
// }

//  return result;
// }

// console.log(makeid(12));
// })
module.exports=router;


