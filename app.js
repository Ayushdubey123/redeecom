<<<<<<< HEAD

=======
let cors = require('cors');
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31
var createError = require('http-errors');
const express = require('express');
const path = require('path');
const mysql = require("mysql");
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const multer  = require('multer')


const indexRouter = require('./routes/index');
const categoryRouter = require('./routes/category');
<<<<<<< HEAD
const registerRouter = require('./routes/register');
const medicineRouter = require('./routes/medicine');
const attributeRouter = require('./routes/attribute');
const deliveryeRouter = require('./routes/delivery');
const bannerRouter = require('./routes/banner');
const usersRouter = require('./routes/usersRegistration');
const apiRouter = require('./routes/api');
=======
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31


require('dotenv').config();
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
<<<<<<< HEAD


=======
app.use(express.json());
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended:false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/', categoryRouter);
<<<<<<< HEAD
app.use('/', registerRouter);
app.use('/', medicineRouter);
app.use('/', attributeRouter);
app.use('/', deliveryeRouter);
app.use('/', bannerRouter);
app.use('/', usersRouter);
app.use('/', apiRouter);
=======
>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31






<<<<<<< HEAD
=======
// app.post("/login",async(req,res)=>{
//   try{
//       const email="ayush123@gmail.com";
//       const password="1234";

//       console.log(`${email} and password is ${password}`);

//   }catch(error){
//     res.status(400).send("invali email");
//   }
// })



//   //All Routes//

// app.get('/adminDashboard', function(req, res, next) {
  
//   res.render('adminDashboard');
// }); 


// app.get('/Category_AddCategory', function(req, res, next) {
//   res.render('Category_AddCategory');
// });
// app.get('/Category_ListCategory', function(req, res, next) {
//   res.render('Category_ListCategory');
// });
// app.get('/Category_EditCategory', function(req, res, next) {
//   res.render('Category_EditCategory');
// });


// app.get('/Generic_AddGeneric', function(req, res, next) {
//   res.render('Generic_AddGeneric');
// });
// app.get('/Generic_ListGeneric', function(req, res, next) {
//   res.render('Generic_ListGeneric');
// });
// app.get('/Generic_EditGeneric', function(req, res, next) {
//   res.render('Generic_EditGeneric');
// });

// app.get('/Medicine_AddMedicine', function(req, res, next) {
//   res.render('Medicine_AddMedicine');
// });
// app.get('/Medicine_ListMedicine', function(req, res, next) {
//   res.render('Medicine_ListMedicine');
// });
// app.get('/Medicine_EditMedicine', function(req, res, next) {
//   res.render('Medicine_EditMedicine');
// });


// app.get('/Attribute_AddAttribute', function(req, res, next) {
//   res.render('Attribute_AddAttribute');
// });
// app.get('/Attribute_ListAttribute', function(req, res, next) {
//   res.render('Attribute_ListAttribute');
// });
// app.get('/Attribute_EditAttribute', function(req, res, next) {
//   res.render('Attribute_EditAttribute');
// });



// app.get('/Company_AddCompany', function(req, res, next) {
//   res.render('Company_AddCompany');
// });
// app.get('/Company_ListCompany', function(req, res, next) {
//   res.render('Company_ListCompany');
// });
// app.get('/Company_EditCompany', function(req, res, next) {
//   res.render('Company_EditCompany');
// });


// app.get('/Banner_AddBanner', function(req, res, next) {
//   res.render('Banner_AddBanner');
// });
// app.get('/Banner_ListBanner', function(req, res, next) {
//   res.render('Banner_ListBanner');
// });
// app.get('/Banner_EditBanner', function(req, res, next) {
//   res.render('Banner_EditBanner');
// });


// app.get('/DeliveryBoy_AddDeliveryBoy', function(req, res, next) {
//   res.render('DeliveryBoy_AddDeliveryBoy');
// });
// app.get('/DeliveryBoy_ListDeliveryBoy', function(req, res, next) {
//   res.render('DeliveryBoy_ListDeliveryBoy');
// });

// app.get('/User_Customer', function(req, res, next) {
//   res.render('User_Customer');
// });

// app.get('/AddressList', function(req, res, next) {
//   res.render('AddressList');
// });

// app.get('/PendingOrder', function(req, res, next) {
//   res.render('PendingOrder');
// });
// app.get('/PopupPage', function(req, res, next) {
//   res.render('PopupPage');
// });



// app.get('/CompleteOrder', function(req, res, next) {
//   res.render('CompleteOrder');
// });
// app.get('/CancelledOrder', function(req, res, next) {
//   res.render('CancelledOrder');
// });


>>>>>>> b2018b207f7b3a8f061ba179d0dbde820d16cf31



module.exports = app;
