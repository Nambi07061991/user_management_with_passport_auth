const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('../middleware/passporMiddleware');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { Sequelize } = require('sequelize');
const { User } = require('../models');
const controllers = require('../controllers/login-controller');

const router = express.Router();



router.post('/users', async(req, res) => {
    try{
        const { firstname, lastname, username, password, email, role } = req.body;
        const existingUser = await User.findOne({
            where: {
                [ Sequelize.Op.or ] : [{ username }, { email }],
            },
        });

        if(existingUser){
           return res.status(400).json({ error: 'Username or Email already exsit' });
        }

        const newUser = await User.create({ firstname, lastname, username, password, email, role });
        res.status(201).json(newUser);

    }catch(err){
        console.log('Unable to add user:', err);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

router.get('/users', isAuthenticated, async(req, res) => {
    try{
        const loggedInUser = req.user;
        if(loggedInUser.role === 'Admin'){
            const users = await User.findAll();
            res.json(users);
        }else{
            res.json([loggedInUser]);
        }
        
    }catch(err){
        res.status(500).json({ error : 'Internal Server Error'});
    }
});

router.post('/users/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err){
            return next(err);
        }
        if (!user){
            return res.status(401).json({ message: 'Invalid username or password!'});
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }    
            controllers.getUser(req, res);        
        });
    })(req, res, next);
});

router.put('/users/password', isAuthenticated, controllers.updatePassword);

router.post('/users/password/forget/', controllers.forgetPasssword);

router.get('/users/reset-password/', controllers.resetPassword);

module.exports = router;