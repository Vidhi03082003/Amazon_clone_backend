const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const jwt=require('jsonwebtoken')
require('dotenv').config();

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
    

})





// hashing the password

userSchema.pre('save', async function (next) {
    console.log("hii")
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12)
        
    }
    next();
})


userSchema.methods.generateAuthToken = async function () {
    try {
        console.log("secret key>>>",process.env.SECRET_KEY)
        let token = jwt.sign({ _id: this._id }, "MYNAMEISVIDHIARORAHELLOHOWRY")
        this.tokens=this.tokens.concat({token:token})
        console.log("token",token)
        await this.save();
        return token;
    } catch (err) {
        console.log(err)
    }
}



const User = mongoose.model('USER', userSchema)

module.exports = User;