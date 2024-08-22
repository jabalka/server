const jwt = require('jsonwebtoken');
const {ValidationSecret} = require('../config');
const {User} = require('../models/User');

function auth() {
    return async function (req, res, next) {
        const token = req.headers['x-authorization'];
        try {
            if(token){
                const userData = jwt.verify(token, ValidationSecret);
                const user = await User.findById(userData._id);
                if(!user){
                    return res.status(401).json({ message: 'User not found!' });
                }
                req.user = user;
            }
        } catch (err){
            return res.status(401).json({message: 'Invalid session! Please sign in...'});
        }
        next();
    }
}

module.exports = auth