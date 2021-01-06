const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const mongoose =  require('mongoose');
require('dotenv').config();
const userrouter = require('./routes/user');
app.use(bodyparser.json({extended : true}));
app.use(bodyparser.urlencoded({extended:true}))
let PORT = process.env.PORT || 3000

mongoose.Promise=global.Promise;
mongoose.connect('mongodb+srv://annu:anamika@cluster0.fhigx.mongodb.net/zhola?retryWrites=true&w=majority',{useNewUrlParser:true ,useUnifiedTopology: true})
.then(()=>console.log('connection successful'))
.catch((err)=>console.error(err))

app.use('/',userrouter);
app.listen(PORT);