const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ownerModel = require('../models/owner-model');
const productModel = require('../models/product-model');
const isOwner = require('../middlewares/isOwner');

// Owner Registration Route (Only for development)
if (process.env.NODE_ENV === 'development') {
  router.post('/create', async function (req, res) {
    let owners = await ownerModel.find();
    if (owners.length > 0) {
      return res.status(504).send("You don't have permission to create a new owner.");
    }

    let { fullname, email, password } = req.body;
    let hashedPassword = await bcrypt.hash(password, 10);

    let createdOwner = await ownerModel.create({
      fullname,
      email,
      password: hashedPassword,
    });
    res.status(201).send(createdOwner);
  });
}

// Render Owner Login Page
router.get('/login', function (req, res) {
  let error = req.flash('error');
  let success = req.flash('success');
  res.render('owner-login', { error, success });
});

// Owner Login Action
router.post('/login', async function (req, res) {
  const { email, password } = req.body;
  let owner = await ownerModel.findOne({ email });

  if (!owner) {
    req.flash('error', 'Invalid owner credentials');
    return res.redirect('/owner/login');
  }

  let isMatch = await bcrypt.compare(password, owner.password);
  if (!isMatch) {
    req.flash('error', 'Invalid owner credentials');
    return res.redirect('/owner/login');
  }

  // Generate JWT token for owner session
  let token = jwt.sign({ email: owner.email, id: owner._id }, process.env.JWT_KEY);
  res.cookie('token', token);
  res.redirect('/owner/admin');
});

// Owner Logout Action
router.get('/logout', function (req, res) {
  res.cookie('token', '');
  req.flash('success', 'Logged out successfully');
  res.redirect('/owner/login');
});

// PROTECTED ROUTE: Admin Dashboard (Only Owner Can Access)
router.get('/admin', isOwner, async function (req, res) {
  try {
    let products = await productModel.find();
    let success = req.flash('success');
    res.render('admin', { products, success });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PROTECTED ROUTE: Create Product Form Page (Only Owner Can Access)
router.get('/createproduct', isOwner, function (req, res) {
  let success = req.flash('success');
  res.render('createproducts', { success });
});

module.exports = router;
