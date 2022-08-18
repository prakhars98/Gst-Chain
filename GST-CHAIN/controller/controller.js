const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/users');
const nodemailer = require('nodemailer');
const passport =require('passport');
const mongoose = require('mongoose');
const {ensureAuthenticated} = require('../config/auth');
const jwt = require('jwt-simple');
router.get('/', (req,res)=>res.render('welcome'));
router.get('/login', (req, res)=>res.render('login'));
router.post('/login', (req, res, next)=>{
    passport.authenticate('local',{
        successRedirect:'/dashboard',
        failureRedirect:'/login',
        failureFlash:true
    })(req,res,next)
});
router.get('/logout',(req, res)=>{
      req.logOut();
      res.redirect('/login');
});
router.post('/register',(req, res)=>{
    console.log(req.body);
    const {GSTN, password, confirmPassword, businessName, PAN, StateName, DistrictName, email, mobileNo}= req.body;
    let errors=[];
    if (!GSTN || !password || !confirmPassword || !businessName || !PAN || StateName=="Select" ||DistrictName=="Select" || !email || !mobileNo) 
    {
        errors.push({msg:"Please fill in all fields"});
    }
    
    if(password!==confirmPassword)
    {
        errors.push({msg:"Passwords do not match"});
    }
    if(password.length < 6)
    {
        errors.push({msg:"Password should be atleast 6 characters"});
    }
    if(errors.length>0)
    {   console.log(errors);
        res.render('register',{errors});
    } else{
        User.findOne({$or:[{gstn:GSTN},{email:email}]}).then(user=>{
            if (user){
                errors.push({msg:'User already Registered'});
                res.render('register',{errors});
            }else{
                const newUser = new User({
                    gstn:GSTN,
                    password: password,
                    businessName: businessName,
                    pan:PAN,
                    state:StateName,
                    district:DistrictName,
                    email:email,
                    mobile:mobileNo,
                    lastSerialNo:0
                });
                bcrypt.genSalt(10, (err,salt)=>{
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        if (err) throw err;
                        newUser.password=hash;
                        newUser.save().then(user=>{
                            res.redirect('login');
                        }).catch(err=>console.log(err));
                    })
                });
            }
        });
    }
});
router.get('/register',(req, res)=>{res.render('register')});
router.get('/reset',(req, res)=>res.render('reset'));
router.post('/reset', (req,res)=>{
    const gstn = req.body.gstn;
    User.findOne({gstn:gstn}).then(user=>{
        if(!user){
            req.flash('error_msg','No user registered with this email');
            res.redirect('/reset');
        }else{
            let payload ={
                id: user._id,
                email: user.email
            };
            let secret = user.password +"-"+ user.gstn ;
            let token = jwt.encode(payload, secret);
            let transporter = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:'gstchain.abes@gmail.com',
                    pass:'gst@1234'
                }
            });
            let mailOptions = {
                from:'gstchain.abes@gmail.com',
                to:user.email,
                subject:"GST-CHAIN:- Password reset link",
                html:'<a href="http://localhost:3000/resetpass/' + payload.id +'/'+ token + '">Click here to reset your password </a>'

            };
            transporter.sendMail(mailOptions, function(err,data){
                if (err){
                    console.log(err);
                }else{
                    console.log(data);
                }
            })
                req.flash('success_msg',"Password reset link has been sent to your Email")
                res.redirect('/login');
        }
    })
})
router.get('/dashboard',ensureAuthenticated,(req, res)=>res.render('dashboard',{user:req.user.businessName,
     GSTN:req.user.gstn,
     pan:req.user.pan,
     district:req.user.district,
     state:req.user.state,
     email:req.user.email,
     mobile:req.user.mobile
    }));
router.get('/resetpass/:id/:token',(req, res)=>{
    User.findOne({_id:req.params.id}).then(user=>{
        let payload ={
            id: user._id,
            email: user.email
        };
        let secret = user.password +"-"+ user.gstn ;
        let decodedPayload = jwt.decode(req.params.token, secret);
        if(payload.email==decodedPayload.email && payload.id==decodedPayload.id){
            console.log(req.params.token);
            res.render('resetpass');
        }else{
            res.send('<p>Invalid Link</p>');
        } 
        
    }).catch((err)=>console.log(err));   
    
}
);
router.post('/resetpass/:id/:token', (req,res)=>{
    User.findOne({_id:req.params.id}).then(user=>{
       bcrypt.genSalt(10, (err,salt)=>{
          bcrypt.hash(req.body.password, salt, (err, hash)=>{
               if (err) throw err;
               user.password=hash;
               user.save().then(user=>{
                req.flash('success_msg','Password changed Successfully.')
                res.redirect('/login');
              }).catch(err=>console.log(err));
            })
        });
    })
   console.log(req.params.id);
});
router.get('/dashboard/genInvoice',ensureAuthenticated,(req,res)=>{
    let fullDate = new Date();
    let twoDigitMonth = (fullDate.getMonth()+1)+"";if(twoDigitMonth.length==1)	twoDigitMonth="0" +twoDigitMonth;
    let twoDigitDate = fullDate.getDate()+"";if(twoDigitDate.length==1)	twoDigitDate="0" +twoDigitDate;
    let currentDate = twoDigitDate + "/" + twoDigitMonth + "/" + fullDate.getFullYear();
    let currentSerialNo= req.user.lastSerialNo;
    var invoiceSerialNo = currentSerialNo.toString().padStart(5,'0');
    let invoiceNo = fullDate.getFullYear().toString().slice(2) + twoDigitMonth.toString() + invoiceSerialNo;
    console.log(invoiceNo);
    res.render('genInvoice',{currentDate,invoiceNo});
    });
router.get('/dashboard/getInvoice',ensureAuthenticated,(req,res)=>{
    res.render('getInvoice',{
        invoiceNo:req.user.lastInvoiceNo,
        businessName:req.user.businessName,
        gstn:req.user.gstn
    });

});
router.post('/dashboard/genInvoice',ensureAuthenticated,(req,res)=>{
    let lastSerialNo= req.user.lastSerialNo;
    var currentSerialNo = lastSerialNo+1;
    var lastInvoiceNo = req.body.invoice;
    User.findOne({_id:req.user._id}).then(user=>
    {user.lastSerialNo = currentSerialNo;
     user.lastInvoiceNo = parseInt(lastInvoiceNo);
    user.save().then(res.redirect('/dashboard/getInvoice'));
    });
});
router.get('/dashboard/searchInvoice', ensureAuthenticated, (req,res)=>{
    res.render('searchInvoice');
});
router.get("/dashboard/searchInvoice/searchInvoiceNo", ensureAuthenticated, (req,res)=>{
    res.render('getInvoice',{invoiceNo:req.query.searchInvoiceNo, businessName:req.user.businessName,
        gstn:req.user.gstn});
});
router.get('/dashboard/payGST',ensureAuthenticated,(req,res)=>{
    res.render('payGST.ejs');
})
module.exports = router;
