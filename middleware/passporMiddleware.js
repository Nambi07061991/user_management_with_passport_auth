const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const sequelize = require('../models');
const {User} = require('../models');

passport.use(new LocalStrategy(async(username, password, done) => {
    console.log("Pass Middle")
    await User.findOne({ where : { username }})
    .then(async(user) => {
        let tablePassword = user.dataValues.password;
        let validPassword = await user.validPassword(password, tablePassword)
        if (!user || !validPassword){
            return done(null, false, { message: `Invalid username or password...`});
        }
       return done(null, user);
    })
    .catch((err) => done(err))
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findByPk(id)
    .then((user) => done(null, user))
    .catch((err) => done(err));
});

module.exports = passport;