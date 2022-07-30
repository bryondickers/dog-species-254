//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const multer  = require('multer');
const mongoose = require("mongoose");
const fs = require('fs')
const path = require("path");
const nodeMailer = require("nodemailer");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//connect to DB
const SpeciesIntro = " There is enormous variety in the way a dog acts and reacts to the world around them. Those differences can be due to how much socialization and handling they received as a youngster, how well the owner trained them after taking them home, and of course the genetic luck of the draw. In the end, your dog's preferences and personality are as individual as you are and if you can accept that, you're bound to enjoy each other's companionship for life.";


mongoose.connect(DB_URL);

//define a schema of img
const postSchema = new mongoose.Schema({
    postTitle:{
        type: String,
        required: true
    },
    img:{
        data: Buffer,
        contentType: String
    },
    postBody:{
        type: String,
        required: true
    } 
})
const postModel = mongoose.model("Post",postSchema);

app.get("/",function (req,res) {

    res.render("home");
        
        }

  )


app.get("/species",function (req,res) {

    postModel.find(function (err, foundItems) { 
        if (err) {
            console.log(err);
        } else {
    
            res.render("species",{speciesIntroPara:SpeciesIntro,posts:foundItems});
        }

     })

      
})

app.get("/about",function (req,res) {
    res.render("about");
});

app.get("/contact",function (req,res) {
    res.render("contact");
});

app.get("/compose",function (req,res) {

    res.render("compose");

    
});
app.get("/post/:addPost/",function (req,res) {

    var postNa = req.params.addPost;

    postModel.find(function (err,titleArr) { 

        if (err) {
            console.log(err);
        } else {
            titleArr.forEach(function(title){
                if (_.lowerCase(postNa) === _.lowerCase(title.postTitle)){

                    res.render("post",{titlePost:title.postTitle,imagePosted:title.img,contentPost:title.postBody} );
                }

              })
            
            
        }

     })

})

// define storage for files
const Storage = multer.diskStorage({


    destination:function (req,file,cb) {
        cb(null, "uploads");
      },
    filename:function (req,file,cb){
        cb(null,file.fieldname );
    }  
})
//filter to allow only image files
const filterFile = function (req,file,cb) {

    if(file.mimetype.split("/")[0] === "image"){
           cb(null,true);
       }else{
           cb(null,false);
          
           console.log("choose correct file");
       }
    }



   
//define the middleware
const upload = multer({storage:Storage,fileFilter:filterFile});

app.post("/compose",upload.single("filename"),function (req,res) {


    const addPost = new postModel({
        postTitle: req.body.titleText,
        img:{
            data: fs.readFileSync(path.join("uploads/" + req.file.filename)),
            contentType: "image/png"
        },
        postBody: req.body.postContent
    })


    addPost.save(function(err){
        if (err){
            console.log(err);
        }else{
            console.log("Db successfully updated ");
        }

        res.redirect("/species");
    
    })

   

})



app.post("/contact",function (req,res) {

    var options =`<h1> SUBJECT: ${req.body.subject}</h1>
        <ul>
            <li>NAME: ${req.body.fname}</li>
            <li>EMAIL: ${req.body.email}</li>
        </ul>
        MESSAGE : <br> ${req.body.message}`;
    
const transporter = nodeMailer.createTransport({
    service: "hotmail",
       auth:{
        user:process.env.FROM_MAIL,
        pass:process.env.PASSWORD
    },
   
   
})
const mailOptions = {
    from:process.env.FROM_MAIL,
    to:process.env.TO_MAIL,
    subject:"Email from client",
    html:options
};
transporter.sendMail(mailOptions,function (err,info) { 
    if (err) {
        console.log(err);
    } else {
        console.log("email sent successful" + info.response);
    }
 })
 res.redirect("/contact");

 })


 let port = process.env.PORT;
 if (port == null || port == "") {
   port = 3000;
 }
 app.listen(port,function() {
    console.log("Server started on port 3000");
  });


