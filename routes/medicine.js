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
const uploadImage = require('../helpers/helpers')

// const app = require('../app');

const router = express.Router();
//const admincontroller=require("../Controller/admin");
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
router.use(express.json());
router.use(cookieParser());
router.use('/uploads', express.static('uploads'));
// const mysqlconnection=require("../connection");
// router.use('/', admin);
router.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized: true,
  
  resave:true
}));


router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(express.static(path.join(__dirname, 'public')));



const con = mysql.createConnection({
  socketPath: '/cloudsql/redeecom:us-central1:myredeemocomdbinstrance',
   user:"root",
   password:"Ksingh@9825",
   database:"redeecomdb",
 });

// const con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "redeecom",
//   multipleStatements: true
// });

// con.connect((err) => {
//   if (err) throw err;
//   console.log("");
// });
// router.get('/',admincontroller);






router.get('/Medicine_AddMedicine', async (req, res, next) => {
  if (req.session.loggedin) {
  var returnresult = [];
  var key = '';

  var sql6 = 'SELECT * FROM medicine where category='+req.query.id;
  con.query(sql6,function (err6, data6, fields6) {
    if (err6) throw err6;
    var cat=req.query.id;      

    var sql1 = 'SELECT * FROM attribute where status=0 and isparent=0';
    con.query(sql1,async function (err1, data1, fields1) {
      if (err1) throw er1;
      
      myarray=[];
      var i=0;
      data1.map(async mapdata => {  
        var sql1 = 'SELECT * FROM attribute where isparent='+mapdata.att_id;
         con.query(sql1, function (err1, mydata, fields1) {
            if (err1) throw err1;
                      
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
        con.query(sql3, function (err3, data4, fields4) {
          if (err3) throw err3;

          res.render('Medicine_AddMedicine', { message: req.flash('message'), catdata: data3, attributes: returnresult, attributesData:data4,data:data6,newdata:cat});

        });
      });
    });
   });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
 });




router.post('/addmedicine', upload.single('image'),(req, res) => {

  //  sessions = req.session;
  if (req.session.loggedin) {
    var attribute_detail = {};
    var sql = 'SELECT * FROM attribute where status=0 ';
    con.query(sql, async function (err, data, fields){
      data.forEach(function (data) {
        attribute_detail[data.key_name] = req.body[data.key_name]
      });

      console.log(JSON.stringify(attribute_detail))

      console.log(JSON.stringify(req.file))
      var instockdata = 0;
      var statusdata = 0;
     
      const myFile = req.file
      const imageUrl = await uploadImage(myFile)
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
      const category = req.query.id;

      const insertQuery = "INSERT INTO medicine (image,name,instock,status,price,category,attribute_details) VALUES ? ";
      const values = [[imageUrl, name, instockdata, statusdata, price, category, JSON.stringify(attribute_detail)]]
      console.log(JSON.stringify(values));
      con.query(insertQuery, [values], (err, results, fields) => {
        if (err) {
          console.log('filed to insert', err);
          res.sendStatus(500)
          return;
        }
        console.log('Inserted new User :', results)
        req.flash('message', 'Data Inserted Successfully');

        return res.redirect("Medicine_ListMedicine?id="+req.query.id);

      })

    });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
 
});



router.get('/Medicine_ListMedicine', function (req, res, next) {
  if (req.session.loggedin) {

  var sql = 'SELECT * FROM attribute where att_position=0';
  con.query(sql, function (err, data, fields) {
    if (err) throw err;
    var sql1 = 'SELECT * FROM medicine inner join category_master on category_master.cat_id=medicine.category where category='+req.query.id;
    con.query(sql1, function (err1, data1, fields1) {
      if (err1) throw err1;
      var sql2 = 'SELECT * FROM category_master';
      con.query(sql2, function (err2, data2, fields2) {
        if (err2) throw err2;
        // var sql3= 'SELECT * FROM medicine where category='+req.query.id;
        // con.query(sql3, function (err3, data3, fields3) {
        //   if (err3) throw err3;
          var cat=req.query.id;
      console.log(JSON.stringify(data))
      res.render('Medicine_ListMedicine', { ListData: data1, message: req.flash('message'), Sidebar: data ,catdata: data2,newdata:cat});

    // });
  });
  });
});
} else {
  req.flash('success', 'Please login first!');
  res.redirect('/');
}
});

router.get('/Medicine_EditMedicine', function (req, res, next) {
  
  if (req.session.loggedin) {

    var sql6 = 'SELECT * FROM medicine where category='+req.query.id;
    con.query(sql6,function (err6, data6, fields6) {
      if (err6) throw err6;
      var cat=req.query.id;    
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
            var sql4 = 'SELECT * FROM medicine where id ='+req.query.id;
            con.query(sql4, function (err5, list, fields5) {
              if (err5) throw err5;
  
            res.render('Medicine_EditMedicine', { message: req.flash('message'), Sidebar: data, ListData: list,data6:data6,  catdata: data3, attributes: returnresult, attributesData: data4,newdata:req.query.id,cat_data:req.query.cat_id });
            

          });
        });
        });
      });
    });
  });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
});

router.post('/MedicineUpdate', upload.single('image'), async(req, res) => {
  //  sessions = req.session;
  if (req.session.loggedin) {
    if(req.file!=null){

      const myFile = req.file
      const imageUrl = await uploadImage(myFile)
      const image="uploads/"+req.file.filename;
    
    var attribute_detail = {};
    var sql = 'SELECT * FROM attribute where status=0 ';
    con.query(sql, function (err, data, fields) {

      data.forEach(function (data) {
        attribute_detail[data.key_name] = req.body[data.key_name]

      });

      console.log(JSON.stringify(attribute_detail))

      console.log(JSON.stringify(req.file))



      var instockdata = 0;
      var statusdata = 0;
      
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

      const insertQuery = "Update medicine set image=?,name=?,instock=?,status=?,price=?,attribute_details=?  WHERE id = ? ";
      const values = [imageUrl, name, instockdata, statusdata, price,  JSON.stringify(attribute_detail),req.query.id]
      console.log(JSON.stringify(values));
      con.query(insertQuery, values, (err, results, fields) => {
        if (err) {
          console.log('filed to insert', err);
          res.sendStatus(500)
          return;
        }
        console.log('Updated Successfull :', results)
        req.flash('message', 'Data Updated Successfully');

        return res.redirect("Medicine_ListMedicine?id="+req.query.cat_data);

      })

    });
  }else{
    
    
    var attribute_detail = {};
    var sql = 'SELECT * FROM attribute where status=0 ';
    con.query(sql, function (err, data, fields) {

      data.forEach(function (data) {
        attribute_detail[data.key_name] = req.body[data.key_name]

      });

    
      var instockdata = 0;
      var statusdata = 0;
      
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

      const insertQuery = "Update medicine set name=?,instock=?,status=?,price=?,category=?,attribute_details=?  WHERE id = ? ";
      const values = [ name, instockdata, statusdata, price, category, JSON.stringify(attribute_detail),req.query.id]
      console.log(JSON.stringify("datainsertd="+values));
      con.query(insertQuery, values, (err, results, fields) => {
        if (err) {
          console.log('filed to insert', err);
          res.sendStatus(500)
          return;
        }
        console.log('Updated Successfull :', results)
        req.flash('message', 'Data Inserted Successfully');

        return res.redirect("Medicine_ListMedicine");

      })

    });
  
  }

  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
 

});

router.get('/MedicineDelete', function (req, res, next) {
  if (req.session.loggedin) {
    //  const image=req.query.file;
    //  fs.unlinkSync(image);
    var sql = 'DELETE FROM medicine where id=' + req.query.id;
    con.query(sql, function (err, data, fields) {
      if (err) throw err;
      req.flash('message', 'Data Delete Successfully');
      return res.redirect("Medicine_ListMedicine?id="+req.query.cat_id);
    });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('/');
  }
});

module.exports = router;