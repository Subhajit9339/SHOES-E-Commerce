const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }],
  orders: [
    {
      items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }],
      totalAmount: { type: Number, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }
  ],
  contact: { type: Number },
  picture: { type: String }
});

module.exports = mongoose.model('user', userSchema);