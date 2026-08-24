const mongoose = require('mongoose');

const ownerSchema = mongoose.Schema({
  fullname: {
    type: String,
    minLength: 3,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product'
  }],
  picture: String,
  gstin: String,
});

module.exports = mongoose.model('owner', ownerSchema);
