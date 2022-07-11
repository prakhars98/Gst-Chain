const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
    {
        gstn:{
            type:String,
            required: true
        },
        password:{
            type:String,
            required: true
        },
        businessName:{
            type:String,
            required: true
        },
        pan:{
            type:String,
            required: true
        },
        state:{
            type:String,
            required: true
        },
        district:{
            type:String,
            required: true
        },
        email:{
            type:String,
            required: true
        },
        mobile:{
            type:Number,
            required: true
        },
        lastSerialNo:{ 
            type:Number,
            required: false
        },
        lastInvoiceNo:{
            type:Number,
            required: false
        }

    }
)
const User = mongoose.model('User', userSchema);
module.exports = User;