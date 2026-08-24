const bcrypt = require('bcrypt');
const userModel = require('../models/user-model');
const { generateToken } = require('../generateToken');

module.exports.registerUser = async function (req, res) {
  try {
    let { fullname, email, password } = req.body;

    let existingUser = await userModel.findOne({ email });
    if (existingUser) {
      req.flash('error', 'User already registered, please login.');
      return res.redirect('/');
    }

    let hashedPassword = await bcrypt.hash(password, 10);

    let user = await userModel.create({
      fullname,
      email,
      password: hashedPassword,
    });

    let token = generateToken(user);
    res.cookie('token', token);

    req.flash('success', 'Registered successfully! Welcome to Scatch.');
    res.redirect('/shop');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/');
  }
};

module.exports.loginUser = async function (req, res) {
  try {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email });
    if (!user) {
      req.flash('error', 'Email or password incorrect');
      return res.redirect('/');
    }

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Email or password incorrect');
      return res.redirect('/');
    }

    let token = generateToken(user);
    res.cookie('token', token);

    req.flash('success', 'Logged in successfully');
    res.redirect('/shop');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/');
  }
};

module.exports.logout = function (req, res) {
  res.cookie('token', '');
  req.flash('success', 'Logged out successfully');
  res.redirect('/');
};
