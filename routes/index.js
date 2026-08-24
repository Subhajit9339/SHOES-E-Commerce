const express = require('express');
const router = express.Router();
const isloggedin = require('../middlewares/isLoggedin');
const productModel = require('../models/product-model');
const userModel = require('../models/user-model');

// 1. Home / Login Page
router.get('/', function (req, res) {
  let error = req.flash('error');
  let success = req.flash('success');
  res.render('index', { error, success });
});

// 2. Shop Page
router.get('/shop', isloggedin, async function (req, res) {
  try {
    let products = await productModel.find();
    let success = req.flash('success');
    let error = req.flash('error');
    res.render('shop', { products, success, error });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 3. Add to Cart
router.get('/addtocart/:id', isloggedin, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    let product = await productModel.findById(req.params.id);

    if (!product) {
      req.flash('error', 'Product not found.');
      return res.redirect('/shop');
    }

    user.cart.push(req.params.id);
    await user.save();

    req.flash('success', 'Added to cart successfully.');
    res.redirect('/shop');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 4. Remove from Cart
router.get('/removefromcart/:id', isloggedin, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    let itemIndex = user.cart.findIndex((itemId) => itemId.toString() === req.params.id);

    if (itemIndex > -1) {
      user.cart.splice(itemIndex, 1);
      await user.save();
      req.flash('success', 'Item removed from cart.');
    } else {
      req.flash('error', 'Item not found in cart.');
    }

    res.redirect('/cart');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 5. Cart Page
router.get('/cart', isloggedin, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.user.email }).populate('cart');

    let total = 0;
    let discount = 0;

    user.cart.forEach((item) => {
      total += Number(item.price || 0);
      discount += Number(item.discount || 0);
    });

    let shipping = user.cart.length > 0 ? 20 : 0;
    let bill = total - discount + shipping;

    let success = req.flash('success');
    let error = req.flash('error');

    res.render('cart', { user, total, discount, bill, shipping, success, error });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 6. Checkout & Payment Handler
router.post('/checkout', isloggedin, async function (req, res) {
  try {
    let { phone, address, paymentMethod, cardNumber, cardPin } = req.body;
    let user = await userModel.findOne({ email: req.user.email }).populate('cart');

    if (!user || !user.cart || user.cart.length === 0) {
      req.flash('error', 'Your cart is empty.');
      return res.redirect('/cart');
    }

    // Validate Online Payment Details
    if (paymentMethod === 'Online') {
      if (!cardNumber || cardNumber.length < 16 || !cardPin || cardPin.length < 3) {
        req.flash('error', 'Please enter a valid 16-digit card number and PIN.');
        return res.redirect('/cart');
      }
    }

    // Calculate total bill
    let total = 0;
    let discount = 0;
    user.cart.forEach((item) => {
      total += Number(item.price || 0);
      discount += Number(item.discount || 0);
    });
    let bill = total - discount + (user.cart.length > 0 ? 20 : 0);

    // Save Order Details
    user.orders.push({
      items: user.cart.map((item) => item._id),
      totalAmount: bill,
      address: address,
      phone: phone,
      paymentMethod: paymentMethod || 'COD',
      date: new Date()
    });

    // Clear cart and update Database
    user.cart = [];
    await user.save();

    req.flash('success', `Order placed successfully via ${paymentMethod === 'Online' ? 'Online Payment' : 'Cash on Delivery'}!`);
    res.redirect('/shop');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;