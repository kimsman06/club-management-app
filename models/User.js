const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const saltRounds = 10

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 10
    },
    studentID: {
        type: Number,
        maxlength: 4
    },
    userID: {
        type: String,
        minlength: 4
    },
    password: {
        type: String,
        minlength: 4
    },
    role: {
        type: Number,
        default: 0
    },
    token: {
        type: String
    },
    tokeExp:{
        type: Number
    }

})

userSchema.pre('save', function(next){
    var user = this
    
    if(user.isModified('password')){
        //Password 암호화
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err)

            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
    
    
})

userSchema.methods.comparePassword = function (plainPassword, cb) {

    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err)
        cb(null, isMatch)
        
    })

}


userSchema.methods.generateToken = function (cb) {
    var user = this;
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token
    user.save(function (err, user) {
        if (err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = (token, cb) => {
    //token decode
    jwt.verify(token, 'secretToken', (err, decoded) => {
        //userid find user
        //client token === db token
        user.findOne({"_id": decoded, "token": token}, (err,user) => {
            if(err) return cb(err)
            cb(null, user)
        })
    })
}
const User = mongoose.model('User',userSchema)

module.exports = { User }