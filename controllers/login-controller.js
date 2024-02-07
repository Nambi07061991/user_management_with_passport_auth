const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('../middleware/passporMiddleware');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { Sequelize } = require('sequelize');
const { v4 : uuidv4 } = require('uuid');
const nodemailer = require('nodemailer')
const { User } = require('../models');
const { mailUser } = require('../config/hostMail.config')


exports.getUser = async (req, res) => {
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
}

exports.forgetPasssword = async (req, res) => {
    try{
        const { email } = req.body;

        const user = await User.findOne({ where: { email }});

        if(!user) {
            return res.status(400).json({error: 'user not found'});
        }

        const resetToken = uuidv4();

        user.resetToken = resetToken;
        user.resetTokenExpires = Date.now() + 3600000;
        user.resetPassword = false;
        await user.save();
     
        const resetLink = `http://localhost:3001/reset-password?token=${resetToken}`;
     
        const gmailConfig = {
            service: 'gmail',
            auth: {
              user: mailUser.mail, // Your Gmail email address
              pass: mailUser.password// Your Gmail password or app-specific password
            }
          };

        const transporter = nodemailer.createTransport(gmailConfig);

        const mailOption = {
        from: mailUser.mail,
        to: email,
        subject: 'Password Reset',
        text: `To reset the password, click on the following link: ${resetLink}`,
       } 

       await transporter.sendMail(mailOption);

       res.status(200).json(`Password Reset Link Send successfully`);
    }
    catch(err){
        res.status(500).json({error: 'Internal Server Error'});
    }
};

exports.updatePassword = async(req, res) => {
    try{
        const {currentPassword, newPassword, email} = req.body;
         
        if(email){
            const user = await User.findOne({ where: { email }});

            user.password = await bcrypt.hash(newPassword,10);

            const resetPassword = true;
            user.resetPassword = resetPassword;

            await user.save();      
        }

        const user = req.user;
        let tablePassword = user.dataValues.password;
  
        const isPasswordValid = await user.validPassword(currentPassword, tablePassword);

        if(!isPasswordValid){
            return res.status(400).json({message: `Current Password is Incorrect`});
        }
        
        user.password = await bcrypt.hash(newPassword,10);

        const resetPassword = true;
        user.resetPassword = resetPassword;
        
        await user.save();

    }
    catch(err){
        res.status(500).json({error: `Internel Server Error`});
    }
}

exports.resetPassword = async (req, res) => {
    const {resetToken, newPassword } = req.body;

    const user = await User.findOne({ where : { resetToken }});
    const resetPassword = await user.dataValues.resetPassword;
    const email = await user.dataValues.email;
    if(resetPassword == true){
        return res.status(400).json(({message: 'Token Expired'}));
    }
    if(!user){
        return res.status(400).json({message: `Token Invalid`});
    }else{

        req.body.email=email;

        await this.updatePassword(req, res);       
    }
}