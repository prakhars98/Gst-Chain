const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/users');

module.exports= function(passport){
    passport.use(
        new LocalStrategy({usernameField:'GSTN'}, (GSTN, password, done)=>{
            User.findOne({gstn:GSTN})
            .then(user=>{
                if(!user){
                    return done(null, false, {message:"That GSTN is not registered"});
                }
                bcrypt.compare(password, user.password, (err,isMatch)=>{
                    if (err) throw err;
                    if(isMatch){
                        return done(null, user);
                    }else{
                        return done(null,false,{message:'Password Incorrect'});
                    }
                });
            })
            .catch((err)=>console.log(err));
        })
    )
    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
}