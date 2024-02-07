const express = require('express');
const session = require('express-session');
const passport = require('./middleware/passporMiddleware');
const userRoutes = require('./routes/userRoutes');
const { sequelize } = require('./models');
const User = require('./models/user');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(session({ secret:'olleh', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', userRoutes);

sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`server running on PORT:${PORT}`)
    });
});