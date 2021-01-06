const express =  require('express');
var router =  express.Router();
const signup = require('../model/signupcus_model');
const vendor_sign = require('../model/signupvendor');
const addcategory = require('../model/category');
const products = require('../model/add_product');
const placeorder = require('../model/order');
const Cartmodel = require('../model/Usercart');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mongoose = require('mongoose');
const shipping = require('../model/shipping_address');
const middle = require('../middleware/authentication');
const { Validator } = require('node-input-validator');
var jwt = require('jsonwebtoken');
const multer = require('multer');
const { findOne } = require('../model/signupcus_model');
router.post('/signup',(req,res,next)=>{
   console.log(req.body)
   const   v = new Validator(req.body, {
       name : 'required',
       email : 'required|email',
       phone_number : 'required|integer|maxLength:10',
       password:'required'        
       })
     v.check().then((matched) => {
               if (!matched) {
                  res.status(422).send(v.errors);
                }
                else{
                    signup.findOne({'email' : req.body.email},(err,result)=>{
                        if(result == null){
                            signup.create({
                                name : req.body.name,
                                email : req.body.email,
                                phone_number : req.body.phone_number,
                                password : bcrypt.hashSync(req.body.password , saltRounds),
                                otp :  Math.floor(1000+Math.random()*9000)
          }).then(user=>{
              let token = jwt.sign(user.toJSON(),process.env.SECRET_SIGN_KEY)
            console.log(token);
            if(token){
                let check = user.toJSON();
                check.token=token;
                res.status(200).json({statusCode:200,'message' : "registerd", result : check})
            }
            else{
                res.status(400).json({statusCode:400,'message':"token not created"});
            }
            })
.catch(err=>{res.status(500).json({statusCode:500,message:"internal server error",error : err})})          
                        }
                        else{
                            res.status(400).json({statusCode:400,message : 'already registered mail'})
                        }
                    })   
                   
                }
            })

})
router.post('/otpverify',(req,res,next)=>{
    const v =  new Validator(req.body , {
        phone_number : 'required|integer|maxLength:10',
        otp : 'required|maxLength:4'
    })
    v.check().then((matched)=>{
        if(!matched){
            res.status(422).send(v.errors);
        }
        else{
       
            signup.findOne({'phone_number': req.body.phone_number},(err,result)=>{
                console.log(result);
                if(result == null){
                    res.status(404).json({statusCode:404,message: "this number not registerd"})
                }
                else if(req.body.otp == result.otp){
                    res.status(200).json({saltRounds:200,message: "number verified",result : result})
                    signup.updateOne({'email':result.email},{$set : {is_number_verify : 1}},(err,result)=>{
           console.log("updated");
                    })     
                }
                else{
                    // console.log("otp not matched");
                    res.status(400).json({statusCode:400,message: "otp not matched"})
                }
            })
        }
    })
    })
router.post('/login',(req,res,next)=>{
  console.log(req.body)
    const v = new Validator(req.body,{
         email : 'required',
         password : 'required'
    })
  v.check().then((matched)=>{
    let email_message = v.errors.email?v.errors.email.message:"";
    let password_message = v.errors.password?v.errors.password.message+',':"";
      if(!matched){
 res.status(422).json({statusCode:422,message : email_message+password_message});
      }
      else{
        signup.findOne({'email' : req.body.email},(err,result)=>{
            if(result == null){
          //   console.log("this mail not registerd");
            res.status(404).json({statusCode:404,'message':"this mail not registerd"});
            }
            else if(result.is_number_verify == 1){

                bcrypt.compare(req.body.password , result.password,(err,user)=>{
                    if(user == true){
                      let token = jwt.sign(result.toJSON(),process.env.SECRET_LOG_KEY);
                      console.log(token);
                      let check = result.toJSON();
                      check.token = token
                      res.status(200).json({statusCode:200,message:"login succesfully",result : check})
                    }
                    else{
                        res.status(400).json({statusCode:400,message: "password not matched"})
                    }
                })
              }
         else{
             res.status(400).json({statusCode:400,message: "first verify number then login"});
         }
        })
      }
  })

 
})

router.post('/forgetpass',(req,res,next)=>{
    console.log(req.body);
    const   v = new Validator(req.body, {
        email : 'required|email'
        })
      v.check().then((matched) => {
 let email_message = v.errors.email?v.errors.email.message:"";
                if (!matched) {
                   res.status(422).json({statusCode : 422,message : email_message});
                 }
                 else{
        signup.findOne({'email': req.body.email},(err,result)=>{
              if(result == null){
                     res.status(404).json({statusCode:404,message :"this mail not registered"});
                     }
               else{
                   res.status(200).json({statusCode:200,message : "mail verified"})
                 }
                    })
                 }
         })
 
})
router.post('/shipping_add',middle,(req,res,next)=>{
    console.log(req.body);
    console.log(req.userData);
    console.log(req.userData._id);
    const   v = new Validator(req.body, {
        // customer_id :'required',
        token : 'required',
        address_line1 : 'required',
        address_line2 : 'required',
        city : 'required',
        state : 'required',
        zipcode : 'required|maxLength:6|integer',
        country : 'required'       
        })
      v.check().then((matched) => {
                if (!matched) {
                   res.status(422).send(v.errors);
                 }
                 else{
                    shipping.create({
                        customer_id :req.userData._id,
                        address_line1 : req.body.address_line1,
                        address_line2 : req.body.address_line2,
                        city : req.body.city,
                        state : req.body.state,
                        zipcode : req.body.zipcode,
                        country : req.body.country
                    }).then(user=>{res.status(200).json({statusCode:200,'message':"added address",result : user})})
    .catch(err=>{res.status(500).json({statusCode:500,message:"internal server error",err : err.message})})         
                 }
                })

})
router.post('/update_shipingadress',middle,(req,res,next)=>{
    console.log(req.body)
    const   v = new Validator(req.body, {
        address_id : 'required',
        token:'required',
        address_line1 : 'required',
        address_line2 : 'required',
        city : 'required',
        state : 'required',
        zipcode : 'required',
        country : 'required',


        })
      v.check().then((matched) => {
                if (!matched) {
                   res.status(422).send(v.errors);
                 }
                 else{
                    shipping.findByIdAndUpdate({'_id' : req.body.address_id},{
                        customer_id :req.userData._id,
                        address_line1 : req.body.address_line1,
                        address_line2 : req.body.address_line2,
                        city : req.body.city,
                        state : req.body.state,
                        zipcode : req.body.zipcode,
                        country : req.body.country
                    }).then(user=>{res.status(200).json({statusCode:200,message: "updated"})})
         .catch(err=>{res.status(500).json({statusCode:500,message:"internal server error",err : err.message})})
                 }
                })
})

router.post('/saved_addresses',async(req,res,next)=>{
    const v = new Validator(req.body, {
        customer_id : 'required'
    });      
    const matched = await v.check();
    let customer_message=v.errors.customer_id?v.errors.customer_id.message:"";
    if (!matched) {
       res.status(422).json({ statusCode: 422, message: customer_message})
       return;
    }
 else{
    let finals = await shipping.aggregate([
        {$match : {'customer_id':mongoose.Types.ObjectId(req.body.customer_id)}},
        {$lookup : {from : "registers",localField : "customer_id" , foreignField : "_id" , as :"customer_details"}},
        {$unwind:{path:'$customer_details',preserveNullAndEmptyArrays:true}},
        {$project : {
         'name':"$customer_details.name",
         'address_line1': 1,
         'address_line2': 1,
         'city': 1,
         'state': 1,
         'zipcode': 1,
         'country': 1,
         'set_default_address':1
        }}
    ])
     console.log(finals)
     res.send(finals)
 }
  
})

router.post('/setDefaultAdd',async(req,res,next)=>{
    console.log(req.body);
    try{
     let getAddr= await shipping.findOne({'_id':req.body.address_id})
     console.log(getAddr.customer_id);
      let allAddre = await shipping.find({'customer_id':getAddr.customer_id})
    //   console.log(allAddre);
    //   let len = allAddre.length;
    //   console.log(len);
      let found = 0; 
      for(addre of allAddre){
          console.log(addre);
          if(addre.set_default_address == 1){
            //   console.log("you already added a default address");
              found =1;
          }
      }
      if(found == 1)
      {
          console.log("you already added a default address");
     res.status(400).json({statusCode:400,message:"you already added a default address"});
      }
      else{
     let result = await shipping.updateOne({'_id':req.body.address_id},{$set:{set_default_address:1}})
   if(result){
    console.log("successfully set default address");
    res.status(200).json({statusCode:200,message:"successfully set default address"});
 }
   else{
    res.status(500).json({statusCode:500,message:"internal server error",err});
   }
      }
    }
    
  catch(e){
    //   console.log(e);
      console.log("cannot find this address_id");
      res.status(400).json({statusCode:400,message:"cannot find this address_id"})
  }
})
router.post('/unCheckAddres',async(req,res,next)=>{
    console.log(req.body);
    try{
        let address = await shipping.findOne({'_id':req.body.address_id})
        console.log(address);
        let result = await shipping.updateOne({'_id':req.body.address_id},{$set:{set_default_address:0}})
        if(result){
            res.status(200).json({statusCode:200,message:"successfully unchecked"});
        }
        else{
        res.status(500).json({statusCode:500,message:"internal server error", err});      
        }
    }
    catch(e)
    {
        console.log("cannot find this address");
        res.status(404).json({statusCode:404,message:"invalid address_id"});
    }
})
router.post('/vendor_register',(req,res,next)=>{
    console.log(req.body)
    const   v = new Validator(req.body, {
        name : 'required',
        email : 'required|email',
        phone_number : 'required|maxLength:10',
        password:'required'        
        })
      v.check().then((matched) => {
                if (!matched) {
                   res.status(422).send(v.errors);
                 }
                 else{
                    vendor_sign.create({
                         name : req.body.name,
                         email : req.body.email,
                         phone_number : req.body.phone_number,
                         password : bcrypt.hashSync(req.body.password , saltRounds)
                     }).then(user=>{res.status(200).json({'message' : "vendor registerd", result : user})})
                     .catch(err=>{res.status(500).json({statusCode:500,message:"internal server error",err : err})})
                 }
             }) 
 
})
router.post('/category',(req,res,next)=>{
    console.log(req.body);
    const v = new Validator(req.body,{
        category_name : 'required'
    })
    v.check().then((matched)=>{
        let category_message=v.errors.category_name?v.errors.category_name.message:"";
        if(!matched){
res.status(422).json({statusCode : 422,message : category_message})
        }
        else{
            addcategory.findOne({'category_name':req.body.category_name},(err,result)=>{
                if(result == null){
                    addcategory.create({
                        category_name : req.body.category_name
                    }).then(user=>{res.status(200).json({statusCode:200,message:'added' , user:user})})
          .catch(err=>{res.status(500).json({statusCode:500,message:"internal server error",err : err})})
                }
                else{
                  res.status(400).json({'message' : 'already added'})
                }
        })
        }
    })
  
})

var storage =  multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./upload')
    },
    filename : function(req,file,cb){
        cb(null,  Date.now()+file.originalname )
    }
}) 
const upload = multer({
    storage :storage
})
router.use('/picture',express.static('upload'));
router.post('/addproduct',upload.array('product_pics',4),(req,res,next)=>{
  console.log(req.body);
  console.log(req.files);
  let pro_pics=[];
req.files.forEach(element=>{
    pro_pics.push(`${element.filename}`)
})
console.log(pro_pics);
const v = new Validator(req.body,{
    category_id : 'required',
    vendor_id : 'required',
    item_name : 'required',
    description :'required',
    unit_price :'required',
    discount_priceunit : 'required',
})
v.check().then((matched)=>{
    let category_message=v.errors.category_id?v.errors.category_id.message:"";
    let vendor_message=v.errors.vendor_id?v.errors.vendor_id.message+',':"";
let item_message = v.errors.item_name?v.errors.item_name.message+',':"";
let description_message = v.errors.description?v.errors.description.message+',':"";
let unit_price_message = v.errors.unit_price?v.errors.unit_price.message+',':"";
let discount_priceunit_message = v.errors.discount_priceunit?v.errors.discount_priceunit.message+',':"";
    if(!matched){
res.status(422).json({statusCode : 422,message:category_message+vendor_message+item_message+description_message+
    unit_price_message+discount_priceunit_message})
    return;
    }
    else{
        products.create({
            category_id : req.body.category_id,
            vendor_id : req.body.vendor_id,
            item_name : req.body.item_name,
            description : req.body.description,
            unit_price :req.body.unit_price,
            discount_priceunit : req.body.discount_priceunit,
            product_pics : pro_pics,
        }).then(user=>{res.status(200).json({statusCode:200,message:"added product", result : user})})
.catch(err=>{res.status(500).json({statusCode:500,message:"internal server error",err : err})})
    }
})
})
router.post('/grocerystore',async(req,res,next)=>{
    let prod = await products.aggregate([
    {$group: {
      _id : "$category_id"}}
  ])
 
  console.log(prod)
  let catgids = prod.map(arr=>arr['_id']);
  console.log(catgids);
  let store_arr = [];
    for(id of catgids){
        console.log(id);
        let result = await addcategory.findOne({'_id' : id},{category_name : 1 })
        console.log(result);
        if(result){
         let pro_details = await products.find({'category_id' : id}
         ,{item_name:1,description :1,unit_price:1,discount_priceunit :1,product_pics :1})
          console.log(pro_details);
          store_arr.push({
           cate : result,
               prods : pro_details
          }) 
        }
    }
    console.log(store_arr);
    res.send(store_arr);
})

router.post('/placeorders',(req,res,next)=>{
  console.log(req.body);
  const   v = new Validator(req.body, {
    order_number : 'required|integer',
    product : 'required',
    vendor_id : 'required',
    customer_id  : 'required',
    total_amountpaid : 'required|integer'       
    })
  v.check().then((matched) => {    
            if (!matched) {
               res.status(422).send(v.errors);
             }
             else{
                placeorder.create({ order_number : req.body.order_number,
                    product : req.body.product,
                    vendor_id : req.body.vendor_id,
                    customer_id  : req.body.customer_id,
            total_amountpaid : req.body.total_amountpaid})
          .then(user=>{res.status(200).json({statusCode : 200,message:" order placed",user : user})})
  .catch(err=>{res.status(500).json({statusCode:500,message:"internal server error",error : err.message})})
             }
            })
})
router.post('/order_list',async(req,res,next)=>{
        const v = new Validator(req.body, {
            vendor_id : 'required'
        });      
        const matched = await v.check();

        let vendor_message=v.errors.vendor_id?v.errors.vendor_id.message:"";
        // let profile_message=v.errors.profile_id?v.errors.profile_id.message+',':"";
        if (!matched) {
           res.status(422).json({ statusCode: 422, message: vendor_message})
           return;
        }

        // if (!matched) {
        // res.status(422).send(v.errors);
        // }
        else{
            const data = await placeorder.find({'vendor_id' : req.body.vendor_id},
            {_id : 1, order_number : 1,total_amountpaid :1})       
           console.log(data);
            res.status(200).json({statusCode:200,result : data});  

        }
      });

router.post('/order_details',async(req,res,next)=>{
    console.log(req.body);
    const v = new Validator(req.body,{
        order_id : 'required'
    });
    const matched = await v.check();
    let order_message = v.errors.order_id?v.errors.order_id.message:"";
    if(!matched){
        res.status(422).json({statusCode : 422 , message : order_message})
        return;
    }

    else{
  try{
    let order_data = await placeorder.findOne({'_id': req.body.order_id},{_id : 1,order_number :1 ,total_amountpaid :1,customer_id:1})
    console.log(order_data);
    let order_arr = [];
    order_arr.push(order_data);
    console.log(order_data.customer_id);
let allAddre = await shipping.find({'customer_id' :order_data.customer_id }
,{ address_line1:1,address_line2:1,city:1,state :1,zipcode:1,country :1,set_default_address:1})
   console.log(allAddre);
let found = 0;
 for(addre of allAddre ){
     if(addre.set_default_address == 1){
        found =1;
        order_arr.push(addre);
     }
 }
 if(found == 0){
     console.log("choose your default address");
     res.status(400).json({statusCode:400,message:"first choose your default address"});
 }
 else{
    console.log(order_arr);
    res.status(200).json({statusCode:200, order_arr});
 }
  }
    catch(error){
        console.log("this order_id not found");
        res.status(404).json({statusCode:404,message:"invalid order_id"})
    }
   }
    })
router.post('/Card',(req,res,next)=>{
    console.log(req.body);
    Cartmodel.create({
         customer_id:req.body.customer_id,
         carditems:req.body.carditems,
         order:req.body.order,
         delivery:req.body.delivery,
         total_amount:req.body.total_amount
    }).then(user=>{res.status(200).json({statusCode:200, message:"card created",user})})
    .catch(err=>{res.status(500).json({statusCode:500,message:"internal sever error",err:err})})
    // var item_arr =[];
    //     Cardmodel.create({
    //         user_id : req.body.user_id
            // carditems: req.body.carditems
        // }).then(result=>{  
        //     console.log(result._id);
        //    req.body.carditems.forEach(element=>{
        //          const a = element.product_id;
        //            const b = element.quantity;
        //            item_arr.push({
        //             card_id : result._id,
        //             product_id: a,
        //             quantity: b
        //            })
        //    })
        // console.log(item_arr);
        // Cardproductmodel.insertMany(item_arr);
        // })
        //     .catch(err=>{console.log(err)});
    })
router.post('/getCard',(req,res,next)=>{
    console.log(req.body);
})
module.exports = router;
