var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var url = 'mongodb://localhost:27017/google';
mongoose.connect(url).then((res)=>{console.log("connected")}).catch((err)=>{console.log(err);});

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
let usermodel=mongoose.model('user', userSchema);
module.exports = {usermodel};
