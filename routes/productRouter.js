const express = require('express');
const router = express.Router();
const upload = require('../config/multer-config');
const productModel = require('../models/product-model');
const isOwner = require('../middlewares/isOwner'); // Import owner protection

// PROTECTED ROUTE: Only logged in owners can create products
router.post('/create', isOwner, upload.single('image'), async function (req, res) {
  try {
    let { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

    let product = await productModel.create({
      image: req.file.buffer,
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor
    });

    req.flash('success', 'Product created successfully!');
    res.redirect('/owner/admin');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PROTECTED ROUTE: Delete product
router.get('/delete/:id', isOwner, async function (req, res) {
  try {
    await productModel.findByIdAndDelete(req.params.id);
    req.flash('success', 'Product deleted successfully!');
    res.redirect('/owner/admin');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;