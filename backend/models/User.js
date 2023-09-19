const mongoose = require('mongoose');
const isEmail = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,        
    },
    email:{
        type: String,
        lowercase: true,
        unique: true,
        required: [true,"Please provide an email"],
        index: true,
        validate: [isEmail,"Please provide a valid email"]
    },
    password:{
        type: String,
        required: [true,"Please provide a password"],
    },
    picture:{
        type: String,
        default:'online'
    }
},{minimize: false});

userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
        next();
    } catch (err) {
        return next(err);
    }
});

  

userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
}


userSchema.statics.findByCredentials = async function(email, password) {
    const user = await User.findOne({email});
    if(!user) throw new Error('invalid email or password');
  
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) throw new Error('invalid email or password')
    return user
}

const User = mongoose.model('User', userSchema);

module.exports = User
  