const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const path = require('path');
const expressSession = require('express-session');
const flash = require('connect-flash');

require('dotenv').config();

// Routes
const ownerRouter = require('./routes/ownerRouter');
const productRouter = require('./routes/productRouter');
const usersRouter = require('./routes/usersRouter');
const indexRouter = require('./routes/index');

// MongoDB connection
require('./config/mongoose-connection');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.EXPRESS_SESSION_SECRET || 'secret'
    })
);

app.use(flash());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// EJS
app.set('view engine', 'ejs');

// Routes
app.use('/', indexRouter);
app.use('/owner', ownerRouter);
app.use('/users', usersRouter);
app.use('/products', productRouter);

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`SHOES E-Commerce Server Running on Port ${PORT}`);
});
