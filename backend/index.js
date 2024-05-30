// const express=require("express");
// const mongoose = require('mongoose');

// const app=express();

// const connectDB=async ()=>{
//     mongoose.connect('mongodb://localhost.270717/e-comm');
// }
// const productSchema = new mongoose.Schema({
   
//   });
// const product=mongoose.model("product",productSchema);
//     const data =await product.find();
//     console.log(data);
//     connectDB();
// app.listen(5000);


const express= require("express");
require('./db/config');
const User=require("./db/User");
const cors = require('cors')
const Product=require("./db/Product");

const Jwt = require('jsonwebtoken');
const jwtKey='e-comm';

const app=express();
app.use(cors())

app.use(express.json());

app.post("/register",async (req,resp)=>{
  let user=new User(req.body);
  let result=await user.save();
  result=result.toObject();
  delete result.password;
  resp.send(result);
})

app.post("/login",async (req,resp)=>{
  let user=await User.findOne(req.body).select("-password");
  if(req.body.password && req.body.email){
    if(user){
      Jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
        if(err){
          resp.send({result:"something went wrong,Please try after some time"});
        }
        resp.send({user,auth:token});
      })
     

    }else{
      resp.send({result: "No user Found"});
    }
    
  }
  else{
    resp.send({result: "No user Found"});
  }
 
 
})

app.post("/add-product",async (req,resp)=>{
  let product =new Product(req.body);
  let result = await product.save();
  resp.send(result);

})

app.get("/products",async (req,resp)=>{
  let  products=await Product.find();
  if(products.length>0){
    resp.send(products)
  }else{
    resp.send({result:"No Products Found"})
  }
})

app.delete("/product/:id",async (req,resp)=>{
  
  let result = await Product.deleteOne({_id:req.params.id})
  resp.send(result);
})

app.get("/product/:id",async (req,resp)=>{
 const result= await Product.findOne({_id:req.params.id});
  if(result){
    resp.send(result);
  }else{
    resp.send({result: "No Record Found"});
  }
})

app.put("/product/:id",async (req,resp)=>{
  const result = await Product.updateOne(
    {_id:req.params.id},
   {
    $set:req.body
   }
  )
  resp.send(result);
})


app.get("/search/:key", async (req, res) => {
  try {
    let result = await Product.find({
      "$or": [
        { name: { $regex: req.params.key, $options: 'i' } }, // Case-insensitive search
        { category: { $regex: req.params.key, $options: 'i' } }, // Example for searching in category as well
        { company: { $regex: req.params.key, $options: 'i' } } // Example for searching in company as well
      ]
    });

    if (result.length > 0) {
      res.send(result);
    } else {
      res.status(404).send({ message: "No products found" });
    }
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
});


app.listen(5000);