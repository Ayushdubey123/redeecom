const express = require('express');
const path = require('path');
const mysql = require('mysql');
const flash = require('connect-flash');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const multer  = require('multer');
const { futimesSync } = require('fs');
const { count } = require('console');

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
  if(err)throw err;
  console.log("Connection created...!!");
});
// router.get('/',admincontroller);




router.get('/', function(req, res, next) {
  res.render('Login');
});
router.post('/', function(req, res) {
  const username=req.body.username;
  const password=req.body.password;
  con.query("select * from admin where username = ? and password = ?",[username,password],function(err,results,fields){
    console.log(username);
    console.log(password);
   
    if(results.length > 0){
      res.redirect("/adminDashboard");
    }else{
      res.redirect("/");
    }
    res.end();
  })

});



router.get('/adminDashboard', function(req, res, next) {
  var sql='SELECT * FROM attribute where att_position=0';
  con.query(sql, function (err, data, fields) {
   if (err) throw err;
   res.render('adminDashboard', {Sidebar: data});
 });
 
}); 





//AttributesData created By Kuldeep singh



router.get('/AttributesData' , function(req, res, next) {

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
 
});



router.post('/AttributesDatasave', upload.single('image'),(req,res)=>{
  //  sessions = req.session;
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
   // req.session.message('success','Data is Inserted');
    // res.locals.message = req.flash();
    //res.end();
   
     return  res.redirect("AttributesData?id="+req.query.id);
     
    
     //console.log("Data Inserted Succcessfuly");
    //return res.status(200).json({success: 'Insert row success'});
 
  })
  // res.end();


});
router.get('/AttributeEdit', function(req, res, next) {
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
});
router.post('/AttributesDataupdate', upload.single('image'),(req,res)=>{
  //  sessions = req.session;
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


});

router.get('/AttributeDelete', function(req, res, next) {
  var sql='DELETE FROM attribute_data where id='+req.query.id;
 con.query(sql, function (err, data, fields) {
  if (err) throw err;

  req.flash('message','Data Delete Successfully');

  return  res.redirect("AttributesData?id="+req.query.att_id);
});

});
router.get('/Attribute_AddAttribute', function(req, res, next) {
  var sql='SELECT * FROM attribute where att_position=0';
  con.query(sql, function (err, data, fields) {
   if (err) throw err; 
   res.render('Attribute_AddAttribute',{message : req.flash('message'),Sidebar:data});
  
});
});



router.post('/addattribute', (req,res)=>{
  //  sessions = req.session;
  console.log(JSON.stringify(req.file))
  const name= req.body.name;
  const type=req.body.type;
  const position=req.body.position;
  const number=req.body.number;
  const isparent=req.body.isparent;
  const key_name=name.replace(/\s/g, '');
  const insertQuery = "INSERT INTO attribute (att_name,att_type,att_position,att_number,isparent,key_name) VALUES ? ";
  const values =[[name,type,position,number,isparent,key_name]]
  con.query(insertQuery,[values],(err,results,fields)=>{
    if(err){
      console.log('filed to insert',err);
      res.sendStatus(500)
      return;
    }
    console.log('Inserted new User :',results)
    req.flash('message','Data Inserted Successfully');  
     return  res.redirect("Attribute_AddAttribute");
  })
});


router.get('/Attribute_ListAttribute', function(req, res, next) {
  var sql='SELECT * FROM attribute where att_position=0';
  con.query(sql, function (err, data, fields) {
   if (err) throw err; 
   res.render('Attribute_ListAttribute',{message : req.flash('message'),Sidebar:data});
  
});
});
router.get('/Attribute_EditAttribute', function(req, res, next) {
  var sql='SELECT * FROM attribute where att_position=0';
  con.query(sql, function (err, data, fields) {
   if (err) throw err; 
   res.render('Attribute_EditAttribute',{message : req.flash('message'),Sidebar:data});
  
});
});

async function attributes () {
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
}



router.get('/Medicine_AddMedicine',async(req, res, next) =>{
  var returnresult={};
  var key='';
  var sql='SELECT * FROM attribute where att_position=0';
  con.query(sql, function (err, data, fields) {
   if (err) throw err; 
   var sql1='SELECT * FROM attribute where status=0';
   con.query(sql1, function (err1, data1, fields1) {
    if (err) throw err; 
   var sql2='SELECT * FROM category_master';
   con.query(sql2, function (err2, data3, fields2) {
    if (err2) throw err2;
    var sql3='SELECT * FROM attribute_data';
    con.query(sql3, function (err1, data4, fields4) {
     if (err) throw err; 
   res.render('Medicine_AddMedicine',{message : req.flash('message'),Sidebar:data,catdata:data3,attributes:data1,attributesData:data4});
    
  });  
});  
});
});
router.post('/addmedicine', upload.single('image'),(req,res)=>{
  //  sessions = req.session;
var attribute_detail={};
  var sql='SELECT * FROM attribute where att_position=0';
  con.query(sql, function (err, data, fields) {

    data.forEach(function(data){
      attribute_detail[data.key_name]=req.body[data.key_name]

    });

console.log(JSON.stringify(attribute_detail))

  console.log(JSON.stringify(req.file))
  var instockdata=0;
  var statusdata=0;
  const image=req.file.path;
  const name= req.body.name;

  
  const instock=req.body.instock;
  if(instock=='0')
  {
    instockdata=0
  }else{
    instockdata=1
  }
  const status=req.body.status;
  if(status=='0')
  {
    statusdata=0
  }else{
    statusdata=1
  }
  const price=req.body.price;
  const category=req.body.category;
  
  const insertQuery = "INSERT INTO medicine (image,name,instock,status,price,category,attribute_details) VALUES ? ";
  const values =[[image,name,instockdata,statusdata,price,category,JSON.stringify(attribute_detail)]]
  con.query(insertQuery,[values],(err,results,fields)=>{
    if(err){
      console.log('filed to insert',err);
      res.sendStatus(500)
      return;
    }
    console.log('Inserted new User :',results)
    req.flash('message','Data Inserted Successfully');

     return  res.redirect("Medicine_AddMedicine");

  })

  });

});

router.get('/Medicine_ListMedicine', function(req, res, next) {
  var sql='SELECT * FROM attribute where att_position=0';
  con.query(sql, function (err, data, fields) {
   if (err) throw err; 
   var sql1='SELECT * FROM medicine';
   con.query(sql1, function (err1, data1, fields1) {
    if (err1) throw err1;

   console.log(JSON.stringify(data))
   res.render('Medicine_ListMedicine',{ListData: data1,message : req.flash('message'),Sidebar:data});

 });
});
});
});
router.get('/Medicine_EditMedicine', function(req, res, next) {
  var sql='SELECT * FROM attribute where att_position=0';
  con.query(sql, function (err, data, fields) {
   if (err) throw err; 
   var sql1='SELECT * FROM medicine where id='+req.query.id;
   con.query(sql1, function (err1, data1, fields1) {
    if (err1) throw err1;
    var sql2='SELECT * FROM category_master';
    con.query(sql2, function (err2, data2, fields2) {
     if (err2) throw err2;
    res.render('Medicine_EditMedicine', { ListData: data1,Sidebar:data,catdata:data2});
  });
});
});
});

router.post('/MedicineUpdate', upload.single('image'),(req,res)=>{
  //  sessions = req.session;
  console.log(JSON.stringify(req.file))
  
  const name= req.body.name;
  const instock=req.body.instock;
  const status=req.body.status;
  const price=req.body.price;
  const category=req.body.category;
 
if(req.file!=null){
  const image=req.file.path;


  const insertQuery = "Update medicine set image=?,name=?,instock=?,status=?,price=?,category=?  WHERE id = ? ";
  const values =[image,name,instock,status,price,category,req.query.id]
  con.query(insertQuery,values,(err,results,fields)=>{
    if(err){
      console.log('filed to update',err);
      res.sendStatus(500)
      return;
    }
    console.log('Inserted new User :',results)
    req.flash('message','Data Updated Successfully');
     return  res.redirect("Medicine_ListMedicine");

  })
}else{
  const insertQuery = "Update  medicine set name=?,instock=?,status=?,price=?,category=?  WHERE id = ? ";
  const values =[name,instock,status,price,category,req.query.id]
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
   
     return  res.redirect("Medicine_ListMedicine");

  })
}

});

router.get('/MedicineDelete', function(req, res, next) {
  var sql='DELETE FROM medicine where id='+req.query.id;
 con.query(sql, function (err, data, fields) {
  if (err) throw err;
  req.flash('message','Data Delete Successfully');
  return  res.redirect("Medicine_ListMedicine");
});
});



router.get('/Banner_AddBanner', function(req, res, next) {
  res.render('Banner_AddBanner');
});
router.get('/Banner_ListBanner', function(req, res, next) {
  res.render('Banner_ListBanner');
});
router.get('/Banner_EditBanner', function(req, res, next) {
  res.render('Banner_EditBanner');
});


router.get('/DeliveryBoy_AddDeliveryBoy', function(req, res, next) {
  var sql='SELECT * FROM attribute where att_position=0';
  con.query(sql, function (err, data, fields) {
   if (err) throw err;
   res.render('DeliveryBoy_AddDeliveryBoy',{message : req.flash('message'),Sidebar:data});
});
});


router.post('/addDelivery', upload.single('image'),(req,res)=>{
  //  sessions = req.session;
  console.log(JSON.stringify(req.file))
  const delivery_name= req.body.delivery_name;
  const mobile_no=req.body.mobile_no;
  
  const delivery_email=req.body.delivery_email;
  const delivery_password=req.body.delivery_password;
  const delivery_status=req.body.delivery_status;
  const delivery_commission=req.body.delivery_commission;
  const deliveryboy_address=req.body.deliveryboy_address;

  const insertQuery = "INSERT INTO delivery_master (delivery_name,mobile_no,delivery_email,delivery_password,delivery_status,delivery_commission,deliveryboy_address) VALUES ? ";
  const values =[[delivery_name,mobile_no,delivery_email,delivery_password,delivery_status,delivery_commission,deliveryboy_address]]
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


});

router.get('/DeliveryBoylist', function(req, res, next) {
  var sql='SELECT * FROM attribute where att_position=0';
  con.query(sql, function (err, data, fields) {
   if (err) throw err;
   var sql1='SELECT * FROM delivery_master';
   con.query(sql1, function (err1, data1, fields1) {
    if (err1) throw err1;
   console.log(JSON.stringify(data1))
   res.render('DeliveryBoy_ListDeliveryBoy',{ListData: data1,message : req.flash('message'),Sidebar:data});

 });
});
});






router.get('/User_Customer', function(req, res, next) {
  res.render('User_Customer');
});

router.get('/AddressList', function(req, res, next) {
  res.render('AddressList');
});

router.get('/PendingOrder', function(req, res, next) {
  res.render('PendingOrder');
});
router.get('/PopupPage', function(req, res, next) {
  res.render('PopupPage');
});



router.get('/CompleteOrder', function(req, res, next) {
  res.render('CompleteOrder');
});
router.get('/CancelledOrder', function(req, res, next) {
  res.render('CancelledOrder');
});

router.get('/register', function(req, res, next) {
  res.render('registration');
});

router.post('/register', function(req, res, next) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const cpassword = req.body.cpassword;

    con.query('SELECT email FROM registration WHERE email = ?',[email],(error,results)=>{
      if(error){
        console.log(error);
      }
    if(result.length > 0){
      return res.render('registration',{
        message:'That email is already in use'
      })
    }else if(password !== cpassword){
      return res.render('registration',{
        message:'Password do not match'
    })
  }

    })
});

module.exports = router;
