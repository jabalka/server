const {Schema, model} = require('mongoose');

const schema = new Schema({
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String },
    name: {type: String},
    phone: {type: String},
    username: {type: String},
    profilePicture: {type: String}
});


module.exports = {
    User: model('User', schema)
};