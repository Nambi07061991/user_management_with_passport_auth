const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const Sequelize=require('sequelize')

const router = express.Router();

router.post('/register', async (req, res) =>{
    try{
        const { username, password, email, role } = req.body;
        console.log('Request body:', req.body);
        const existingUser = await User.findOne({
            where: {
                [Sequelize.Op.or]: [{ username }, { email }],
            },
        });

        if(existingUser){
            return res.status(400).json({ error: 'user name or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create ({
            username,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({ message: 'User Registered Successfully', user: newUser});

    }catch(error){
        console.log('Error during registration:', error);
        res.status(500).json({ error: 'Internal server error'});
    }
});

module.exports = router;