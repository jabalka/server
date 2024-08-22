const projectModel = require('./Project');
const postModel = require('./postModel');
const tokenBlacklistModel = require('./tokenBlacklistModel');
const userModel = require('./User');


module.exports = {
    userModel,
    tokenBlacklistModel,
    projectModel,
    postModel,
}