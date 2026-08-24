const jwt = require('jsonwebtoken');
const ownerModel = require('../models/owner-model');

module.exports = async function (req, res, next) {
  // Read JWT token from cookies
  if (!req.cookies.token) {
    req.flash('error', 'You need to login as Owner to access this page.');
    return res.redirect('/owner/login');
  }

  try {
    let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY || 'secret');
    let owner = await ownerModel.findOne({ email: decoded.email }).select('-password');

    if (!owner) {
      req.flash('error', 'Access denied. Owner account required.');
      return res.redirect('/shop');
    }

    req.owner = owner;
    next();
  } catch (err) {
    req.flash('error', 'Invalid token or session expired.');
    res.redirect('/owner/login');
  }
};