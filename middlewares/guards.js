const { getById } = require("../services/projects");
const { findUserById } = require("../services/users");

module.exports = {
    isAuth() {
        return async (req, res, next) => {
            const id = req.user._id;
            try{
                const user = await findUserById(id);
                if(!user){
                    res.status(401).json({message: 'Please sign in.'});
                } 
                next();
            } catch(err){
                return res.status(401).json({ message: 'Authorization error.' });
            }
        };
    },
    isGuest() {
        return (req, res, next) => {
            if(req.user){
                res.status(400).json({message: 'You are already signed in.'});
            } else {
                next();
            }
        };
    },
    isOwner() {
        return async (req, res, next) => {
            const project = req.data // it comes from preload middleware 

            if((req.user._id).toString() !== (project.owner).toString()){
                res.status(403).json({message: 'You cannot delete/modify this record.'});
            } else {
                next();
            }
        };
    }
};