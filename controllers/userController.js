const router = require('express').Router();
 
const User = require('../models/User');
const auth = require('../middlewares/auth');
const {register, login, findUserById, updateUser, deleteUser, verifyPassword, findUserByQuery} = require('../services/users');
const { ValidationSecret, authCookieName } = require('../config');
const { isAuth } = require('../middlewares/guards');
const upload = require('../middlewares/multer');
const { findOne, findById } = require('../models/Project');
const fs = require('fs');
const path = require('path');
const passMin = 5;

const passwordRegex = new RegExp(`^(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':"\\\\|,.<>\\/?]).{${passMin},}$`);

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email.trim()) {
            throw new Error('Email is required!');
        }
        if (password.trim().length <= 8) { // Replace with your actual minimum length
            throw new Error('Password must be at least 8 characters long');
        } else if (!/[0-9]/.test(password.trim()) || !/[!@#$%^&*()_+]/.test(password.trim())) {
            throw new Error('Password must contain at least one number and one special character: e.g. (!@#$%^&*()_+)');
        }

        const userData = await register(email.toLowerCase().trim(), password.trim());
       
        res.json(userData);
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try{
        const userData = await login( email, password );
        res.json(userData);
    } catch(err){
        res.status(err.status || 400).json({ message: err.message });
    }
});


router.get('/logout', (req, res) => {
    // Clear session data
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        // Send an empty JSON response
        res.status(200).json({});
    });
});

router.delete('/profile/:id', auth(), isAuth(), async (req, res) => {
    try{
        const id = req.params.id;
        const user = await findUserById(id);
        if(user){
            await deleteUser({_id: id});
            res.status(200).json({});
        }
    } catch (error){
        console.error('Error deleting user:', error);
        res.status(error.status || 400).json({ message: error.message });
    }
})

// get profile info
router.get('/profile', auth(), async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    // const {_id: userId} = req.user;
    const userId = req.user._id;
    try{
        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // User.findOne( id, { password: 0, __v: 0}) //finding by Id and returning without password and __v
        // .then(user => {res.status(200).json(user) }) 
        // .catch(next);
        const userWithoutSensInfo = {
            _id: user._id,
            email: user.email,
        }
        res.status(200).json(userWithoutSensInfo); 
        // res.json(user);
    } catch(error){
        console.error('Error finding user by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// route to handle profile picture upload
router.put('/profile-picture', auth(), upload.single('profilePicture'), async (req, res) => {
    try{
        const userId = req.user._id;
        const user = await findUserById(userId);

        if(!user){
            return res.status(404).json({ message: 'User not found'});
        }

        user.profilePicture = req.file.filename;
        await user.save();

        res.status(200).json({ message: 'Profile picture uploaded successfully', profilePicture: user.profilePicture});
        return user;
    } catch (error){
            console.error('Error uploading profile picture:', error.message);
            res.status(500).json({ message: 'Server error', error: error.message})
    }
})

router.post('/verify', auth(), async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await verifyPassword(email, password);
        res.status(200).json(user);
    } catch(error){
        res.status(error.status || 500).json({ message: error.message});
    }
});

router.get('/:id', auth(), async (req, res) => {
    try {
            const userId = req.params.id;
        if(userId !== "profile"){
            const user = await findUserById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const userWithoutSensInfo = {
                _id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                username: user.username,
                profilePicture: user.profilePicture
            }
            res.status(200).json(userWithoutSensInfo);
        }

            // res.json(user);
        // console.log('req.user._id: ',req.user._id)
        // console.log('req.params.id: ',req.params.id)

    } catch (error) {
        console.error('Error finding user by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// edit profile

router.put('/profile', auth(), upload.single('profilePicture'), async (req, res) => {
    try{
        const email = req.body.email;
        const user = await findUserByQuery({email: email});
        if(!user){
            return res.status(404).json({message: 'User not found!'});
        }
        const data = req.body;
        // handle the profile pic
        if(req.file){
            data.profilePicture = req.file.filename
        }

            // Validate password if provided
    if (data.password) {
        if (data.password.trim().length <= 8) { // Replace with your actual minimum length
          throw new Error('Password must be at least 8 characters long');
        } else if (!/[0-9]/.test(data.password.trim()) || !/[!@#$%^&*()_+]/.test(data.password.trim())) {
          throw new Error('Password must contain at least one number and one special character: e.g. (!@#$%^&*()_+)');
        }
      }

      const updatedUser = await updateUser({ email: email}, data, {runValidators: true, new: true})
       .then(user => {
        res.status(200).json(user);
        })
       .catch(error =>  res.status(error.status || 400).json({ message: error.message }));
    } catch (error){
        res.status(error.status || 400).json({ message: error.message });
    }
    // try{
    //     const email = req.body.email;
    //     const data = req.body;
    //         // Validate password if provided
    // if (data.password) {
    //     if (data.password.trim().length <= 8) { // Replace with your actual minimum length
    //       throw new Error('Password must be at least 8 characters long');
    //     } else if (!/[0-9]/.test(data.password.trim()) || !/[!@#$%^&*()_+]/.test(data.password.trim())) {
    //       throw new Error('Password must contain at least one number and one special character: e.g. (!@#$%^&*()_+)');
    //     }
    //   }

    //   const updatedUser = await updateUser({ email: email}, data, {runValidators: true, new: true})
    //    .then(user => {res.status(200).json(user)})
    //    .catch(error =>  res.status(error.status || 400).json({ message: error.message }));

    // } catch (error){
    //     console.error("Error updating user:", error);
    //     res.status(error.status || 400).json({ message: error.message });
    // }
    //__________________________________________________________________
    // try{
    //     const id = req.user_id;
    //     console.log('userController., req ***********************', req, '****************END************************')
    //     console.log('userController ln115., req.user:', req.user)
    //         //{} inside all the data from the re.body
    //     const data = req.body;
    //     console.log('userController., ln 118, data:', data);
    //     if(data.password){
    //         if (data.password.trim().length <= 8) { // Replace with your actual minimum length
    //             throw new Error('Password must be at least 8 characters long');
    //         } else if (!/[0-9]/.test(data.password.trim()) || !/[!@#$%^&*()_+]/.test(data.password.trim())) {
    //             throw new Error('Password must contain at least one number and one special character: e.g. (!@#$%^&*()_+)');
    //         }
    //     }
    //     const updatedUser = await updateUser({ _id: id}, data, {runValidators: true, new: true} )
    //     .then(user => {res.status(200).json(user)})
    //     .catch(error =>  res.status(error.status || 400).json({ message: error.message }));

    // } catch(error){
    //     console.error('Error updating user:', error);
    //     res.status(error.status || 400).json({ message: error.message });
    // }
            // everything below is done by the "findOneAndUpdate above and the req handler following"
        
        // const user = await findUserById(id);
        // if (!user) {
        //     return res.status(404).json({ error: 'User not found' });
        // }
        // if (email && !email.trim()) {
        //             throw new Error('Email is required!');
        // }
        // if(password){
        //     if (password.trim().length < 8) { // Replace with your actual minimum length
        //         throw new Error('Password must be at least 8 characters long');
        //     } else if (!/[0-9]/.test(password.trim()) || !/[!@#$%^&*()_+]/.test(password.trim())) {
        //         throw new Error('Password must contain at least one number and one special character: e.g. (!@#$%^&*()_+)');
        //     }
        // }
        // const updateData = {};
        // if(email){
        //     updateData.email = email.trim();
        // }
        // if(password){
        //     updateData.password = password.trim();
        // }
        // const updateUser = await updateUser( id, updateData );
        // res.json(updateUser);
});

router.put('/:id', auth(), isAuth(), async (req, res) => {
    try{
        let id;
        if(req.params.id === "logout"){
            id = req.user._id;
        } else {
            id = req.params.id;
        };
        const { email, password } = req.body;
        // find user to ensure it exists
        const user = await findUserById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (email && !email.trim()) {
                    throw new Error('Email is required!');
        }
        if(password){
            if (password.trim().length < 8) { // Replace with your actual minimum length
                throw new Error('Password must be at least 8 characters long');
            } else if (!/[0-9]/.test(password.trim()) || !/[!@#$%^&*()_+]/.test(password.trim())) {
                throw new Error('Password must contain at least one number and one special character: e.g. (!@#$%^&*()_+)');
            }
        }
        const updateData = {};
        if(email){
            updateData.email = email.trim();
        }
        if(password){
            updateData.password = password.trim();
        }
        const updateUser = await updateUser( id, updateData );
        res.json(updateUser);
    } catch (err){
        console.error('Error updating user:', err);
        res.status(err.status || 400).json({ message: err.message });
    }
})



module.exports = router;