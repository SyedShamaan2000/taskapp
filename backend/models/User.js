const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: validator.isEmail
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be atleast 6 characters']
    },
    tasks: {
        type: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;