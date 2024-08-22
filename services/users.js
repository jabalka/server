const {User} = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {ValidationSecret} = require('../config');
const path = require('path'); // Import the path module
const fs = require('fs');



// Register User ----------------------------
async function register(email, password){
    try {
        // check if user exists
        const existing = await User.findOne({ email });
        if (existing) {
            const error = new Error('User with this email already exists!');
            error.status = 409;
            throw error;
        }
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // store user
        const user = new User({
            email,
            hashedPassword
        });
        try {
            await user.save();
        } catch (saveError) {
            console.error('Error saving user:', saveError.message);
            throw saveError;
        }
        
        return {
            _id: user._id,
            email: user.email,
            accessToken: createToken(user)
        };
    } catch (error) {
        console.error('Error during user registration:', error.message);
        throw error;
    }
}

// Login User --------------------------------
async function login(email, password){
    const user = await User.findOne({ email });

    if(!user){
        const err =  new Error('Incorrect email or password!');
        err.status = 401;
        throw err;
    }

    const match = await bcrypt.compare(password, user.hashedPassword);

    if(!match){
        const err =  new Error('Incorrect email or password!');
        err.status = 401;
        throw err;
    };

    return {
        _id: user._id,
        email: user.email,
        accessToken: createToken(user),
        username: user.username,
        name: user.name,
        phone: user.phone,
        profilePicture: user.profilePicture
    };
}

// Create User Token -------------------------
function createToken(user){
    const token = jwt.sign({
        // it is suitable to add inside the token the function of the user e.g. ADMIN
        _id: user._id,
        email: user.email
    }, ValidationSecret);
    
    return token;
}

async function findUserById(id) {
    try {
        const user = await User.findById(id);
        return user; 
    } catch (error) {
        // Handle any errors that occur during the database operation
        throw new Error(`Error finding user by ID: ${error.message}`);
    }
}

async function findUserByQuery(query){
    try{
        const user = await User.findOne(query);
        return user;
    } catch (error){
        throw new Error(`Error finding user by query: ${error.message}`);
    }
}

async function updateUser(query, data, options = {}){
    const updateData = {...data};
    try{
        if(data.profilePicture){
            const oldProfilePicPath = path.join(__dirname, 'uploads/profilePics', data.profilePicture); // may need an adjustmen
            if(fs.existsSync(oldProfilePicPath)){
                fs.unlinkSync(oldProfilePicPath);
            }
        }
        if(data.password){
            updateData.hashedPassword = await bcrypt.hash(data.password, 10);
        }
        const updatedUser = await User.findOneAndUpdate(query, updateData, {new: true, ...options});
        if(!updatedUser){
            throw new Error('User not found');
        }
        return {
            _id: updatedUser._id,
            email: updatedUser.email,
            accessToken: createToken(updatedUser),
            username: updatedUser.username,
            name: updatedUser.name,
            phone: updatedUser.phone,
            profilePicture: updatedUser.profilePicture
        };
    } catch(error) {
        throw error;
    }
}

async function deleteUser(query){
    try{
        const deltedUser = await User.findOneAndDelete(query);
        if(!deltedUser){
            throw new Error('User not found');
        }
    }catch(error) {
        throw error;
    }
}

async function verifyPassword(email, password){
    const user = await User.findOne({email});
        if(!user){
            const err =  new Error('Current user not verify!');
            err.status = 401;
            throw err;
        }
        const match = await bcrypt.compare(password, user.hashedPassword);
        if(!match){
            const err =  new Error('Incorrect password!');
            err.status = 401;
            throw err;
        };

        return {
            _id: user._id,
            email: user.email,
            username: user.username,
            name: user.name,
            phone: user.phone,
            profilePicture: user.profilePicture
        }
}

module.exports = {
    register,
    login,
    findUserById,
    findUserByQuery,
    updateUser,
    deleteUser,
    verifyPassword
}