const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const app = express()
require('./config/passport')(passport);
const db = require('./config/keys').MongoURI;
mongoose.connect(db, {useNewUrlParser:true}).then(()=>console.log("MongoDB connected")).catch(err=>console.log(err));
app.use(express.static(path.join(__dirname,'/public')));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:false}));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized:true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
    res.locals.success_msg= req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');  
    res.locals.error = req.flash('error');
  next();
});
app.use('/', require('./controller/controller'));
app.use('/login', require('./controller/controller'));
app.use('/logout', require('./controller/controller'));
app.use('/register', require('./controller/controller'));
app.use('/reset', require('./controller/controller'));
app.use('/dashboard', require('./controller/controller'));
app.use('/resetpass/:id/:token', require('./controller/controller'));
app.use('/dashboard/genInvoice', require('./controller/controller'));
app.use('/dashboard/getInvoice', require('./controller/controller'));
app.use('/dashboard/payGST', require('./controller/controller'));
app.use('/dashboard/viewInvoice', require('./controller/controller'));
const PORT = process.env.PORT || 3000 ;
app.listen(3000, console.log(`The server is running on port ${PORT}`))