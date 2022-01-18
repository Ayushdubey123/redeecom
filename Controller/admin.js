// const admin=()=>{
//     alert("Hii");
//     console.log("hello");
//   }
const express = require("express");
const path =require("path");
const  router= require("router");

//   module.exports=admin


router.post("/login",async(req,res)=>{
  try{
      const email=req.body.email;
      const password=req.body.password;

      console.log(`${email} and password is ${password}`);

  }catch(error){
    res.status(400).send("invali email");
  }
})




module.exports=router